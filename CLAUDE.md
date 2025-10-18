# flatboard: Parametric Split Keyboard Generator

## Project Overview

TypeScript-based parametric design system for generating 3D-printable split keyboard cases. Uses scad-js to transpile TypeScript to OpenSCAD, enabling programmatic CAD modeling with modern language features.

## Core Technology Stack

- **TypeScript**: Configuration and geometry logic
- **scad-js v0.6.6**: TypeScript-to-OpenSCAD transpiler
- **fp-ts**: Functional programming patterns (pipe, Option, Either, Array utilities)
- **Bun**: Runtime and build system
- **OpenSCAD**: Final 3D model output

## Project Structure

```
src/                          # Core codebase (logic only)
├── index.ts                  # CLI with object literal command routing
├── build.ts                  # Build orchestration
├── config.ts                 # Configuration factory
├── profile-loader.ts         # Dynamic profile discovery
├── interfaces.ts             # TypeScript type definitions
├── base-params.ts            # Default configuration
├── switches.ts               # Switch specifications (Choc, MX)
├── connector-specs.ts        # Connector definitions (USB-C, TRRS)
├── layout.ts                 # Layout geometry calculations
├── switch-sockets.ts         # Switch cutout generation
├── walls.ts                  # Wall geometry
├── connector.ts              # Connector system with face mapping
├── top.ts                    # Top plate assembly (fp-ts pipe)
├── bottom.ts                 # Bottom case assembly (fp-ts pipe)
├── bottom-pads-sockets.ts    # Socket structures (pure functional)
└── utils.ts                  # Core utilities (trimmed)

profiles/                     # User-editable keyboard profiles (data)
├── index.ts                  # Auto-discovery using Bun.Glob
├── split-36.ts               # 36-key split keyboard
├── macropad-3x3.ts           # 3x3 macropad
└── test-single-choc.ts       # Single key test

dist/
├── top.scad                  # Generated top plate
├── bottom.scad               # Generated bottom case
└── complete.scad             # Assembly preview
```

## Configuration System

Configuration flows through modular layers:

```
profiles/*.ts → PROFILES (auto-discovered) → SWITCH_SPECS → KeyboardConfig
```

### Architecture Separation

- **`profiles/`**: User-editable keyboard definitions (data layer)
  - Each profile is a separate `.ts` file
  - Add a new keyboard by adding a `.ts` file to this directory
  - `profiles/index.ts` scans and imports all profiles using `Bun.Glob`

- **`src/`**: Core codebase (logic layer)
  - `profile-loader.ts`: Bridges profiles with the codebase
  - `config.ts`: Configuration factory and merging
  - No profile data stored in source code

This separation allows users to add/modify profiles without touching the codebase.

### Row Layout System

Each row defined by three parameters:
```typescript
rowLayout: [
  { start: 0, length: 3, offset: 5 },   // Row 0: 3 keys, 5mm stagger
  { start: -1, length: 4, offset: 0 },  // Row 1: starts at column -1
  { start: 1, length: 3, offset: 2 }    // Row 2: starts at column 1
]
```

- `start`: Starting column (can be negative)
- `length`: Number of keys
- `offset`: Column stagger in millimeters

### Switch Support

Automatic parameter inheritance based on switch type:

**Choc**: `cutoutSize: 13.8mm`, `plateThickness: 1.6mm`, `pitch: 18.0mm`
**MX**: `cutoutSize: 13.9mm`, `plateThickness: 5.0mm`, `pitch: 18.6mm`

### Connector System

Connectors can be placed on any face (top/bottom/left/right) with 0-1 positioning along that edge.

**Important**: Coordinate system is rotated 90° clockwise. The connector face mapping in `connector.ts` accounts for this:
- User "top" → Physical left
- User "right" → Physical top
- User "bottom" → Physical right
- User "left" → Physical bottom

Rotations are adjusted by -90° to compensate for coordinate transformation.

## Code Patterns

### Functional Programming with fp-ts

The codebase uses fp-ts for functional composition:

