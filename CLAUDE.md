# laptop-ortho-36: Parametric Split Keyboard System

## Project Overview

This project is a sophisticated parametric design system for generating complete 3D printable keyboard assemblies for split ortholinear keyboards. It uses **scad-js** to write TypeScript code that transpiles to OpenSCAD, enabling powerful programmatic 3D CAD modeling with modern programming features and professional-grade build automation.

## Architecture Evolution

The project has evolved from a single-file parametric generator into a production-ready keyboard design system with modular architecture, profile management, and multi-switch support.

### Core Technology Stack
- **TypeScript**: Main programming language for parametric design
- **scad-js v0.6.6**: TypeScript-to-OpenSCAD transpiler  
- **Bun**: Runtime environment and CLI execution
- **OpenSCAD**: Final 3D model output format

### Design Philosophy
The codebase demonstrates advanced parametric thinking through:
- **Modular architecture**: Clean separation of concerns across specialized modules
- **Configuration inheritance**: Hierarchical profile system with switch type support
- **Mathematical precision**: Rotation-aware layout calculations
- **Manufacturing focus**: Professional mounting system with heat inserts
- **CLI integration**: Command-line interface for build automation

## Project Structure

```
src/
├── index.ts              # CLI interface and command routing
├── build.ts              # Build orchestration and file generation  
├── config.ts             # Main configuration factory and exports
├── interfaces.ts         # TypeScript interfaces and type definitions
├── base-params.ts        # Base default configuration parameters
├── switches.ts           # Switch specifications (Choc, MX)
├── connector-specs.ts    # Connector specifications (USB-C, TRRS)
├── keyboard-profiles.ts  # Predefined keyboard profiles
├── profile-utils.ts      # Profile management utilities
├── layout.ts             # Keyboard layout geometry and mathematics
├── switch-sockets.ts     # Switch cutout geometry generation
├── walls.ts              # Case wall geometry
├── connector.ts          # Generic connector system
├── top.ts               # Top plate assembly
├── bottom.ts            # Bottom case assembly
└── utils.ts             # Utility functions

dist/                     # Generated output files
├── top.scad             # Top plate OpenSCAD file
├── bottom.scad          # Bottom case OpenSCAD file
└── complete.scad        # Complete assembly
```

## Configuration System

### Modular Configuration Architecture
The system uses a sophisticated modular configuration architecture with TypeScript interfaces:

```
BASE_PARAMETERS → KEYBOARD_PROFILES → SWITCH_SPECS → Final KeyboardConfig
```

#### Modular Configuration Files
- **`interfaces.ts`**: Complete TypeScript interfaces for all configuration types
- **`base-params.ts`**: BASE_PARAMETERS with comprehensive defaults
- **`switches.ts`**: SWITCH_SPECS for Choc vs MX with auto-inheritance  
- **`connector-specs.ts`**: CONNECTOR_SPECS for USB-C, TRRS, and extensible types
- **`keyboard-profiles.ts`**: Predefined keyboard profiles with partial overrides
- **`config.ts`**: Main factory orchestrating the modular system

#### Advanced Row Layout System
The new `rowLayout` system provides pixel-perfect control over key placement:

```typescript
rowLayout: [
  { start: 0, length: 3, offset: 5 },   // Row 0: 3 keys, 5mm column stagger
  { start: -1, length: 4, offset: 0 },  // Row 1: 4 keys, starts at grid -1
  { start: 1, length: 3, offset: 2 }    // Row 2: 3 keys, offset right + stagger
]
```

**Key Features:**
- **`start`**: Starting grid position (can be negative for precise placement)
- **`length`**: Number of keys in each row
- **`offset`**: Column stagger amount in millimeters
- **Full TypeScript support**: Complete interface definitions with IntelliSense

### Switch Type Support
The system supports both **Kailh Choc** and **Cherry MX** switches with automatic parameter inheritance:

**Choc Specification:**
- `cutoutSize: 13.8mm`, `plateThickness: 1.6mm`, `totalThickness: 8.0mm`, `pitch: 18.0mm`
- Optimized for low-profile builds

