import { cube, difference, union } from 'scad-js';
import type { KeyPlacement, Point2D, KeyboardConfig } from './config.js';
import { createTopWalls } from './walls.js';
import { createCornerHeatInsertMounts } from './mounting.js';
import { createAllSwitchCutouts, createFrameOuterBoundCutouts } from './switch-sockets.js';
import { createAllConnectors } from './connector.js';

function createBasePlateGeometry(plateWidth: number, plateHeight: number, topPlateThickness: number) {
  return cube([plateWidth, plateHeight, topPlateThickness]).translate([
    plateWidth / 2,
    plateHeight / 2,
    -topPlateThickness / 2,
  ]);
}

export function generateKeyboardPlate(
  allKeyPlacements: KeyPlacement[],
  plateWidth: number,
  plateHeight: number,
  plateOffset: Point2D,
  config: KeyboardConfig,
) {
  const basePlateGeometry = createBasePlateGeometry(plateWidth, plateHeight, config.enclosure.plate.thickness);

  // Create all switch-related cutouts using the extracted module
  const { allCutouts } = createAllSwitchCutouts(allKeyPlacements, plateOffset, config);

  // Create frame outer boundary cutouts
  const frameOuterBoundGeometry = createFrameOuterBoundCutouts(
    allKeyPlacements,
    plateOffset,
    config.enclosure.frame.wallThickness,
    config.enclosure.frame.scaleFactor,
    config.switch.plate.totalThickness,
    config.switch.cutout.thinZone,
  );

  const plateWithFrameGeometry = difference(
    basePlateGeometry,
    union(...frameOuterBoundGeometry)
      .scale([1, 1, config.computed.manufacturingScaleMargin])
      .translate([0, 0, config.tolerances.general]),
  );

  const cornerMountGeometry = union(...createCornerHeatInsertMounts(plateWidth, plateHeight, config));
  const frameStructureGeometry = difference(union(...frameOuterBoundGeometry), allCutouts);
  const topWallGeometry = createTopWalls(plateWidth, plateHeight, config);

  // Create all connector cutouts
  const connectorCutouts = createAllConnectors(plateWidth, plateHeight, config);

  if (connectorCutouts.length > 0) {
    // Apply all connector cutouts to both walls and corner mounts
    const allConnectorCutouts = union(...connectorCutouts);
    const topWallWithCutouts = difference(topWallGeometry, allConnectorCutouts);
    const cornerMountWithCutouts = difference(cornerMountGeometry, allConnectorCutouts);

    return union(plateWithFrameGeometry, frameStructureGeometry, topWallWithCutouts, cornerMountWithCutouts);
  }

  return union(plateWithFrameGeometry, frameStructureGeometry, topWallGeometry, cornerMountGeometry);
}
