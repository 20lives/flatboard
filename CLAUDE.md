# flatboard: Parametric Split Keyboard Generator

## Project Overview

TypeScript-based parametric design system for generating 3D-printable split keyboard cases. Uses scad-js to transpile TypeScript to OpenSCAD, enabling programmatic CAD modeling with modern language features.

## Core Technology Stack

- **TypeScript**: Configuration and geometry logic
- **scad-js v0.6.6**: TypeScript-to-OpenSCAD transpiler
- **fp-ts**: Functional programming patterns (pipe, Option, Either, Array utilities)
- **Bun**: Runtime and build system with Bun.Glob for profile discovery
- **OpenSCAD**: Final 3D model output

## Project Structure

```
src/
├── index.ts                  # CLI with object literal command routing
├── build.ts                  # Build orchestration with 3 modes
├── config.ts                 # Configuration factory with fp-ts patterns
├── profile-loader.ts         # Bridge between profiles/ and src/
├── interfaces.ts             # TypeScript type definitions
├── switches.ts               # Switch specifications (Choc, MX)
├── connector-specs.ts        # Connector definitions (USB-C, TRRS, power button)
├── layout.ts                 # Layout geometry calculations
├── switch-sockets.ts         # Switch cutout generation
├── connector.ts              # Connector system with face mapping
├── top.ts                    # Top plate assembly (fp-ts pipe)
├── bottom.ts                 # Bottom case assembly (fp-ts pipe)
├── bottom-pads-sockets.ts    # Socket structures (pure functional)
└── utils.ts                  # Core utilities

profiles/
├── index.ts                  # Auto-discovery with Bun.Glob
├── split-36.ts              # 36-key split ergonomic keyboard
├── macropad-3x3.ts          # 9-key macropad
└── test-single-choc.ts      # Single key test configuration

dist/
├── top.scad                  # Generated top plate
├── bottom.scad               # Generated bottom case
└── complete.scad             # Assembly preview
```

## Configuration System

### Profile Separation

Keyboard configurations are separated from the codebase in the `profiles/` directory:

- **User space**: `profiles/` contains keyboard definitions (data only)
- **Code space**: `src/` contains the parametric generator logic
- **Auto-discovery**: `profiles/index.ts` uses Bun.Glob to scan and dynamically import all profile files

```typescript
// profiles/index.ts
const glob = new Glob('*.ts');
const profileFiles = Array.from(glob.scanSync({ cwd: __dirname }))
  .filter((file) => file !== 'index.ts');

for (const file of profileFiles) {
  const filePath = join(__dirname, file);
  const module = await import(filePath);
  const profileName = file.replace(/\.ts$/, '');

  if (module.profile) {
    profileEntries.push([profileName, module.profile]);
  }
}
```

### Configuration Flow

```
profiles/*.ts → PROFILES → profile-loader.ts → config.ts → SWITCH_SPECS → KeyboardConfig
```

1. Profile files export a `profile` constant of type `ParameterProfile`
2. `profiles/index.ts` dynamically imports all profiles using Bun.Glob
3. `profile-loader.ts` provides type-safe access to profiles
4. `config.ts` merges profile with switch specifications using fp-ts deepMerge
5. Final `KeyboardConfig` contains all required parameters

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
- `thumbAnchor`: Optional anchor key index for thumb cluster positioning

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

**Common patterns:**
- `pipe()`: Sequential transformations
- `O.fromNullable()`: Convert nullable to Option
- `O.fromPredicate()`: Convert based on condition
- `O.map()`: Transform Some values
- `O.getOrElse()`: Provide default for None
- `E.Either`: Error handling with Left/Right
- `A.map()`, `A.filter()`, `A.chain()`: Array operations

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

Modules use pure functional patterns:
- No mutations (eliminated `forEach`, `push`, mutable arrays)
- Extracted pure helper functions
- Functional composition with `pipe`, `A.map`, `O.fromPredicate`

Example from `layout.ts`:
```typescript
const createMatrixKey = (
  rowIndex: number,
  keyIndex: number,
  row: { start: number; length: number; offset?: number },
  matrixSpacing: number,
): KeyPlacement => ({
  pos: {
    x: (row.start + keyIndex) * matrixSpacing + (row.offset ?? 0),
    y: rowIndex * matrixSpacing,
  },
  rot: 0,
});
```

