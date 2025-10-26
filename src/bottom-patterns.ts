import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { circle, intersection, square, type ScadObject, union } from 'scad-js';
import type { BottomPatternConfig, KeyboardConfig } from './interfaces.js';
import { createRoundedSquare } from './utils.js';

function createHoneycombPattern(
  patternWidth: number,
  patternHeight: number,
  config: BottomPatternConfig,
): ScadObject | null {
  const { cellSize, wallThickness } = config;

  const smallDia = cellSize * Math.cos((30 * Math.PI) / 180);
  const projWall = wallThickness * Math.cos((30 * Math.PI) / 180);

  const yStep = smallDia + wallThickness;
  const xStep = (cellSize * 3) / 2 + projWall * 2;

  const yStepsCount = Math.ceil(patternHeight / 2 / yStep);
  const xStepsCount = Math.ceil(patternWidth / 2 / xStep);

  const hexagons: ScadObject[] = [];

  for (let yOffset = -yStep * yStepsCount; yOffset <= yStep * yStepsCount; yOffset += yStep) {
    for (let xOffset = -xStep * xStepsCount; xOffset <= xStep * xStepsCount; xOffset += xStep) {
      hexagons.push(circle(cellSize / 2, { $fn: 6 }).translate([xOffset, yOffset, 0]));

      const xOffsetStaggered = xOffset + (cellSize * 3) / 4 + projWall;
      const yOffsetStaggered = yOffset + (smallDia + wallThickness) / 2;

      hexagons.push(circle(cellSize / 2, { $fn: 6 }).translate([xOffsetStaggered, yOffsetStaggered, 0]));
    }
  }

  if (hexagons.length === 0) return null;

  const patternBoundary = square([patternWidth, patternHeight], { center: true });
  return intersection(union(...hexagons), patternBoundary);
}

function createCirclesPattern(
  patternWidth: number,
  patternHeight: number,
  config: BottomPatternConfig,
): ScadObject | null {
  const { cellSize, wallThickness } = config;

  const step = cellSize + wallThickness;
  const radius = cellSize / 2;

  const xStepsCount = Math.ceil(patternWidth / 2 / step);
  const yStepsCount = Math.ceil(patternHeight / 2 / step);

  const circles: ScadObject[] = [];
  let rowIndex = 0;

  for (let yOffset = -step * yStepsCount; yOffset <= step * yStepsCount; yOffset += step) {
    const xShift = rowIndex % 2 === 0 ? 0 : step / 2;

    for (let xOffset = -step * xStepsCount; xOffset <= step * xStepsCount; xOffset += step) {
      circles.push(circle(radius).translate([xOffset + xShift, yOffset, 0]));
    }

    rowIndex++;
  }

  if (circles.length === 0) return null;

  const patternBoundary = square([patternWidth, patternHeight], { center: true });
  return intersection(union(...circles), patternBoundary);
}

function createSquarePattern(
  patternWidth: number,
  patternHeight: number,
  config: BottomPatternConfig,
): ScadObject | null {
  const { cellSize, wallThickness } = config;

  const step = cellSize + wallThickness;

  const xStepsCount = Math.ceil(patternWidth / 2 / step);
  const yStepsCount = Math.ceil(patternHeight / 2 / step);

  const squares: ScadObject[] = [];
  let rowIndex = 0;

  for (let yOffset = -step * yStepsCount; yOffset <= step * yStepsCount; yOffset += step) {
    const xShift = rowIndex % 2 === 0 ? 0 : step / 2;

    for (let xOffset = -step * xStepsCount; xOffset <= step * xStepsCount; xOffset += step) {
      const roundedSquare = createRoundedSquare(cellSize, cellSize, 0.5);
      squares.push(roundedSquare.translate([xOffset + xShift, yOffset, 0]));
    }

    rowIndex++;
  }

  if (squares.length === 0) return null;

  const patternBoundary = square([patternWidth, patternHeight], { center: true });
  return intersection(union(...squares), patternBoundary);
}

export function createBottomPattern(
  outerWidth: number,
  outerHeight: number,
  config: KeyboardConfig,
): O.Option<ScadObject> {
  return pipe(
    config.enclosure.bottomPattern,
    O.fromNullable,
    O.chain((patternConfig) => {
      const { margin } = patternConfig;
      const patternWidth = outerWidth - 2 * margin;
      const patternHeight = outerHeight - 2 * margin;

      const patternGenerators: Record<string, () => ScadObject | null> = {
        honeycomb: () => createHoneycombPattern(patternWidth, patternHeight, patternConfig),
        circles: () => createCirclesPattern(patternWidth, patternHeight, patternConfig),
        square: () => createSquarePattern(patternWidth, patternHeight, patternConfig),
      };

      const generator = patternGenerators[patternConfig.type];
      const pattern2D = generator();

      return pipe(
        pattern2D,
        O.fromNullable,
        O.map((p) => p.translate([outerWidth / 2, outerHeight / 2, 0])),
      );
    }),
  );
}
