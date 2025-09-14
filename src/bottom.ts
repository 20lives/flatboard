import { difference, union, hull } from 'scad-js';
import type { KeyboardConfig } from './interfaces.js';
import { createRoundedSquare } from './utils.js';
import { createAllConnectors } from './connector.js';

import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

const createConnectorCutouts = (
  plateWidth: number,
  plateHeight: number,
  offset: number,
  wallThickness: number,
  topWallHeight: number,
  bottomThickness: number,
  config: KeyboardConfig
) => {
  if (config.connectors.length === 0) {
    return null;
  }

  console.log

  const bottomConnectors = createAllConnectors(plateWidth - 2 * wallThickness, plateHeight - 2 * wallThickness, offset, config);
  const topConnectors = bottomConnectors.map(c => c.translate([0, 0, topWallHeight / 2]));
  
  return union(...A.zipWith(bottomConnectors, topConnectors, (a, b) => hull(a, b)))
    .translate([wallThickness, wallThickness, bottomThickness]);
};

export function generateBottomCase(
  plateWidth: number, 
  plateHeight: number, 
  config: KeyboardConfig
) {
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
    inner: createRoundedSquare(plateWidth - 2 * wallThickness, plateHeight - 2 * wallThickness)
  };

  const baseGeometry = union(
    squares.outer.linear_extrude(bottomThickness),
    difference(squares.base, squares.inner)
      .linear_extrude(totalHeight - plateThickness)
      .translate([0, 0, bottomThickness]),
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

  return connectorCutouts ? difference(baseGeometry, connectorCutouts) : baseGeometry;
}
