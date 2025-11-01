## Objective
Add organic case generation to the keyboard case generator. Instead of rectangular outlines,
generate smooth, curved outlines that tightly follow the keyboard's key positions, creating
more ergonomic and material-efficient cases.

## Algorithm: Pole-Based Organic Outline Generation

### Core Concept
1. Place "poles" (marker points) at each corner of every key (4 poles per key)
2. For each face (left, right, top, bottom), find the boundary poles that define the outermost edge
3. Connect extreme poles with chain hulls in order to create smooth, continuous outlines
4. Apply expansion (margin) and optional corner rounding

### Detailed Algorithm Steps

#### Step 1: Pole Generation
- For each key placement:
  - Calculate 4 corner positions (top-left, top-right, bottom-right, bottom-left)
  - Account for key rotation using rotation matrix transformation
  - Create pole objects with: `{x, y, keyIndex, corner}`
  - Corner offsets are ±(keySize/2) before rotation

#### Step 2: Extreme Pole Finding (Critical Logic)
This is the heart of the algorithm. Must handle both vertical and horizontal faces:

**For VERTICAL faces (left, right):**
- Divide the Y-axis into sections of `sectionSize`
- For each section, find all poles whose Y coordinate falls within that section
- Within each section, find the extreme X value (minimum for left face, maximum for right)
- Handle ties: if multiple poles have the same extreme X, include all of them
- Sort poles by Y within each section for continuity
- Support `sectionOffset`: shift the starting position of sections to fine-tune which poles are selected

**For HORIZONTAL faces (top, bottom):**
- Divide the X-axis into sections of `sectionSize`
- For each section, find all poles whose X coordinate falls within that section
- Within each section, find the extreme Y value (maximum for top face, minimum for bottom)
- Handle ties: if multiple poles have the same extreme Y, include all of them
- Sort poles by X within each section for continuity
- Support `sectionOffset`: shift the starting position of sections

**Section Algorithm Details:**
```typescript
// For vertical faces (sectioning along Y-axis)
const startY = bounds.minY + (sectionOffset % sectionSize);
for (let y = startY; y < bounds.maxY; y += sectionSize) {
  const polesInSection = poles.filter(p => p.y >= y && p.y < y + sectionSize);
  if (polesInSection.length === 0) continue;

  const extremeX = findMin ? Math.min(...) : Math.max(...);
  const extremePoles = polesInSection.filter(p => Math.abs(p.x - extremeX) < epsilon);
  extremePoles.sort((a, b) => a.y - b.y); // Sort for continuity
  result.push(...extremePoles);
}
```

**Why Section Offset Matters:**
- Keys may align such that section boundaries split key corners awkwardly
- Offset allows shifting sections to better capture key corners
- Example: If keys are at Y=0, 18, 36 and sectionSize=15, offset=3 would place
  section boundaries at 3, 18, 33, better capturing the keys at 18, 36

#### Step 3: Face Assembly
- Collect extreme poles for each face using section parameters
- Order poles for continuous outline: [leftPoles, topPoles, rightPoles.reverse(), bottomPoles.reverse()]
- Reverse right and bottom to maintain counter-clockwise continuity
- **Critical**: Do NOT close individual faces - they should connect to adjacent faces
- Create small circles at each pole position (pole radius ~0.5mm)
- Use `chain_hull(circles)` to create smooth connections between consecutive poles

#### Step 4: Expansion and Rounding
- Apply `delta_offset(expansion)` to add margin around outline
- Optionally apply `minkowski(outline, circle(cornerRadius))` for rounded corners

### Data Structures

```typescript
interface Pole {
  x: number;
  y: number;
  keyIndex: number;  // Which key this pole belongs to
  corner: 'tl' | 'tr' | 'bl' | 'br';  // Which corner of the key
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

type Face = 'left' | 'right' | 'top' | 'bottom';
```

### Core Functions Required