## Key Modules

### `profiles/index.ts`
Auto-discovery system using Bun.Glob. Scans all `*.ts` files in `profiles/` directory and dynamically imports them. Filters out `index.ts` itself.

### `profile-loader.ts`
Bridge between `profiles/` and `src/`. Provides:
- `getProfileNames()`: List all available profiles
- `profileExists()`: Check if profile exists
- `getProfile()`: Get profile by name

### `config.ts`
Configuration factory that merges profiles with switch specifications using fp-ts patterns:
```typescript
const getSwitchSpec = (switchType: string): O.Option<SwitchSpec> =>
  pipe(SWITCH_SPECS[switchType], O.fromNullable);

function createFinalConfig(profileName: string): KeyboardConfig {
  return pipe(
    getProfile(profileName),
    O.fold(
      () => { throw new Error(`Profile '${profileName}' not found`); },
      (profile) => pipe(
        getSwitchSpec(profile.switch.type),
        O.fold(
          () => createConfigFromProfile(profile),
          (switchSpec) => pipe(
            deepMerge(profile, switchSpec),
            E.getOrElse(() => profile),
            createConfigFromProfile,
          ),
        ),
      ),
    ),
  );
}
```

### `connector.ts`
Generic connector system with type-safe specifications. Handles coordinate system rotation for correct face placement. Uses object literals for position and geometry calculations.

**Geometry creators:**
- `pill`: Two circles connected with hull (USB-C)
- `circle`: Single circular cutout (TRRS, power button)
- `square`: Rectangular cutout

### `layout.ts`
Mathematical layout engine with rotation-aware calculations:
- `buildLayout()`: Creates matrix keys and thumb cluster using pure functions
- `applyGlobalRotation()`: Rotates entire layout by baseDegrees
- `getLayout()`: Calculates final positions with edge margins
- `calculatePlateDimensions()`: Computes plate size from key bounds

Handles split keyboard mirroring and thumb cluster positioning with anchor-based offsets.

### `top.ts`
Top plate assembly using fp-ts `pipe` for conditional geometry composition:
```typescript
return pipe(
  union(difference(wallBox, switchCutouts), switchFrame, reinforcementFrame),
  (geometry) => connectorCutouts ? difference(geometry, connectorCutouts) : geometry,
);
```

Creates:
- Outer wall box
- Switch cutouts (outer square for mounting)
- Switch frame (inner square for switch body)
- Reinforcement frame (additional support)
- Connector cutouts

### `bottom.ts`
Bottom case assembly using fp-ts `pipe`:
```typescript
return pipe(
  baseGeometry,
  (geometry) => socketStructures.reinforcements ? union(geometry, socketStructures.reinforcements) : geometry,
  (geometry) => connectorCutouts ? difference(geometry, connectorCutouts) : geometry,
  (geometry) => socketStructures.cutouts ? difference(geometry, socketStructures.cutouts) : geometry,
);
```

Creates:
- Base floor plate
- Inner walls extending upward
- Socket reinforcements (additive)
- Connector cutouts
- Socket cutouts (subtractive)

### `bottom-pads-sockets.ts`
Socket structure generation using pure functional patterns. Creates reinforcements and cutouts for silicon pad sockets with anchor-based positioning.

**Features:**
- Anchor-based positioning (`top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`)
- Size-aware boundary calculations including reinforcement and wall thickness
- Additive reinforcement (thickness and height added to socket dimensions)
- Support for round and square socket shapes

Object literal pattern for:
- `calculateSocketBoundary()`: Boundary calculations
- `calculateAnchorPosition()`: Anchor positioning
- `createSocketShapes()`: Shape creation

### `bottom-magsafe-ring.ts`
Magnetic mounting for tenting using MagSafe ring socket with phone holders. Center-positioned with configurable X/Y offset.

**Standard MagSafe dimensions:**
- Outer diameter: 55mm
- Inner diameter: 50mm
- Depth: 0.5mm

**Configuration:**
```typescript
magsafeRing: {
  clearance: 0.2,              // Fit adjustment (positive = looser)
  reinforcement: {
    outer: 2.0,                // Thickness around outer diameter
    inner: 2.0,                // Grip margin on inner diameter
    height: 0.5,               // Additional height for ring
  },
  position: {
    offset: { x: 0, y: 0 },    // Offset from keyboard center
  },
}
```