**MX Specification:**  
- `cutoutSize: 13.9mm`, `plateThickness: 5.0mm`, `totalThickness: 7.0mm`, `pitch: 18.6mm`
- Standard Cherry MX compatibility

### Predefined Profiles
- **`ortho-36`**: 36-key split (rowLayout system + 3 thumb) - Choc switches
- **`ortho-36-mx`**: Same layout optimized for MX switches  
- **`ortho-4x10`**: 40-key single-side layout with 10-row configuration
- **`test-single-choc/mx`**: Single key test profiles for both switch types
- **`test-custom-rows`**: Demo of simple custom row layouts  
- **`test-advanced-layout`**: Demo of advanced grid positioning with negative start values
- **`test-multi-connectors`**: Demo of multiple connector types and positioning

## Key Modules

#### `interfaces.ts` - TypeScript Type System
- **Complete type definitions**: All configuration interfaces with full IntelliSense support
- **KeyboardConfig interface**: Main configuration type with nested structure
- **RowLayoutItem interface**: Precise row definition with start, length, offset
- **Modular types**: Switch, connector, and enclosure specifications

#### `layout.ts` - Mathematical Layout Engine  
- **Unified rowLayout system**: Single algorithm supporting all layout types
- **Ergonomic positioning**: Sophisticated thumb cluster with per-key rotation/offset
- **Split keyboard logic**: Automatic left/right mirroring with rotation inversion  
- **Rotation-aware geometry**: Precise bounding box calculations for rotated keys
- **Constraint-based positioning**: All coordinates calculated from rowLayout definitions

#### `switch-sockets.ts` - Modular Cutout System
- **Switch hole cutouts**: Precise switch mounting holes
- **Thin zone cutouts**: Socket clearance zones around switches
- **Frame boundary cutouts**: Structural frame boundaries
- **Parametric geometry**: All cutouts scale with configuration changes

#### `connector.ts` - Generic Connector System
- **Multiple connector types**: USB-C (pill geometry), TRRS (circle geometry)
- **Configurable placement**: Any face (top/bottom/left/right) with precise positioning  
- **Smart positioning**: Automatic clearance from plate thickness and wall boundaries
- **Type-safe configuration**: Connector specifications with geometry definitions

#### `walls.ts` - Enclosure Wall System
- **Parametric walls**: Configurable thickness and height
- **Top/bottom coordination**: Separate wall geometries for each component
- **Boolean operations**: Clean internal cavities with proper clearances

#### `top.ts` & `bottom.ts` - Assembly Modules
- **Component integration**: Combines layout, walls, and switch systems
- **Manufacturing ready**: Proper tolerances and print-friendly geometry

#### `build.ts` - Build Orchestration
- **Profile-specific building**: Dynamic configuration per build
- **Multiple outputs**: `.scad` files + optional `.stl` generation
- **Comprehensive logging**: Dimensions, key count, thickness reporting

## Understanding scad-js

**scad-js** is a powerful library that bridges TypeScript and OpenSCAD:

### Core Capabilities
- **Type Safety**: Full TypeScript support with proper vector and primitive typing
- **Functional Composition**: Chain transformations like `.translate()`, `.rotate()`, `.linear_extrude()`
- **Boolean Operations**: `union()`, `difference()`, `intersection()` for complex geometry
- **Primitives**: `cube()`, `sphere()`, `cylinder()`, `polygon()` with parametric sizing
- **2D/3D Workflows**: 2D shapes can be extruded to 3D with `linear_extrude()`

### Design Pattern Used
```typescript
// 2D base shapes
const shape2D = polygon(points).translate([x, y, 0]);

// Extrude to 3D
const shape3D = shape2D.linear_extrude(height);

// Boolean operations
const final = difference(union(base, feature), cutout);

// Serialize to OpenSCAD
writeFileSync('model.scad', final.serialize({$fn: 64}));
```

