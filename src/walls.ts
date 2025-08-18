import { cube, difference } from "scad-js";

function createWallGeometry(plateWidth: number, plateHeight: number, wallHeight: number, wallCenterZPosition: number, config: any) {
  const { wallThickness, extrusionTolerance } = config;
  
  const outerWallGeometry = cube([
    plateWidth + 2 * wallThickness,
    plateHeight + 2 * wallThickness,
    wallHeight
  ]).translate([
    plateWidth / 2,
    plateHeight / 2,
    wallCenterZPosition,
  ]);
  
  const innerCavityGeometry = cube([
    plateWidth,
    plateHeight,
    wallHeight + extrusionTolerance
  ]).translate([
    plateWidth / 2,
    plateHeight / 2,
    wallCenterZPosition,
  ]);

  
  return difference(outerWallGeometry, innerCavityGeometry);
}

export function createTopWalls(plateWidth: number, plateHeight: number, config: any) {
  const { topWallHeight, topWallCenterZ } = config;
  
  return createWallGeometry(plateWidth, plateHeight, topWallHeight, topWallCenterZ, config);
}

export function createBottomWalls(plateWidth: number, plateHeight: number, config: any) {
  const { bottomWallHeight, bottomWallCenterZ } = config;
  
  return createWallGeometry(plateWidth, plateHeight, bottomWallHeight, bottomWallCenterZ, config);
}
