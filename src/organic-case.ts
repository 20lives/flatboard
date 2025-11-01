import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { circle, difference, hull, chain_hull, minkowski, type ScadObject, union } from 'scad-js';
import type { KeyPlacement, PoleVisualizationConfig } from './interfaces.js';
import { convertDegreesToRadians } from './utils.js';

/**
 * Pole: A marker at a key corner used for outline tracing
 * Each key generates 4 poles at its corners
 */
interface Pole {
  x: number;
  y: number;
  keyIndex: number;
  corner: 'tl' | 'tr' | 'bl' | 'br';
}

/**
 * Face identifier for the four sides of the keyboard outline
 */
type Face = 'left' | 'right' | 'top' | 'bottom';

/**
 * Bounding box for pole positions
 */
interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const rotatePoint = (offsetX: number, offsetY: number, rotationDegrees: number): { x: number; y: number } => {
  const radians = convertDegreesToRadians(rotationDegrees);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: offsetX * cos - offsetY * sin,
    y: offsetX * sin + offsetY * cos,
  };
};

const createCornerOffsets = (keySize: number): Array<{ x: number; y: number; corner: Pole['corner'] }> => {
  const half = keySize / 2;
  return [
    { x: -half, y: half, corner: 'tl' as const },
    { x: half, y: half, corner: 'tr' as const },
    { x: half, y: -half, corner: 'br' as const },
    { x: -half, y: -half, corner: 'bl' as const },
  ];
};

const createPolesForKey = (placement: KeyPlacement, keySize: number, keyIndex: number): Pole[] =>
  pipe(
    createCornerOffsets(keySize),
    A.map(({ x: offsetX, y: offsetY, corner }) => {
      const rotated = rotatePoint(offsetX, offsetY, placement.rot);
      return {
        x: placement.pos.x + rotated.x,
        y: placement.pos.y + rotated.y,
        keyIndex,
        corner,
      };
    }),
  );

const createAllPoles = (keyPlacements: KeyPlacement[], keySize: number): Pole[] =>
  pipe(
    keyPlacements,
    A.mapWithIndex((keyIndex, placement) => createPolesForKey(placement, keySize, keyIndex)),
    A.flatten,
  );