## Technical Innovations

### 1. Modular TypeScript Architecture
Complete separation of concerns with full type safety:
- **Modular configuration**: 7 focused files instead of 1 monolithic config
- **TypeScript interfaces**: Complete type definitions for all configuration options
- **Row layout system**: Unified `{ start, length, offset }` system for all keyboard layouts
- **Type-safe connectors**: Strongly typed connector specifications with geometry definitions

### 2. Advanced Row Layout System
Revolutionary approach to keyboard layout definition:
```typescript
rowLayout: [
  { start: -1, length: 3, offset: 2 },  // Can start at negative grid positions
  { start: 1, length: 4, offset: 0 },   // Each row independently positioned
  { start: 0, length: 3, offset: 1 }    // Perfect control over stagger and placement
]
```

### 3. Split Wall Architecture
The enclosure uses a unique split wall design:
- **Top plate**: Has 6mm walls extending downward
- **Bottom case**: Has 6mm walls extending upward
- **Assembly**: Walls meet to form complete 12mm enclosure height
- **Benefits**: Better printing orientation and easier assembly

### 4. Parametric Switch Mounting
Advanced switch mounting with frame structures:
- **Individual frames**: Each switch gets its own mounting frame
- **Thin zone cutouts**: Precise plate contact areas
- **Frame reinforcement**: Additional material around switch perimeter
- **Boolean optimization**: Efficient CSG operations

### 5. Rotation-Aware Calculations
Handles arbitrary key rotations throughout the system:
```typescript
const rotationExtent = 0.5 * absoluteCosineSine(normalizedAngle) * keySize;
```

### 6. Modular Boolean Operations
Clean separation of geometry generation and assembly:
```typescript
// Top plate assembly
const plateComponents = [plateWithFrameCutouts, frameStructures];
const topWalls = createTopWalls(plateWidth, plateHeight);
return union(...plateComponents, topWalls);

// Bottom case assembly
return difference(
  union(bottomPlate, bottomWalls),
  union(...cornerScrewSockets)
);
```

## Generated Output

The system generates three OpenSCAD files:

### 1. `top-plate.scad`
- Complete switch mounting plate with heat insert corner mounts
- Integrated top walls extending downward
- Ready for switch installation and heat insert pressing

### 2. `bottom-case.scad` 
- Electronics enclosure with cavity and cable management
- Corner screw socket posts for assembly
- USB cutouts and rubber feet positioning

### 3. `complete-enclosure.scad`
- Assembled view showing both parts together
- Proper Z-positioning for visualization
- Complete keyboard enclosure

## Current Configuration

**Layout**: 36-key split (15 per hand + 3 thumb keys each)
**Dimensions**: ~252mm × 118mm plate
**Wall System**: 6mm + 6mm split walls (12mm total height)
**Electronics**: Internal cavity with cable channel

## Usage

Generate all files:
```bash
bun run generate.ts
```

This creates:
- `top-plate.scad` - Top plate with heat insert mounts
- `bottom-case.scad` - Bottom enclosure with screw sockets  
- `complete-enclosure.scad` - Assembled view

## Assembly Process

1. **3D Print**: Print top plate and bottom case separately
2. **Heat Inserts**: Press M3 heat inserts into top plate corner mounts
3. **Electronics**: Install switches, wiring, and controller in bottom case
4. **Assembly**: Align top plate over bottom case and secure with M3 screws
5. **Finishing**: Add rubber feet and connect cables

## Design Philosophy

This project exemplifies modular parametric design:
- **Everything is calculated**: No magic numbers or manual positioning
- **Modular architecture**: Clean separation enables easy modification
- **Single source of truth**: All parameters flow from config.ts
- **Manufacturing-ready**: Designed for FDM 3D printing constraints
- **Assembly-focused**: Split design enables easy electronics access

The result is a completely parametric, manufacturable keyboard enclosure that can be instantly reconfigured for different layouts, sizes, or ergonomic preferences while maintaining structural integrity and ease of assembly.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
