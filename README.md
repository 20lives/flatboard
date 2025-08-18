# flatboard

**A Parameterized ortholinear split lowprofile custom 3d printed keyboard generator**

Built with TypeScript and SCAD-JS, flatboard is a **configurable, parameterized, modular** system for generating custom ortholinear split keyboards with professional mounting systems and multi-switch support.

## 🚀 Features

- **🔧 Fully Configurable** - Every dimension, angle, and parameter can be customized
- **📐 Parametric Design** - Mathematical precision with constraint-based geometry
- **🧩 Modular Architecture** - Clean separation of concerns across specialized modules
- **⌨️ Split Keyboard Support** - Ergonomic left/right hand layouts with automatic mirroring
- **🔌 Multiple Switch Support** - Kailh Choc low-profile and Cherry MX compatibility
- **🔩 Professional Mounting** - Heat insert + screw assembly system (M3 threaded)
- **📏 Ortholinear Layout** - Grid-based key arrangements for optimal typing
- **📊 Custom Row Stagger** - Configurable column offsets for ergonomic comfort
- **👍 Custom Thumb Cluster** - Individual key positioning and rotation
- **📦 Complete Output** - Generate both SCAD and STL files
- **💻 Easy Customization** - Simple JavaScript/TypeScript configuration

## 🛠️ Technology Stack

- **TypeScript** - Type-safe parametric design
- **SCAD-JS v0.6.6** - TypeScript-to-OpenSCAD transpiler
- **Bun** - Fast runtime and build system
- **OpenSCAD** - Final 3D model generation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flatboard

# Install dependencies
bun install
```

### Basic Usage

```bash
# Build with default profile (36-key split)
bun run build

# List available profiles
bun run list

# Build specific profile
bun run build -- ortho-36-mx

# Clean generated files
bun run clean

# Development mode (watch)
bun run dev
```

### Available Profiles

```bash
bun run list
```

**Built-in Profiles:**
- `ortho-36` - 36-key split (3×5 + 3 thumb) [Choc]
- `ortho-36-mx` - 36-key split optimized for Cherry MX
- `test-single-choc` - Single key test layout (Choc)
- `test-single-mx` - Single key test layout (MX)
- `ortho-4x10` - 43-key single-side layout

## 📐 Configuration System

### Profile-Based Design

The system uses a hierarchical configuration with inheritance:

```
BASE_PARAMETERS → PROFILE_OVERRIDES → SWITCH_SPECS → Final CONFIG
```

### Creating Custom Profiles

Add new profiles to `src/config.ts`:

```typescript
'my-custom': {
  cols: 4,                    // 4 columns instead of 3
  rows: 6,                    // 6 rows
  centerGap: 30.0,            // Wider split
  baseRotationDegrees: -15.0, // Different tilt
  switchType: 'mx',           // Cherry MX switches
  thumbKeys: 2,               // 2 thumb keys per hand
  buildSide: 'both',          // Build both sides
},
```

### Key Parameters

**Layout:**
- `cols`, `rows` - Matrix dimensions per hand
- `centerGap` - Distance between split halves
- `baseRowOffsets` - Column stagger pattern
- `pitch` - Key spacing

**Switch Support:**
- `switchType: 'choc'` - Kailh Choc low-profile (13.8mm cutout, 1.6mm plate)
- `switchType: 'mx'` - Cherry MX standard (13.9mm cutout, 5.0mm plate)

**Thumb Cluster:**
- `thumbKeys` - Number of thumb keys per hand
- `thumbXOffset`, `thumbYOffset` - Cluster position
- `thumbClusterRotation` - Overall cluster angle
- `thumbPerKeyRotation` - Individual key rotations

**Physical Design:**
- `totalThickness` - Overall plate thickness
- `wallThickness` - Case wall thickness
- `topWallHeight`, `bottomWallHeight` - Case height

## 🏗️ Architecture

### Modular Design

```
src/
├── config.ts          # Configuration system & profiles
├── layout.ts          # Keyboard layout & mathematics
├── switch-sockets.ts  # Switch cutout generation
├── mounting.ts        # Heat insert & screw hardware
├── walls.ts           # Case wall geometry
├── top.ts            # Top plate assembly
├── bottom.ts         # Bottom case assembly
└── build.ts          # Build orchestration
```

### Generated Output

**Files Created:**
- `dist/top.scad` - Top plate with heat insert mounts
- `dist/bottom.scad` - Bottom case with screw sockets
- `dist/complete.scad` - Complete assembly view

## 🔩 Hardware & Assembly

### Professional Mounting System

- **Heat Insert Mounts** - M3 threaded inserts in top plate corners
- **Screw Sockets** - M3 clearance holes in bottom case posts
- **Split Walls** - 6mm + 6mm interlocking wall system (12mm total height)

### Assembly Process

1. **3D Print** - Print top and bottom parts separately
2. **Heat Inserts** - Press M3 heat inserts into top plate corner mounts
3. **Electronics** - Install switches, wiring, and controller in bottom case
4. **Assembly** - Align and secure with M3 screws
5. **Finishing** - Add rubber feet and connect cables

## 🎯 Design Philosophy

** Parametric Design:**
- **Everything calculated** - No magic numbers or manual positioning
- **Single source of truth** - All dimensions flow from configuration
- **Mathematical precision** - Trigonometric layout calculations
- **Manufacturing ready** - Designed for FDM 3D printing constraints
- **Modular architecture** - Clean separation enables easy modification

## 📊 Technical Specifications

**Current Default (ortho-36):**
- Layout: 36 keys total (15 per hand + 3 thumb keys each)
- Dimensions: ~252mm × 118mm plate
- Thickness: 8mm total (1.6mm skin + 6.4mm structure)
- Mounting: 4 corner M3 heat inserts
- Switch Support: Kailh Choc low-profile
- Ergonomics: -77° base rotation, custom thumb cluster

## 🔍 Advanced Features

### Mathematical Layout Engine
- **Rotation-aware calculations** - Handles arbitrary key rotations
- **Constraint-based positioning** - All coordinates calculated, not hardcoded
- **Split keyboard logic** - Automatic left/right mirroring with rotation inversion

### Switch Socket System
- **Switch hole cutouts** - Precise mounting holes
- **Thin zone clearance** - Socket clearance zones
- **Frame boundary** - Structural reinforcement around switches

### Computed Values
- **Eliminated duplication** - Recurring calculations computed once
- **Performance optimized** - Pre-calculated dimensions and tolerances
- **Maintainable** - Single source of truth for derived values

## 🤝 Contributing

This project demonstrates production-ready parametric design principles:
- Type-safe configuration
- Modular architecture
- Mathematical precision
- Manufacturing constraints

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with SCAD-JS** - TypeScript → OpenSCAD → STL Pipeline