```typescript
// Pipe for sequential operations
return pipe(
  config.enclosure.bottomPadsSockets ?? [],
  O.fromPredicate(sockets => sockets.length > 0),
  O.map(sockets => processSocketStructures(sockets)),
  O.getOrElse(() => ({ reinforcements: null, cutouts: null }))
);
```

### Object Literal Pattern

Replaced switch statements and if-else chains with object literals:

```typescript
const positionCalculators = {
  top: () => ({ x: wallThickness, y: calculateY(), z, rotation: [0, 0, -90] }),
  right: () => ({ x: calculateX(), y: wallThickness, z, rotation: [0, 0, 0] }),
  bottom: () => ({ x: plateWidth + wallThickness, y: calculateY(), z, rotation: [0, 0, 90] }),
  left: () => ({ x: calculateX(), y: plateHeight + wallThickness, z, rotation: [0, 0, 180] }),
};

return positionCalculators[face]();
```

This pattern appears in:
- `connector.ts`: Face positioning and geometry creation
- `bottom-pads-sockets.ts`: Anchor positioning, boundary calculation, shape creation
- `index.ts`: Command routing

### Pure Functions

Modules like `bottom-pads-sockets.ts` use pure functional patterns:
- No mutations (eliminated `forEach`, `push`, mutable arrays)
- Extracted pure helper functions (`createSocketGeometry`)
- Functional composition with `pipe`, `A.map`, `O.fromPredicate`

## Key Modules

### `connector.ts`
Generic connector system with type-safe specifications. Handles coordinate system rotation for correct face placement. Uses object literals for position and geometry calculations.

### `layout.ts`
Mathematical layout engine with rotation-aware calculations. Handles split keyboard mirroring and thumb cluster positioning.

### `top.ts` and `bottom.ts`
Assembly modules using fp-ts `pipe` for conditional geometry composition. Clean separation of geometry generation and boolean operations.

### `bottom-pads-sockets.ts`
Socket structure generation using pure functional patterns. Creates reinforcements and cutouts for silicon pad sockets with anchor-based positioning.

### `utils.ts`
Core utilities only (trimmed from 262 to 135 lines):
- `deepMerge`: Configuration merging returning `Either<string, T>`
- `convertDegreesToRadians`: Angle conversion
- `calculateAbsoluteCosineSine`: Rotation calculations
- `calculateHalfIndex`: Layout math
- `rotatePoint`: Point rotation with fp-ts Option
- `createRoundedSquare`: Hull-based rounded rectangles

All utilities use fp-ts patterns. No backward compatibility wrappers.

## scad-js Patterns

```typescript
// 2D to 3D extrusion
const shape2D = createRoundedSquare(width, height);
const shape3D = shape2D.linear_extrude(thickness);

// Boolean operations
const result = difference(
  union(base, feature),
  cutout
);

// Transformations
const positioned = geometry
  .rotate([0, 0, 90])
  .translate([x, y, z]);

// Serialize to OpenSCAD
writeFileSync('output.scad', result.serialize({$fn: 64}));
```

## Output Files

### `top.scad`
Top plate with switch cutouts, mounting frames, and connector cutouts. Walls extend downward.

### `bottom.scad`
Bottom case with electronics cavity, socket structures, and connector cutouts. Walls extend upward.

### `complete.scad`
Assembly preview showing both parts together.

## Split Wall Architecture

- Top plate: 6mm walls extending downward
- Bottom case: 6mm walls extending upward
- Assembly: Walls meet for 12mm total enclosure height
- Designed for FDM printing without supports

## Usage

```bash
bun run build              # Build default profile
bun run build -- ortho-36  # Build specific profile
bun run list               # List available profiles
```

Output goes to `dist/` directory.

## Design Principles

- Everything calculated from configuration (no hardcoded positions)
- Modular architecture with clear separation of concerns
- Type-safe with full TypeScript interfaces
- Functional patterns for maintainability
- Manufacturing constraints built into geometry generation
- Single source of truth for all dimensions

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
