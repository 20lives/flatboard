import { difference, union } from 'scad-js';
import type { KeyboardConfig, KeyPlacement, Point2D } from './interfaces.js';
import { createAllConnectors } from './connector.js';
import { createAllSwitchCutouts } from './switch-sockets.js';
import { createRoundedSquare } from './utils.js';

export function generateKeyboardPlate(
  keyPlacements: KeyPlacement[],
  plateWidth: number,
  plateHeight: number,
  plateOffset: Point2D,
  config: KeyboardConfig,
) {
  const wallThickness = config.enclosure.walls.thickness;
  const topWallHeight = config.enclosure.walls.height;
  const plateThickness = config.enclosure.plate.topThickness;
  const totalHeight = plateThickness + topWallHeight;

  const outerWidth = plateWidth + 2 * wallThickness;
  const outerHeight = plateHeight + 2 * wallThickness;

  const outerSquare = createRoundedSquare(outerWidth, outerHeight);
  const baseSquare = createRoundedSquare(plateWidth, plateHeight);

  const { outer, inner, height, startHeight } = config.switch.cutout;

  let topBox = difference(
    outerSquare.linear_extrude(totalHeight),
    baseSquare.linear_extrude(totalHeight - plateThickness + 0.1).translate([0, 0, -0.1]),
  ).translate([outerWidth / 2, outerHeight / 2, 0]);

  const switchCutouts = union(...createAllSwitchCutouts(keyPlacements, outer, plateThickness + 0.1))
    .translate([0, 0, topWallHeight - 0.05]);

  const switchFrame = difference(
    union(...createAllSwitchCutouts(keyPlacements, inner + 2.6, height + 0.0)),
    union(...createAllSwitchCutouts(keyPlacements, inner + 0.0, height + 0.1))
      .translate([0, 0, -0.05]),
  ).translate([0, 0, topWallHeight - startHeight]);

  const switchReinforcementFrame = difference(
    union(...createAllSwitchCutouts(keyPlacements, outer + 3, height + 2.55 + 0.0)),
    union(...createAllSwitchCutouts(keyPlacements, outer + 0, height + 2.55 + 0.1))
      .translate([0, 0, -0.05]),
  ).translate([0, 0, topWallHeight - 2.55 - 0.05]);

  const plateWithWalls = union(
    difference(topBox, switchCutouts),
    switchFrame,
    switchReinforcementFrame
  );

  const offset = 0;

  console.log('top width:', plateWidth);
  
  const connectorCutouts = createAllConnectors(plateWidth, plateHeight, offset, config);

  if (connectorCutouts.length > 0) {
    const translatedCutouts = union(...connectorCutouts)
      .translate([plateOffset.x, plateOffset.y, 0]);
    return difference(plateWithWalls, translatedCutouts);
  }
  
  return plateWithWalls;
}
