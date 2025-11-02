/**
 * Unified Keycap Generator
 * Supports DSA and XDA profiles with parameterized values
 * Converted from OpenSCAD to scad-js
 */

import { cube, difference, hull, intersection, sphere, square, union } from 'scad-js';

// Keycap profile specifications
interface KeycapProfile {
  height: number;
  topDifference: number;
  wallThickness: number;
  cornerRadius: number;
  cornerRadiusCurve: number;
  polygonCurve: number;
  dishDepth: number;
  dishFn: number;
}

const PROFILES: Record<'dsa' | 'xda', KeycapProfile> = {
  dsa: {
    height: 7.3914,
    topDifference: 6.08,
    wallThickness: 1.35,
    cornerRadius: 0.5,
    cornerRadiusCurve: 2,
    polygonCurve: 4.5,
    dishDepth: 0.8,
    dishFn: 128,
  },
  xda: {
    height: 9.1,
    topDifference: 3.81,
    wallThickness: 1.5,
    cornerRadius: 0.3,
    cornerRadiusCurve: 8,
    polygonCurve: 5,
    dishDepth: 1,
    dishFn: 256,
  },
};

// Constants
const KEYCAP_WIDTH = 18.41;
const POLYGON_LAYERS = 10;
const DISH_CORNER_FN = 64;

// Utility functions
const isOdd = (x: number): boolean => x % 2 === 1;
const polygonSlice = (step: number, amplitude: number, totalSteps = 10): number =>
  (1 - step / totalSteps) * amplitude;

/**
 * Creates a squarish rounded polygon (2D)
 */
function squarishRpoly(xy: [number, number], h: number, r: number, center = false, fn = 64): any {
  const correctedX = xy[0] > r ? xy[0] - r * 2 : r / 10;
  const correctedY = xy[1] > r ? xy[1] - r * 2 : r / 10;

  const layer = square([correctedX, correctedY], { center: true })
    .radius_offset(r)
    .linear_extrude(0.0001, { center: false });

  if (center) {
    return layer.translate_z(-h / 2);
  }
  return layer;
}

/**
 * Creates a squarish rounded polygon with two different sizes (tapered)
 */
function squarishRpolyTapered(
  xy1: [number, number],
  xy2: [number, number],
  h: number,
  r: number,
  xy2Offset: [number, number] = [0, 0],
  center = false,
  fn = 64,
): any {
  const correctedX1 = xy1[0] > r ? xy1[0] - r * 2 : r / 10;
  const correctedY1 = xy1[1] > r ? xy1[1] - r * 2 : r / 10;
  const correctedX2 = xy2[0] > r ? xy2[0] - r * 2 : r / 10;
  const correctedY2 = xy2[1] > r ? xy2[1] - r * 2 : r / 10;

  const bottom = square([correctedX1, correctedY1], { center: true })
    .radius_offset(r)
    .linear_extrude(0.0001, { center: false });

  const top = square([correctedX2, correctedY2], { center: true })
    .radius_offset(r)
    .linear_extrude(0.0001, { center: false })
    .translate([xy2Offset[0], xy2Offset[1], h]);

  const result = hull(bottom, top);

  if (center) {
    return result.translate_z(-h / 2);
  }
  return result;
}

/**
 * Cherry MX cross stem cutout
 */
function cherryCross(): any {
  const crossY = square([1.3, 4.05])
    .linear_extrude(4.002, { center: false })
    .translate_z(-0.001);

  const crossX = square([4.2, 1.5])
    .linear_extrude(4.002, { center: false })
    .translate_z(-0.001);

  // Flare at base
  const flareY = square([1.9, 4.6])
    .linear_extrude(0.4, { center: false, scale: [0.5, 0.825] })
    .translate_z(-0.001);

  const flareX = square([4.65, 1.9])
    .linear_extrude(0.4, { center: false, scale: [0.825, 0.5] })
    .translate_z(-0.001);

  return union(crossY, crossX, flareY, flareX);
}

/**
 * Generates keycap body (main shell)
 */
