# Keyboard Profiles

The laptop-ortho-36 generator supports multiple keyboard layout profiles through a flexible configuration system.

## Usage

### Command Line Interface

```bash
# List available profiles
bun src/index.ts list

# Build with specific profile
bun src/index.ts build ortho-36

# Get profile information
bun src/index.ts info compact-30

# Compare two profiles
bun src/index.ts compare ortho-36 minimal-24

# Build all profiles
bun src/index.ts build-all
```

### Environment Variable

```bash
# Set default profile
export KEYBOARD_PROFILE=ortho-36
bun src/index.ts

# Or inline
KEYBOARD_PROFILE=compact-30 bun src/index.ts
```

## Available Profiles

### Layout Profiles

- **`ortho-36`** - Full 36-key split ortholinear (3×5 + 3 thumb per hand)
- **`compact-30`** - Compact 30-key layout (3×4 + 3 thumb per hand)  
- **`minimal-24`** - Minimal 24-key layout (3×3 + 3 thumb per hand)
- **`standard-42`** - Standard 42-key layout (3×6 + 3 thumb per hand)
- **`test-single`** - Single key test layout (1×1 + 1 thumb per hand)

### Profile Variants

- **`low-profile`** - Thinner case variant (3mm thickness)
- **`high-profile`** - Thicker case variant (5mm thickness)

## Profile System Architecture

### Base Configuration

All profiles inherit from `BASE_PARAMETERS` which contains sensible defaults for all keyboard parameters including:

- Layout dimensions (cols, rows, pitch)
- Switch specifications (cutout sizes, thickness)
- Thumb cluster configuration
- Enclosure design (wall thickness, mounting)
- Manufacturing tolerances

### Profile Overrides

Each profile can override any subset of base parameters:

```typescript
'compact-30': {
  cols: 3,
  rows: 4,           // Override: reduce from 5 to 4 rows
  thumbKeys: 3,
  centerGap: 20.0,   // Override: smaller gap
  thumbXOffset: 40.0, // Override: closer thumb cluster
  thumbYOffset: 2.0,
  baseRowOffsets: [3, 1, 0, 2], // Override: custom stagger
},
```

### Creating Custom Profiles

Add new profiles to `KEYBOARD_PROFILES` in `src/config.ts`:

```typescript
'my-custom': {
  cols: 4,              // 4 columns instead of 3
  centerGap: 30.0,      // Wider split
  baseRotationDegrees: -45.0, // Different tilt
},
```

## Key Parameters

### Layout Parameters
- `cols`, `rows` - Matrix dimensions per hand
- `thumbKeys` - Number of thumb keys per hand  
- `centerGap` - Distance between split halves
- `baseRowOffsets` - Stagger pattern for columns
- `pitch` - Key spacing

### Thumb Cluster
- `thumbXOffset`, `thumbYOffset` - Cluster position
- `thumbClusterRotation` - Overall cluster angle
- `thumbPerKeyRotation` - Individual key rotations
- `thumbVertical` - Vertical vs horizontal layout

### Physical Design  
- `totalThickness` - Overall plate thickness
- `plateThickness` - Switch mounting plate
- `wallThickness` - Case wall thickness
- `topWallHeight`, `bottomWallHeight` - Case height

### Output
- `openscadResolution` - Curve quality ($fn value)

## Profile Validation

The system includes validation for profile configurations:

```typescript
import { ProfileManager } from './profiles.js';

const { valid, errors } = ProfileManager.validateProfile(myProfile);
if (!valid) {
  console.error('Profile errors:', errors);
}
```

Common validation rules:
- Positive values for dimensions
- Array lengths matching key counts
- Thickness relationships (plate < total)

## Examples

### Environment-based Building
```bash
# Build production layouts
KEYBOARD_PROFILE=ortho-36 bun src/index.ts
KEYBOARD_PROFILE=compact-30 bun src/index.ts

# Test layout
KEYBOARD_PROFILE=test-single bun src/index.ts
```

### Batch Processing
```bash
# Generate all profiles
bun src/index.ts build-all

# Files created: top-ortho-36.scad, bottom-compact-30.scad, etc.
```

### Profile Analysis
```bash
# See what's different between layouts
bun src/index.ts compare ortho-36 compact-30

# Check profile details
bun src/index.ts info high-profile
```