1. **rotatePoint(offsetX, offsetY, rotationDegrees)**: Rotate point around origin
2. **createCornerOffsets(keySize)**: Generate 4 corner offsets for a key
3. **createPolesForKey(placement, keySize, keyIndex)**: Generate 4 poles for one key
4. **createAllPoles(keyPlacements, keySize)**: Generate all poles for all keys
5. **calculatePoleBounds(poles)**: Find min/max X and Y
6. **findExtremePoles_Vertical(poles, bounds, sectionSize, findMin, sectionOffset)**
7. **findExtremePoles_Horizontal(poles, bounds, sectionSize, findMax, sectionOffset)**
8. **findExtremePoles(poles, face, bounds, sectionSize, sectionOffset)**: Use object literal to route to vertical/horizontal
9. **assembleCompleteOutline(poles, bounds, sectionSize, poleRadius, sectionOffset)**
10. **applyExpansion(outline, expansion, cornerRadius)**

### Main API Functions

```typescript
export function createOrganicOutline2D(
  keyPlacements: KeyPlacement[],
  keySize: number,
  expansion: number,
  cornerRadius: number = 0,
  sectionSize?: number,      // Default: keySize / 2
  sectionOffset: number = 0, // Default: 0
): ScadObject

export function createOrganicWallBox(
  keyPlacements: KeyPlacement[],
  keySize: number,
  edgeMargin: number,
  wallThickness: number,
  totalHeight: number,
  plateThickness: number,
  cornerRadius: number = 0,
  sectionSize?: number,
): ScadObject

export function createOrganicBase(
  keyPlacements: KeyPlacement[],
  keySize: number,
  edgeMargin: number,
  wallThickness: number,
  bottomThickness: number,
  topWallHeight: number,
  plateThickness: number,
  cornerRadius: number = 0,
  sectionSize?: number,
): ScadObject
```

## Configuration System

### Add to interfaces.ts:

```typescript

export interface EnclosureConfig {
  // ... existing fields
  caseStyle?: 'rectangular' | 'organic';
  organicCornerRadius?: number;
  organicSectionSize?: number;    // Global section size for organic generation
}
```

### Profile Example:

```typescript
enclosure: {
  caseStyle: 'organic',
  organicCornerRadius: 0.0,      // No rounding (sharp corners)
  organicSectionSize: 15,         // 15mm sections for pole finding
}
```

## Integration Points

### 1. Top Plate (top.ts)
- Add 'organic' case to wallBoxCreators object literal
- Call `createOrganicWallBox` with all parameters
- Pass through connector cutouts

### 2. Bottom Case (bottom.ts)
- Add 'organic' case to baseGeometryCreators object literal
- Call `createOrganicBase` with section parameters
- **Critical**: When creating bottom pattern boundary, pass section parameters:
  ```typescript
  createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin + wallThickness - margin,
    cornerRadius,
    config.enclosure.organicSectionSize,  // Must include these!
  )
  ```

### 3. Build System (build.ts)
- No changes needed - works with existing build modes

## Critical Implementation Details

### 1. Pole Ordering for Continuity
- Left face: Natural order (bottom to top as Y increases)
- Top face: Natural order (left to right as X increases)
- Right face: REVERSED (top to bottom for continuity)
- Bottom face: REVERSED (right to left for continuity)
- This creates counter-clockwise traversal around perimeter

### 2. Face Connection (Not Closure)
- Do NOT close individual face outlines
- Each face should have endpoints that connect to adjacent faces
- The complete outline is closed by the ordered concatenation:
  `[...leftPoles, ...topPoles, ...rightPoles, ...bottomPoles]`

### 3. Section Size Selection
- Default: `keySize`
- Smaller values: More poles, may add irelevant poles
- Larger values: Fewer polesine, may miss important poles
- Should be configurable per-profile

## Code Style Requirements