function generateKeycapBody(profile: KeycapProfile): any {
  const layers: any[] = [];

  for (let l = 0; l < POLYGON_LAYERS; l++) {
    const reductionFactorBelow = polygonSlice(l, profile.polygonCurve, POLYGON_LAYERS);
    const reductionFactorAbove = polygonSlice(l + 1, profile.polygonCurve, POLYGON_LAYERS);
    const curveValBelow = (profile.topDifference - reductionFactorBelow) * (l / POLYGON_LAYERS);
    const curveValAbove = (profile.topDifference - reductionFactorAbove) * ((l + 1) / POLYGON_LAYERS);
    const extraCornerRadiusBelow = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * l;
    const extraCornerRadiusAbove = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * (l + 1);
    const cornerRadiusBelow = profile.cornerRadius + extraCornerRadiusBelow;
    const cornerRadiusAbove = profile.cornerRadius + extraCornerRadiusAbove;

    const bottom = squarishRpoly(
      [KEYCAP_WIDTH - curveValBelow, KEYCAP_WIDTH - curveValBelow],
      0.01,
      cornerRadiusBelow,
      false,
      DISH_CORNER_FN,
    ).translate_z((profile.height / POLYGON_LAYERS) * l);

    const top = squarishRpoly(
      [KEYCAP_WIDTH - curveValAbove, KEYCAP_WIDTH - curveValAbove],
      0.01,
      cornerRadiusAbove,
      false,
      DISH_CORNER_FN,
    ).translate_z((profile.height / POLYGON_LAYERS) * (l + 1));

    layers.push(hull(bottom, top));
  }

  return union(...layers);
}

/**
 * Generates interior hollow for keycap
 */
function generateKeycapHollow(profile: KeycapProfile): any {
  const layers: any[] = [];

  for (let l = 0; l < POLYGON_LAYERS; l++) {
    const reductionFactorBelow = polygonSlice(l, profile.polygonCurve, POLYGON_LAYERS);
    const reductionFactorAbove = polygonSlice(l + 1, profile.polygonCurve, POLYGON_LAYERS);
    const curveValBelow = (profile.topDifference - reductionFactorBelow) * (l / POLYGON_LAYERS);
    const curveValAbove = (profile.topDifference - reductionFactorAbove) * ((l + 1) / POLYGON_LAYERS);
    const extraCornerRadiusBelow = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * l;
    const extraCornerRadiusAbove = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * (l + 1);
    const cornerRadiusBelow = profile.cornerRadius + extraCornerRadiusBelow;
    const cornerRadiusAbove = profile.cornerRadius + extraCornerRadiusAbove;

    const bottom = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - curveValBelow, KEYCAP_WIDTH - profile.wallThickness * 2 - curveValBelow],
      0.01,
      cornerRadiusBelow / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z((profile.height / POLYGON_LAYERS) * l);

    const top = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - curveValAbove, KEYCAP_WIDTH - profile.wallThickness * 2 - curveValAbove],
      0.01,
      cornerRadiusAbove / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z((profile.height / POLYGON_LAYERS) * (l + 1));

    layers.push(hull(bottom, top));
  }

  return union(...layers).translate_z(-0.001);
}

/**
 * Generates stem carve shape
 */
function generateStemCarveShape(profile: KeycapProfile): any {
  const carveShapeLayers: any[] = [];

  for (let l = 0; l < POLYGON_LAYERS; l++) {
    const reductionFactorBelow = polygonSlice(l, profile.polygonCurve, POLYGON_LAYERS);
    const reductionFactorAbove = polygonSlice(l + 1, profile.polygonCurve, POLYGON_LAYERS);
    const curveValBelow = (profile.topDifference - reductionFactorBelow) * (l / POLYGON_LAYERS);
    const curveValAbove = (profile.topDifference - reductionFactorAbove) * ((l + 1) / POLYGON_LAYERS);
    const extraCornerRadiusBelow = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * l;
    const extraCornerRadiusAbove = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * (l + 1);
    const cornerRadiusBelow = profile.cornerRadius + extraCornerRadiusBelow;
    const cornerRadiusAbove = profile.cornerRadius + extraCornerRadiusAbove;

    const bottom = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 1.5 - curveValBelow, KEYCAP_WIDTH - profile.wallThickness * 1.5 - curveValBelow],
      0.01,
      cornerRadiusBelow / 2,
      false,
      DISH_CORNER_FN,
    ).translate_z(((profile.height - profile.wallThickness / 2) / POLYGON_LAYERS) * l);

    const top = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 1.5 - curveValAbove, KEYCAP_WIDTH - profile.wallThickness * 1.5 - curveValAbove],
      0.01,
      cornerRadiusAbove / 2,
      false,
      DISH_CORNER_FN,
    ).translate_z(((profile.height - profile.wallThickness / 2) / POLYGON_LAYERS) * (l + 1));

    carveShapeLayers.push(hull(bottom, top));
  }

  return union(...carveShapeLayers);
}

/**
 * Generates stem interior walls
 */