const calculatePoleBounds = (poles: Pole[]): Bounds => {
  const xs = poles.map((p) => p.x);
  const ys = poles.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

const findExtremePoles_Vertical = (
  poles: Pole[],
  bounds: Bounds,
  sectionSize: number,
  findMin: boolean,
  sectionOffset: number = 0,
): Pole[] => {
  const result: Pole[] = [];
  const epsilon = 0.001;
  const startY = bounds.minY + (sectionOffset % sectionSize);

  for (let y = startY; y < bounds.maxY; y += sectionSize) {
    const polesInSection = poles.filter((p) => p.y >= y && p.y < y + sectionSize);
    if (polesInSection.length === 0) continue;

    const extremeX = findMin
      ? Math.min(...polesInSection.map((p) => p.x))
      : Math.max(...polesInSection.map((p) => p.x));

    const extremePoles = polesInSection.filter((p) => Math.abs(p.x - extremeX) < epsilon);
    extremePoles.sort((a, b) => a.y - b.y);
    result.push(...extremePoles);
  }

  return result;
};

const findExtremePoles_Horizontal = (
  poles: Pole[],
  bounds: Bounds,
  sectionSize: number,
  findMax: boolean,
  sectionOffset: number = 0,
): Pole[] => {
  const result: Pole[] = [];
  const epsilon = 0.001;
  const startX = bounds.minX + (sectionOffset % sectionSize);

  for (let x = startX; x < bounds.maxX; x += sectionSize) {
    const polesInSection = poles.filter((p) => p.x >= x && p.x < x + sectionSize);
    if (polesInSection.length === 0) continue;

    const extremeY = findMax
      ? Math.max(...polesInSection.map((p) => p.y))
      : Math.min(...polesInSection.map((p) => p.y));

    const extremePoles = polesInSection.filter((p) => Math.abs(p.y - extremeY) < epsilon);
    extremePoles.sort((a, b) => a.x - b.x);
    result.push(...extremePoles);
  }

  return result;
};

const findExtremePoles = (
  poles: Pole[],
  face: Face,
  bounds: Bounds,
  sectionSize: number,
  sectionOffset: number = 0,
): Pole[] => {
  switch (face) {
    case 'left':
      return findExtremePoles_Vertical(poles, bounds, sectionSize, true, sectionOffset);
    case 'right':
      return findExtremePoles_Vertical(poles, bounds, sectionSize, false, sectionOffset);
    case 'top':
      return findExtremePoles_Horizontal(poles, bounds, sectionSize, true, sectionOffset);
    case 'bottom':
      return findExtremePoles_Horizontal(poles, bounds, sectionSize, false, sectionOffset);
  }
};

const assembleCompleteOutline = (
  poles: Pole[],
  bounds: Bounds,
  sectionSize: number,
  poleRadius: number,
  sectionOffset: number = 0,
): ScadObject | null => {
  const leftPoles = findExtremePoles(poles, 'left', bounds, sectionSize, sectionOffset);
  const topPoles = findExtremePoles(poles, 'top', bounds, sectionSize, sectionOffset);
  const rightPoles = findExtremePoles(poles, 'right', bounds, sectionSize, sectionOffset).reverse();
  const bottomPoles = findExtremePoles(poles, 'bottom', bounds, sectionSize, sectionOffset).reverse();

  const orderedPoles = [...leftPoles, ...topPoles, ...rightPoles, ...bottomPoles];
  if (orderedPoles.length === 0) return null;

  const circles = orderedPoles.map((p) => circle(poleRadius).translate([p.x, p.y, 0]));
  return chain_hull(circles);
};

const applyExpansion = (outline: ScadObject, expansion: number, cornerRadius: number): ScadObject => {
  const expanded = outline.delta_offset(expansion);
  return cornerRadius > 0 ? minkowski(expanded, circle(cornerRadius)) : expanded;
};

const visualizeAllPoles = (poles: Pole[], poleRadius: number = 0.3): ScadObject => {
  const poleMarkers = poles.map((p) => circle(poleRadius).translate([p.x, p.y, 0]));
  return union(...poleMarkers).debug();
};

const visualizeExtremePoles = (
  poles: Pole[],
  bounds: Bounds,
  sectionSize: number,
  poleRadius: number = 0.5,
  facesToShow?: Face[],
  sectionOffset: number = 0,
): ScadObject => {
  const faces: Face[] = facesToShow ?? ['left', 'right', 'top', 'bottom'];

  const faceMarkers = pipe(
    faces,
    A.map((face) => {
      const extremePoles = findExtremePoles(poles, face, bounds, sectionSize, sectionOffset);
      const markers = extremePoles.map((p) => circle(poleRadius).translate([p.x, p.y, 0]));
      return markers.length > 0 ? union(...markers).debug() : null;
    }),
    A.filter((marker): marker is ScadObject => marker !== null),
  );

  return faceMarkers.length > 0 ? union(...faceMarkers) : union();
};

// ============================================================================
// Main API
// ============================================================================

/**
 * Generate 2D organic outline from key positions
 *
 * Algorithm:
 * 1. Create poles at each key corner (4 per key)
 * 2. For each face (left/right/top/bottom), find extreme poles by sectioning the perpendicular axis
 * 3. Create chain hulls connecting consecutive extreme poles on each face
 * 4. Union all face outlines to form complete perimeter
 * 5. Apply expansion and optional corner rounding
 *
 * @param keyPlacements - Array of key positions and rotations
 * @param keySize - Size of each key (square)
 * @param expansion - Margin to add around keys
 * @param cornerRadius - Optional corner rounding radius (0 = no rounding)
 * @param sectionSize - Axis division granularity for extreme pole finding (smaller = more detail)
 * @param sectionOffset - Offset to the starting position of sections (0 to sectionSize)
 */
export function createOrganicOutline2D(
  keyPlacements: KeyPlacement[],
  keySize: number,
  expansion: number,
  cornerRadius: number = 0,
  sectionSize?: number,
  sectionOffset: number = 0,
): ScadObject {
  // Calculate section size if not provided (default: half key size for good detail)
  const calculatedSectionSize = sectionSize ?? keySize / 2;
  const poleRadius = 0.5; // Small marker radius for pole circles

  // Step 1: Generate poles at all key corners
  const poles = createAllPoles(keyPlacements, keySize);

  // Step 2: Calculate bounding box
  const bounds = calculatePoleBounds(poles);

  // Step 3: Assemble complete outline from all four faces
  const baseOutline = assembleCompleteOutline(poles, bounds, calculatedSectionSize, poleRadius, sectionOffset);

  if (!baseOutline) {
    throw new Error('Failed to create organic outline: no valid face outlines generated');
  }

  // Step 4: Apply expansion and corner rounding
  return applyExpansion(baseOutline, expansion, cornerRadius);
}

/**
 * Create organic wall box for top plate
 * Structure: Hollow frame with outer organic walls and inner cavity
 */
export function createOrganicWallBox(
  keyPlacements: KeyPlacement[],
  keySize: number,
  edgeMargin: number,
  wallThickness: number,
  totalHeight: number,
  plateThickness: number,
  cornerRadius: number = 0,
  sectionSize?: number,
  sectionOffset?: number,
  poleVisualization?: PoleVisualizationConfig,
): ScadObject {
  // Determine section parameters - prioritize visualization settings if enabled
  const finalSectionSize = poleVisualization?.enabled
    ? poleVisualization.sectionSize ?? sectionSize ?? keySize / 2
    : sectionSize ?? keySize / 2;

  const finalSectionOffset = poleVisualization?.enabled
    ? poleVisualization.sectionOffset ?? sectionOffset ?? 0
    : sectionOffset ?? 0;

  // Outer boundary (with walls)
  const outerOutline = createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin + wallThickness,
    cornerRadius,
    finalSectionSize,
    finalSectionOffset,
  );

  // Inner boundary (plate area)
  const innerOutline = createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin,
    cornerRadius,
    finalSectionSize,
    finalSectionOffset,
  );

  // Create hollow wall structure
  const wallBox = difference(
    outerOutline.linear_extrude(totalHeight),
    innerOutline.linear_extrude(totalHeight - plateThickness + 0.1).translate_z(-0.1),
  );

  if (!poleVisualization?.enabled) return wallBox;

  const poles = createAllPoles(keyPlacements, keySize);
  const bounds = calculatePoleBounds(poles);
  const visualizations: ScadObject[] = [wallBox];

  if (poleVisualization.showAllPoles !== false) {
    const allPolesViz = visualizeAllPoles(poles, 0.3).linear_extrude(totalHeight);
    visualizations.push(allPolesViz);
  }

  if (poleVisualization.showExtremePoles !== false) {
    const extremePolesViz = visualizeExtremePoles(
      poles,
      bounds,
      finalSectionSize,
      0.6,
      poleVisualization.showFaces,
      finalSectionOffset,
    ).linear_extrude(totalHeight * 3).translate_z(-10);
    visualizations.push(extremePolesViz);
  }

  return union(...visualizations);
}

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
  sectionOffset?: number,
): ScadObject {
  const totalHeight = plateThickness + topWallHeight;
  const finalSectionSize = sectionSize ?? keySize / 2;
  const finalSectionOffset = sectionOffset ?? 0;

  const outerOutline = createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin + wallThickness,
    cornerRadius,
    finalSectionSize,
    finalSectionOffset,
  );

  const baseOutline = createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin,
    cornerRadius,
    finalSectionSize,
    finalSectionOffset,
  );

  const innerOutline = createOrganicOutline2D(
    keyPlacements,
    keySize,
    edgeMargin - wallThickness,
    cornerRadius,
    finalSectionSize,
    finalSectionOffset,
  );

  return union(
    outerOutline.linear_extrude(bottomThickness),
    difference(baseOutline, innerOutline).linear_extrude(totalHeight - plateThickness).translate_z(bottomThickness),
  );
}
