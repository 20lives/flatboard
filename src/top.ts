import { cube, difference, union } from "scad-js";
import { type KeyPlacement, type Point2D } from './config.js';
import { createTopWalls } from './walls.js';
import { createCornerHeatInsertMounts } from './mounting.js';
import { createAllSwitchCutouts, createFrameOuterBoundCutouts } from './switch-sockets.js';

function createBasePlateGeometry(plateWidth: number, plateHeight: number, topPlateThickness: number) {
  return cube([plateWidth, plateHeight, topPlateThickness])
    .translate([plateWidth / 2, plateHeight / 2, -topPlateThickness / 2]);
}

export function generateKeyboardPlate(allKeyPlacements: KeyPlacement[], plateWidth: number, plateHeight: number, plateOffset: Point2D, config: any) {
  const basePlateGeometry = createBasePlateGeometry(plateWidth, plateHeight, config.switch.plate.thickness);

  // Create all switch-related cutouts using the extracted module
  const { switchHoleCutouts, thinZoneCutouts, allCutouts } = createAllSwitchCutouts(
    allKeyPlacements, plateOffset, config
  );

  // Create frame outer boundary cutouts
  const frameOuterBoundGeometry = createFrameOuterBoundCutouts(
    allKeyPlacements, plateOffset, config.enclosure.frame.wallThickness, config.enclosure.frame.scaleFactor, config.switch.plate.totalThickness, config.switch.cutout.thinZone
  );

  const plateWithFrameGeometry = difference(
    basePlateGeometry,
    union(...frameOuterBoundGeometry)
      .scale([1, 1, config.computed.manufacturingScaleMargin])
      .translate([0, 0, config.tolerances.general])
  );

  const cornerMountGeometry = union(...createCornerHeatInsertMounts(plateWidth, plateHeight, config));
  const frameStructureGeometry = difference(union(...frameOuterBoundGeometry), allCutouts);
  const topWallGeometry = createTopWalls(plateWidth, plateHeight, config);

  return union(plateWithFrameGeometry, frameStructureGeometry, topWallGeometry, cornerMountGeometry);
}
