import { difference, union, circle, square, type ScadObject } from 'scad-js';
import type { KeyboardConfig, SiliconPadSocket } from './interfaces.js';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

/**
 * Creates reinforced silicon pad socket structures with anchor-based positioning
 *
 * Features:
 * - Anchor-based positioning (top-left, top-right, bottom-left, bottom-right, center)
 * - Size-aware boundary calculations including reinforcement and wall thickness
 * - Additive reinforcement (thickness and height added to socket dimensions)
 * - Support for round and square socket shapes
 */

export interface SocketStructures {
  reinforcements: ScadObject | null;
  cutouts: ScadObject | null;
}

/**
 * Calculate socket boundary including reinforcement for anchor positioning
 */
function calculateSocketBoundary(socket: SiliconPadSocket): number {
  const boundaryCalculators = {
    round: () => {
      const radius = socket.size.radius || 5;
      const additionalThickness = socket.reinforcement?.thickness || 2.0;
      return radius + additionalThickness;
    },
    square: () => {
      const width = socket.size.width || 10;
      const height = socket.size.height || 10;
      const additionalThickness = socket.reinforcement?.thickness || 1.5;
      const maxDimension = Math.max(width, height);
      return (maxDimension + 2 * additionalThickness) / 2;
    },
  };

  return boundaryCalculators[socket.shape]();
}

/**
 * Calculate anchor position placing socket center at external plate edge
 */
function calculateAnchorPosition(
  socket: SiliconPadSocket,
  plateWidth: number,
  plateHeight: number,
  wallThickness: number,
  socketBoundary: number,
): { x: number; y: number } {
  // External plate dimensions include walls
  const externalWidth = plateWidth + 2 * wallThickness;
  const externalHeight = plateHeight + 2 * wallThickness;

  const anchorCalculators = {
    'top-left': () => ({ x: socketBoundary, y: externalHeight - socketBoundary }),
    'top-right': () => ({ x: externalWidth - socketBoundary, y: externalHeight - socketBoundary }),
    'bottom-left': () => ({ x: socketBoundary, y: socketBoundary }),
    'bottom-right': () => ({ x: externalWidth - socketBoundary, y: socketBoundary }),
    center: () => ({ x: externalWidth / 2, y: externalHeight / 2 }),
  };

  const calculateAnchor = anchorCalculators[socket.position.anchor] || anchorCalculators.center;
  const { x, y } = calculateAnchor();

  return {
    x: x + socket.position.offset.x,
    y: y + socket.position.offset.y,
  };
}

/**
 * Create socket shape geometry (inner cutout and outer reinforcement)
 */
function createSocketShapes(socket: SiliconPadSocket): { socketShape: ScadObject; reinforcementShape: ScadObject } {
  const shapeCreators = {
    round: () => {
      const radius = socket.size.radius || 5;
      const additionalThickness = socket.reinforcement?.thickness || 2.0;

      return {
        socketShape: circle(radius),
        reinforcementShape: circle(radius + additionalThickness),
      };
    },
    square: () => {
      const width = socket.size.width || 10;
      const height = socket.size.height || 10;
      const additionalThickness = socket.reinforcement?.thickness || 1.5;

      return {
        socketShape: square([width, height], { center: true }),
        reinforcementShape: square([width + 2 * additionalThickness, height + 2 * additionalThickness], { center: true }),
      };
    },
  };

  return shapeCreators[socket.shape]();
}

const createSocketGeometry = (
  socket: SiliconPadSocket,
  plateWidth: number,
  plateHeight: number,
  wallThickness: number,
  bottomThickness: number,
) => {
  const additionalHeight = socket.reinforcement?.height || 1.0;
  const reinforcementHeight = Math.max(socket.depth + additionalHeight, bottomThickness);
  const socketBoundary = calculateSocketBoundary(socket);
  const position = calculateAnchorPosition(socket, plateWidth, plateHeight, wallThickness, socketBoundary);
  const { socketShape, reinforcementShape } = createSocketShapes(socket);

  return {
    reinforcement: difference(
      reinforcementShape.linear_extrude(reinforcementHeight),
      socketShape.linear_extrude(socket.depth),
    ).translate([position.x, position.y, 0]),
    cutout: socketShape.linear_extrude(socket.depth + 0.1).translate([position.x, position.y, -0.1]),
  };
};

const createUnionOrNull = (geometries: ScadObject[]) =>
  pipe(
    geometries,
    O.fromPredicate((arr) => arr.length > 0),
    O.map((arr) => union(...arr)),
    O.toNullable,
  );

/**
 * Main function to create silicon pad socket structures
 */
export function createSiliconPadSocketStructures(
  plateWidth: number,
  plateHeight: number,
  bottomThickness: number,
  config: KeyboardConfig,
): SocketStructures {
  const wallThickness = config.enclosure.walls.thickness;

  return pipe(
    config.enclosure.bottomPadsSockets ?? [],
    O.fromPredicate((sockets) => sockets.length > 0),
    O.map((sockets): SocketStructures => {
      const geometries = pipe(
        sockets,
        A.map((socket) => createSocketGeometry(socket, plateWidth, plateHeight, wallThickness, bottomThickness)),
      );

      const reinforcements = createUnionOrNull(geometries.map((g) => g.reinforcement));
      const cutouts = createUnionOrNull(geometries.map((g) => g.cutout));

      return { reinforcements, cutouts };
    }),
    O.getOrElse((): SocketStructures => ({ reinforcements: null, cutouts: null })),
  );
}