### `utils.ts`
Core utilities (135 lines):
- `deepMerge<T>()`: Configuration merging returning `Either<string, T>`
- `convertDegreesToRadians()`: Angle conversion
- `calculateAbsoluteCosineSine()`: Rotation calculations
- `calculateHalfIndex()`: Layout math
- `rotatePoint()`: Point rotation with fp-ts Option
- `createRoundedSquare()`: Hull-based rounded rectangles with validation

All utilities use fp-ts patterns. No backward compatibility wrappers.

### `build.ts`
Build orchestration with three modes:

**Production mode** (default):
- Outputs to `dist/<profile>-<hash>/`
- Timestamp hash using base36: `now.getTime().toString(36).slice(-6)`
- Preserves build history
- SCAD files only

**Development mode** (`build:dev`):
- Outputs to `dist/` (overwrites)
- Watch mode support
- Open `dist/complete.scad` in OpenSCAD for live preview

**STL mode** (`build:stl`):
- Outputs to `dist/<profile>-<hash>/`
- Generates both SCAD and STL files using `modelGeometry.render()`
- Ready for 3D printing

Output includes file tree with sizes:
```
dist/split-36-w92ivk/
├── bottom.scad (7.9K)
├── bottom.stl (52.8K)
├── complete.scad (5.9K)
├── complete.stl (49.6K)
├── top.scad (3.5K)
└── top.stl (50.5K)
```

### `index.ts`
CLI with object literal command routing:
```typescript
const commands: Record<string, () => void> = {
  list: () => listProfiles(),
  build: () => handleBuild(commandArgs[0], false, false),
  'build:dev': () => handleBuild(commandArgs[0], true, false),
  'build:stl': () => handleBuild(commandArgs[0], false, true),
  help: () => console.log('...'),
  undefined: () => { /* handle no command */ },
};

const executeCommand = commands[command ?? 'undefined'];
if (executeCommand) {
  executeCommand();
}
```

Error handling shows available profiles when profile not found.

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

// Hull for organic shapes
const rounded = hull(
  circle.translate([x1, y1, 0]),
  circle.translate([x2, y2, 0]),
);

// Serialize to OpenSCAD
writeFileSync('output.scad', result.serialize({$fn: 64}));

// Render to STL
const stlData = await result.render({$fn: 64});
writeFileSync('output.stl', stlData);
```

## Output Files

### `top.scad` / `top.stl`
Top plate with:
- Switch cutouts for mounting
- Switch frames for switch body
- Reinforcement frames for structural support
- Connector cutouts
- Walls extending downward (6mm default)

### `bottom.scad` / `bottom.stl`
Bottom case with:
- Base floor plate
- Electronics cavity
- Socket structures (reinforcements and cutouts)
- Connector cutouts
- Walls extending upward (6mm default)

### `complete.scad` / `complete.stl`
Assembly preview showing both parts together. Top plate translated vertically by `bottomThickness` to show proper assembly.

## Split Wall Architecture

- Top plate: walls extending downward from switch plate
- Bottom case: walls extending upward from floor plate
- Assembly: Walls meet for snap-fit enclosure
- No screws required
- Designed for FDM printing without supports (with exceptions for switch cutouts and optional socket structures)

## Usage

```bash
# List available profiles
bun run list

# Build SCAD files (production)
bun run build -- <profile>

# Build with watch mode (development)
bun run build:dev -- <profile>

# Build SCAD + STL files (production)
bun run build:stl -- <profile>

# Show help
bun run help

# Remove generated files
bun run clean
```

## Design Principles

1. **Everything calculated from configuration**: No hardcoded positions
2. **Modular architecture**: Clear separation of concerns (profiles vs code)
3. **Type-safe**: Full TypeScript interfaces throughout
4. **Functional patterns**: fp-ts for maintainability and composability
5. **Manufacturing constraints**: Built into geometry generation
6. **Single source of truth**: All dimensions derived from configuration
7. **Auto-discovery**: No manual registration of profiles
8. **Pure functions**: Predictable, testable, composable

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
