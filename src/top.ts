import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { difference, type ScadObject, union } from 'scad-js';
import { createAllConnectors } from './connector.js';
import type { KeyboardConfig, KeyPlacement, Point2D } from './interfaces.js';
import { createOrganicWallBox } from './organic-case.js';
import { createAllSwitchCutouts } from './switch-sockets.js';
import { createRoundedSquare } from './utils.js';

const createOuterWallBox = (
  outerWidth: number,
  outerHeight: number,
  plateWidth: number,
  plateHeight: number,
  totalHeight: number,
  plateThickness: number,
) => {
  const outerSquare = createRoundedSquare(outerWidth, outerHeight);
  const baseSquare = createRoundedSquare(plateWidth, plateHeight);

  return difference(
    outerSquare.linear_extrude(totalHeight),
    baseSquare.linear_extrude(totalHeight - plateThickness + 0.1).translate_z(-0.1),
  ).translate([outerWidth / 2, outerHeight / 2, 0]);
};

const createSwitchCutouts = (keyPlacements: KeyPlacement[], size: number, height: number, zOffset: number) =>
  union(...createAllSwitchCutouts(keyPlacements, size, height + 0.1)).translate_z(zOffset);

const createSwitchFrame = (
  keyPlacements: KeyPlacement[],
  innerSize: number,
  frameThickness: number,
  height: number,
  zOffset: number,
) =>
  difference(
    union(...createAllSwitchCutouts(keyPlacements, innerSize + frameThickness, height)),
    union(...createAllSwitchCutouts(keyPlacements, innerSize, height + 0.1)).translate_z(-0.05),
  ).translate_z(zOffset);

const createConnectorCutouts = (
  plateWidth: number,
  plateHeight: number,
  plateOffset: Point2D,
  config: KeyboardConfig,
) => {
  const allConnectors = createAllConnectors(plateWidth, plateHeight, 0, config);
  const enabledConnectors = pipe(
    allConnectors,
    A.filter((c): c is ScadObject => c !== null),
  );

  return enabledConnectors.length > 0 ? union(...enabledConnectors).translate([plateOffset.x, plateOffset.y, 0]) : null;
};

export function generateKeyboardPlate(
  keyPlacements: KeyPlacement[],
  plateWidth: number,
  plateHeight: number,
  plateOffset: Point2D,
  config: KeyboardConfig,
) {
  const { thickness: wallThickness, height: topWallHeight } = config.enclosure.walls;
  const plateThickness = config.enclosure.plate.topThickness;
  const { outer, inner, height, startHeight } = config.switch.cutout;
  const caseStyle = config.enclosure.caseStyle ?? 'rectangular';

  const totalHeight = plateThickness + topWallHeight;
  const outerWidth = plateWidth + 2 * wallThickness;
  const outerHeight = plateHeight + 2 * wallThickness;

  // Object literal pattern for case style selection
  const wallBoxCreators = {
    rectangular: () =>
      createOuterWallBox(outerWidth, outerHeight, plateWidth, plateHeight, totalHeight, plateThickness),
    organic: () =>
      createOrganicWallBox(
        keyPlacements,
        outer,
        config.layout.edgeMargin,
        wallThickness,
        totalHeight,
        plateThickness,
        config.enclosure.organicCornerRadius ?? 0,
      ),
  };

  const wallBox = wallBoxCreators[caseStyle]();

  const switchCutouts = createSwitchCutouts(keyPlacements, outer, plateThickness, topWallHeight - 0.05);

  const switchFrame = createSwitchFrame(keyPlacements, inner, 2.6, height, topWallHeight - startHeight);

  const reinforcementFrame = createSwitchFrame(keyPlacements, outer, 3, height + 2.55, topWallHeight - 2.55 - 0.05);

  const connectorCutouts = createConnectorCutouts(plateWidth, plateHeight, plateOffset, config);

  return pipe(union(difference(wallBox, switchCutouts), switchFrame, reinforcementFrame), (geometry) =>
    connectorCutouts ? difference(geometry, connectorCutouts) : geometry,
  );
}