function generateStemWalls(profile: KeycapProfile): any {
  const outerWallLayers: any[] = [];
  const innerHollowLayers: any[] = [];

  for (let l = 0; l < POLYGON_LAYERS; l++) {
    const reductionFactorBelow = polygonSlice(l, profile.polygonCurve, POLYGON_LAYERS);
    const reductionFactorAbove = polygonSlice(l + 1, profile.polygonCurve, POLYGON_LAYERS);
    const curveValBelow = (profile.topDifference - reductionFactorBelow) * (l / POLYGON_LAYERS);
    const curveValAbove = (profile.topDifference - reductionFactorAbove) * ((l + 1) / POLYGON_LAYERS);
    const extraCornerRadiusBelow = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * l;
    const extraCornerRadiusAbove = (profile.cornerRadius * profile.cornerRadiusCurve / POLYGON_LAYERS) * (l + 1);
    const cornerRadiusBelow = profile.cornerRadius + extraCornerRadiusBelow;
    const cornerRadiusAbove = profile.cornerRadius + extraCornerRadiusAbove;

    const lHeight = profile.height / POLYGON_LAYERS;

    // Outer walls
    const outerBottom = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - curveValBelow, KEYCAP_WIDTH - profile.wallThickness * 2 - curveValBelow],
      0.01,
      cornerRadiusBelow / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z(lHeight * l);

    const outerTop = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - curveValAbove, KEYCAP_WIDTH - profile.wallThickness * 2 - curveValAbove],
      0.01,
      cornerRadiusAbove / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z(lHeight * (l + 1));

    outerWallLayers.push(hull(outerBottom, outerTop));

    // Inner hollow (wall_extra = 0.65)
    const wallExtra = 0.65;
    const innerBottom = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - wallExtra * 2 - curveValBelow, KEYCAP_WIDTH - profile.wallThickness * 2 - wallExtra * 2 - curveValBelow],
      0.01,
      cornerRadiusBelow / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z(lHeight * l);

    const innerTop = squarishRpoly(
      [KEYCAP_WIDTH - profile.wallThickness * 2 - wallExtra * 2 - curveValAbove, KEYCAP_WIDTH - profile.wallThickness * 2 - wallExtra * 2 - curveValAbove],
      0.01,
      cornerRadiusAbove / 1.25,
      false,
      DISH_CORNER_FN,
    ).translate_z(lHeight * (l + 1));

    innerHollowLayers.push(hull(innerBottom, innerTop));
  }

  const outerWalls = union(...outerWallLayers);
  const innerHollow = union(...innerHollowLayers).translate_z(-0.001);
  const bottomCut = cube([KEYCAP_WIDTH * 2, KEYCAP_WIDTH * 2, KEYCAP_WIDTH]).translate_z(-KEYCAP_WIDTH / 2);

  return difference(outerWalls, innerHollow, bottomCut);
}

/**
 * Generates the complete keycap with Cherry MX stem
 */
export function generateKeycap(profileType: 'dsa' | 'xda'): any {
  const profile = PROFILES[profileType];

  // Main keycap shell
  const body = generateKeycapBody(profile);

  // Dish cutout (sphere)
  const adjustedDimension = KEYCAP_WIDTH - profile.topDifference;
  const rad = profile.dishDepth > 0
    ? (Math.pow(adjustedDimension, 2) + 4 * Math.pow(profile.dishDepth, 2)) / (8 * profile.dishDepth)
    : 0;
  const dishZ = profileType === 'dsa' ? 0.111 : 0;

  const dish = sphere(rad * 2, { $fn: profile.dishFn }).translate([
    0,
    0,
    rad * 2 + profile.height - profile.dishDepth + dishZ,
  ]);

  // Interior hollow
  const hollow = generateKeycapHollow(profile);

  // Main keycap body with dish and hollow
  const keycapShell = difference(body, dish, hollow);

  // === CHERRY MX STEM ===
  const stemLength = 5.07; // 5.47 - 0.4 (outside tolerance)
  const stemDepth = 4;
  const stemCornerRadius = profile.cornerRadius;

  const stemBox = squarishRpolyTapered(
    [stemLength, stemLength],
    [stemLength, stemLength],
    stemDepth,
    stemCornerRadius,
    [0, 0],
    true,
    DISH_CORNER_FN,
  ).translate_z(stemDepth / 2);

  const stem = difference(stemBox, cherryCross());

  // === STEM TOPPER ===
  const stemTopperHeight = profile.height - stemDepth;
  const stemTopperBox = squarishRpolyTapered(
    [stemLength, stemLength],
    [KEYCAP_WIDTH / 1.5, KEYCAP_WIDTH / 1.5],
    stemTopperHeight,
    stemCornerRadius,
    [0, 0],
    true,
    DISH_CORNER_FN,
  ).translate_z(stemTopperHeight / 2 + stemDepth);

  const carveShape = generateStemCarveShape(profile);
  const stemTopper = intersection(stemTopperBox, carveShape);

  // === STEM INTERIOR WALLS ===
  const stemWalls = generateStemWalls(profile);

  // Combine all parts
  return union(keycapShell, stem, stemTopper, stemWalls);
}

/**
 * Generate DSA keycap
 */
export function generateDSAKeycap(): any {
  return generateKeycap('dsa');
}

/**
 * Generate XDA keycap
 */
export function generateXDAKeycap(): any {
  return generateKeycap('xda');
}
