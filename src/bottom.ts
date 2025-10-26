import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { difference, hull, type ScadObject, union } from 'scad-js';
import { createSiliconPadSocketStructures, createSocketExclusionZones } from './bottom-pads-sockets.js';
import { createBottomPattern } from './bottom-patterns.js';
import { createAllConnectors } from './connector.js';
import type { KeyboardConfig } from './interfaces.js';
import { createRoundedSquare } from './utils.js';

const createConnectorCutouts = (
  plateWidth: number,
  plateHeight: number,
  offset: number,
  wallThickness: number,
  topWallHeight: number,
  bottomThickness: number,
  config: KeyboardConfig,
) => {
  if (!config.connectors || config.connectors.length === 0) {
    return null;
  }

  const allConnectors = createAllConnectors(
    plateWidth - 2 * wallThickness,
    plateHeight - 2 * wallThickness,
    offset,
    config,
  );

  const enabledConnectors = pipe(
    allConnectors,
    A.filter((c): c is ScadObject => c !== null),
  );

  const bottomConnectors = enabledConnectors;
  const topConnectors = enabledConnectors.map((c) => c.translate_z(topWallHeight / 2));

  return union(...A.zipWith(bottomConnectors, topConnectors, (a, b) => hull(a, b))).translate([
    wallThickness,
    wallThickness,
    bottomThickness,
  ]);
};

export function generateBottomCase(plateWidth: number, plateHeight: number, config: KeyboardConfig) {
  const wallThickness = config.enclosure.walls.thickness;
  const bottomThickness = config.enclosure.plate.bottomThickness;
  const topWallHeight = config.enclosure.walls.height;
  const plateThickness = config.enclosure.plate.topThickness;
  const totalHeight = plateThickness + topWallHeight;

  const dimensions = {
    outerWidth: plateWidth + 2 * wallThickness,
    outerHeight: plateHeight + 2 * wallThickness,
  };

  const squares = {
    outer: createRoundedSquare(dimensions.outerWidth, dimensions.outerHeight),
    base: createRoundedSquare(plateWidth, plateHeight),
    inner: createRoundedSquare(plateWidth - 2 * wallThickness, plateHeight - 2 * wallThickness),
  };

  const baseGeometry = union(
    squares.outer.linear_extrude(bottomThickness),
    difference(squares.base, squares.inner)
      .linear_extrude(totalHeight - plateThickness)
      .translate_z(bottomThickness),
  ).translate([dimensions.outerWidth / 2, dimensions.outerHeight / 2, 0]);

  const offset = wallThickness;

  const connectorCutouts = createConnectorCutouts(
    plateWidth,
    plateHeight,
    offset,
    wallThickness,
    topWallHeight,
    bottomThickness,
    config,
  );

  const socketStructures = createSiliconPadSocketStructures(plateWidth, plateHeight, bottomThickness, config);

  const socketExclusions = createSocketExclusionZones(plateWidth, plateHeight, config);

  const patternCutout = pipe(
    createBottomPattern(dimensions.outerWidth, dimensions.outerHeight, config),
    O.map((pattern2D) => {
      const patternWithExclusions = socketExclusions ? difference(pattern2D, socketExclusions) : pattern2D;
      return patternWithExclusions.linear_extrude(bottomThickness + 0.2).translate([0, 0, -0.1]);
    }),
    O.toNullable,
  );

  return pipe(
    baseGeometry,
    (geometry) => (socketStructures.reinforcements ? union(geometry, socketStructures.reinforcements) : geometry),
    (geometry) => (patternCutout ? difference(geometry, patternCutout) : geometry),
    (geometry) => (connectorCutouts ? difference(geometry, connectorCutouts) : geometry),
    (geometry) => (socketStructures.cutouts ? difference(geometry, socketStructures.cutouts) : geometry),
  );
}
