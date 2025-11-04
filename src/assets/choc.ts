import { cube, cylinder, difference, hull, minkowski, sphere, union, type ScadObject } from 'scad-js';

export interface KeycapConfig {
  width: number;
  depth: number;
  height: number;
  cornerRadius: number;
  skirtHeight: number;
  skirtThickness: number;
  bump?: boolean;
  backlightNorth?: boolean;
  thinSpotWidth?: number;
  thinSpotDepth?: number;
  thinSpotHeight?: number;
}

export const CHOC_KEYCAP_DEFAULT: KeycapConfig = {
  width: 17.0,
  depth: 16.0,
  height: 2.0,
  cornerRadius: 2.0,
  skirtHeight: 0.5,
  skirtThickness: 1.0,
  bump: false,
  backlightNorth: true,
  thinSpotWidth: 8.0,
  thinSpotDepth: 1.0,
  thinSpotHeight: 0.8,
};

function createRoundedCube(width: number, depth: number, height: number, r: number): ScadObject {
  const innerCube = cube([width - r * 2, depth - r * 2, height - 0.2]).translate_z(-(height - 0.2) / 2);
  const roundingCylinder = cylinder(0.2, r).translate_z(-0.1);
  return minkowski(innerCube, roundingCylinder);
}

function createBumpForHomePosition(keycapDepth: number, keycapHeight: number): ScadObject {
  const bumpSphere = sphere(0.3);
  const bumpBase = cube([3.0, 0.001, 0.001]).translate([-1.5, -0.0005, -0.0005]);
  return minkowski(bumpSphere, bumpBase).translate([0, keycapDepth * -0.5 + 3.0, keycapHeight]);
}

function createThinSpot(config: KeycapConfig, backlightNorth: boolean): ScadObject {
  const thinSpotWidth = config.thinSpotWidth ?? 8.0;
  const thinSpotDepth = config.thinSpotDepth ?? 1.0;
  const thinSpotHeight = config.thinSpotHeight ?? 0.8;
  const r = thinSpotDepth * 0.5;

  const innerCylinder = cylinder(thinSpotHeight, r + 0.5, r).translate_z(-thinSpotHeight / 2);
  const stretchCube = cube([thinSpotWidth - r * 2, 0.2, 0.0001]).translate([
    -(thinSpotWidth - r * 2) / 2,
    -0.1,
    -0.00005,
  ]);

  const thinSpotShape = minkowski(innerCylinder, stretchCube);

  return thinSpotShape.translate([0, backlightNorth ? 4 : -4, thinSpotHeight * 0.5 - 0.1]);
}

function createLeg(): ScadObject {
  const footWidth = 1.2 - 0.15;
  const footDepth = 3 - 0.15;
  const footHeight = 4;
  const cutWidth = 0.3;
  const cutHeight = 1.2;

  const topCube = cube([footWidth, footDepth, footHeight - cutHeight]).translate([0, 0, cutHeight]);
  const bottomCube = cube([footWidth - cutWidth * 2, footDepth - cutWidth * 2, cutHeight]).translate([
    cutWidth,
    cutWidth,
    0,
  ]);

  return hull(topCube, bottomCube).translate([footWidth * -0.5, footDepth * -0.5, footHeight * -1]);
}

function createLegs(): ScadObject {
  const chocDistance = 5.7;
  const leftLeg = createLeg().translate([chocDistance * 0.5, 0, 0]);
  const rightLeg = createLeg().translate([chocDistance * -0.5, 0, 0]);
  return union(leftLeg, rightLeg);
}

export function createKeycap(config: KeycapConfig = CHOC_KEYCAP_DEFAULT): ScadObject {
  const { width, depth, height, cornerRadius, skirtHeight, skirtThickness, bump, backlightNorth } = config;

  const keycapBody = createRoundedCube(width, depth, height, cornerRadius).translate([0, 0, height * 0.5]);

  const thinSpot = createThinSpot(config, backlightNorth ?? true);
  const mainKeycap = difference(keycapBody, thinSpot);

  const outerSkirt = createRoundedCube(width, depth, skirtHeight, cornerRadius);
  const innerSkirt = createRoundedCube(
    width - skirtThickness * 2,
    depth - skirtThickness * 2,
    skirtHeight * 4,
    cornerRadius,
  );
  const skirt = difference(outerSkirt, innerSkirt).translate([0, 0, skirtHeight * -0.5]);

  const legs = createLegs();

  let keycap = union(mainKeycap, skirt, legs);

  if (bump) {
    const bumpGeometry = createBumpForHomePosition(depth, height);
    keycap = union(keycap, bumpGeometry);
  }

  return keycap;
}

/**
 * Generate Choc keycap for visualization
 * Matches the pattern used by DSA/XDA keycaps in keycap-generator.ts
 */
export function generateChocKeycap(): ScadObject {
  return createKeycap(CHOC_KEYCAP_DEFAULT);
}