### 1. Pure Functional Approach
- All helper functions should be pure (no side effects, no mutations)
- Use `const` for all variables
- Use `map`, `filter`, `reduce` instead of loops with mutations
- Example:
  ```typescript
  // Good
  const result = items.map(transform).filter(predicate);

  // Avoid
  const result = [];
  for (const item of items) {
    const transformed = transform(item);
    if (predicate(transformed)) {
      result.push(transformed);
    }
  }
  ```

### 2. fp-ts Integration
- Use `pipe` for sequential transformations
- Use `A.map`, `A.filter`, `A.mapWithIndex` for array operations
- Use `O.fromNullable`, `O.map`, `O.getOrElse` for optional values

### 3. TypeScript Best Practices
- Explicit types for all function parameters
- Use `as const` for literal arrays when needed
- Avoid `any` type
- Use interface for data structures
- Use object literals instead of switch statements:

## Testing and Validation

### Visual Validation
1. Enable pole visualization in profile
2. Verify all poles appear at key corners
3. Verify extreme poles align with expected boundary
4. Check that chain hull creates smooth connections
5. Verify walls match visualized poles exactly

### Edge Cases to Test
1. Rotated keys (especially thumb clusters)
2. Staggered columns
3. Different section sizes (very small, very large)
4. Split keyboards (mirrored layouts)
5. Unibody keyboards

## Implementation Order

1. Create data structures (Pole, Bounds, Face types)
2. Implement core geometry functions (rotatePoint, createCornerOffsets)
3. Implement pole generation (createPolesForKey, createAllPoles)
4. Implement bounds calculation
5. Implement extreme pole finding (vertical and horizontal variants)
6. Implement outline assembly (chain hull)
7. Implement expansion and rounding
8. Implement main API (createOrganicOutline2D, createOrganicWallBox, createOrganicBase)
9. Add visualization functions
10. Add configuration interfaces
11. Integrate with top.ts and bottom.ts
12. Test with various profiles

## Mathematical Details

### Rotation Matrix
For rotating a point (x, y) by angle θ:
```
x' = x × cos(θ) - y × sin(θ)
y' = x × sin(θ) + y × cos(θ)
```

### Delta Offset
scad-js `delta_offset(r)`:
- Expands 2D outline by radius `r`
- Uses OpenSCAD's `offset(delta=r)`
- Positive `r` expands, negative contracts

### Minkowski Sum
scad-js `minkowski(shape, circle(r))`:
- Rounds corners by radius `r`
- Computationally expensive
- Use sparingly (corner rounding only)

### Chain Hull
scad-js `chain_hull(shapes)`:
- Creates hulls between consecutive shapes: hull(shapes[0], shapes[1]), hull(shapes[1], shapes[2]), ...
- More efficient than single hull of all shapes
- Creates smooth progressive connections

## Performance Considerations

1. Pole radius should be small (~0.5mm) to minimize hull computation
2. Section size affects number of poles - balance detail vs complexity
3. Chain hull is O(n) in number of poles - efficient for this use case
4. Visualization can be expensive - only enable during development
5. Delta offset and minkowski are expensive - use appropriate `$fn` values

## Documentation Requirements

Add JSDoc comments for:
1. Main exported functions with @param and @returns
2. Algorithm explanation in module header
3. Complex helper functions
4. Non-obvious design decisions

Example:
```typescript
/**
 * Generate 2D organic outline from key positions
 *
 * Algorithm:
 * 1. Create poles at each key corner (4 per key)
 * 2. For each face, find extreme poles by sectioning perpendicular axis
 * 3. Chain hull consecutive extreme poles
 * 4. Apply expansion and optional corner rounding
 *
 * @param keyPlacements - Array of key positions and rotations
 * @param keySize - Size of each key (square)
 * @param expansion - Margin to add around keys
 * @param cornerRadius - Optional corner rounding radius (0 = no rounding)
 * @param sectionSize - Axis division granularity (smaller = more detail)
 */
```
