import { cube, difference, union } from "scad-js";
import { createBottomWalls } from './walls.js';
import { createCornerScrewSockets, createCornerScrewMounts } from './mounting.js';

export function generateBottomCase(plateWidth: number, plateHeight: number, config: any) {
  const { wallThickness, bottomThickness } = config;
  
  const bottomPlateGeometry = cube([
    plateWidth + 2 * wallThickness,
    plateHeight + 2 * wallThickness,
    bottomThickness
  ]).translate([
    plateWidth / 2,
    plateHeight / 2,
    bottomThickness / 2
  ]);

  const cornerMountGeometry = createCornerScrewMounts(plateWidth, plateHeight, config);
  const bottomWallGeometry = difference(
    createBottomWalls(plateWidth - 3, plateHeight - 3, config).translate(
      [ 1.5, 1.5, 0]
    ),
  );
  const cornerScrewSocketGeometry = createCornerScrewSockets(plateWidth, plateHeight, config);
  
  return difference(
    union(
      bottomPlateGeometry,
      bottomWallGeometry,
      ...cornerMountGeometry,
    ),
    union(...cornerScrewSocketGeometry),
    createBottomWalls(plateWidth + 0.2, plateHeight + 0.2, config).translate([-0.1,-0.1, config.bottomThickness]),
  );
}
