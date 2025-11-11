import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import type { KeyboardConfig, KeyPlacement } from './interfaces.js';
import { calculateAbsoluteCosineSine, calculateHalfIndex, convertDegreesToRadians, rotatePoint } from './utils.js';

function calculateKeyBounds(keyPlacements: KeyPlacement[], maxKeySize: number) {
  const coordinatePairs = pipe(
    keyPlacements,
    A.map(({ pos, rot }) => {
      const normalizedAngle = convertDegreesToRadians(((rot % 360) + 360) % 360);
      const rotationExtent = 0.5 * calculateAbsoluteCosineSine(normalizedAngle) * maxKeySize;

      return {
        xBounds: [pos.x - rotationExtent, pos.x + rotationExtent],
        yBounds: [pos.y - rotationExtent, pos.y + rotationExtent],
      };
    }),
  );

  const xCoordinates = pipe(
    coordinatePairs,
    A.chain(({ xBounds }) => xBounds),
  );
  const yCoordinates = pipe(
    coordinatePairs,
    A.chain(({ yBounds }) => yBounds),
  );

  return {
    minX: Math.min(...xCoordinates),
    maxX: Math.max(...xCoordinates),
    minY: Math.min(...yCoordinates),
    maxY: Math.max(...yCoordinates),
  };
}

const createMatrixKey = (
  rowIndex: number,
  keyIndex: number,
  row: { start: number; length: number; offset?: number },
  matrixSpacing: number,
): KeyPlacement => ({
  pos: {
    x: (row.start + keyIndex) * matrixSpacing + (row.offset ?? 0),
    y: rowIndex * matrixSpacing,
  },
  rot: 0,
});

const createThumbKey = (
  thumbIndex: number,
  thumbAnchorPosition: { x: number; y: number },
  thumbSpacing: number,
  thumbCenterOffset: number,
  clusterRotation: number,
  perKeyConfig?: { rotations?: number[]; offsets?: { x: number; y: number }[] },
): KeyPlacement => {
  const gridPosition = { x: 0, y: (thumbCenterOffset - thumbIndex) * thumbSpacing };
  const perKeyOffset = perKeyConfig?.offsets?.[thumbIndex] ?? { x: 0, y: 0 };

  const preRotationPosition = {
    x: thumbAnchorPosition.x + gridPosition.x + perKeyOffset.x,
    y: thumbAnchorPosition.y + gridPosition.y + perKeyOffset.y,
  };

  const finalPosition = rotatePoint(preRotationPosition, thumbAnchorPosition, clusterRotation);
  const finalRotation = (perKeyConfig?.rotations?.[thumbIndex] ?? 0) + clusterRotation;

  return { pos: finalPosition, rot: finalRotation };
};

function buildLayout(config: KeyboardConfig): KeyPlacement[] {
  const { rowLayout } = config.layout.matrix;

  if (!rowLayout?.length) {
    throw new Error('rowLayout must be defined and non-empty. All profiles must use the unified rowLayout system.');
  }

  const matrixSpacing = config.layout.matrix.spacing;

  const matrixKeysWithAnchor = pipe(
    rowLayout,
    A.mapWithIndex((rowIndex, row) => (row ? O.some({ row, rowIndex }) : O.none)),
    A.compact,
    A.chain(({ row, rowIndex }) =>
      pipe(
        A.makeBy(row.length, (keyIndex) => ({
          key: createMatrixKey(rowIndex, keyIndex, row, matrixSpacing),
          isAnchor: row.thumbAnchor === row.start + keyIndex,
          anchorOffset: {
            x: (row.start + keyIndex) * matrixSpacing + (row.offset ?? 0),
            y: rowIndex * matrixSpacing,
          },
        })),
      ),
    ),
  );

  if (!config.thumb?.cluster?.keys || config.thumb.cluster.keys === 0) {
    return pipe(
      matrixKeysWithAnchor,
      A.map(({ key }) => key),
    );
  }

  const baseThumbAnchor = { x: config.thumb.offset?.x ?? 0, y: config.thumb.offset?.y ?? 0 };

  const thumbAnchorOffset = pipe(
    matrixKeysWithAnchor,
    A.filter(({ isAnchor }) => isAnchor),
    A.reduce({ x: 0, y: 0 }, (acc, { anchorOffset }) => ({
      x: acc.x + anchorOffset.x,
      y: acc.y + anchorOffset.y,
    })),
  );

  const thumbAnchorPosition = {
    x: baseThumbAnchor.x + thumbAnchorOffset.x,
    y: baseThumbAnchor.y + thumbAnchorOffset.y,
  };

  const { spacing: thumbSpacing = 18, rotation: clusterRotation = 0, keys: thumbKeyCount } = config.thumb.cluster;
  const thumbCenterOffset = calculateHalfIndex(thumbKeyCount);
  const perKeyConfig = config.thumb.perKey;

  const thumbKeys = pipe(
    A.makeBy(thumbKeyCount, (thumbIndex) => thumbIndex),
    A.map((thumbIndex) =>
      createThumbKey(thumbIndex, thumbAnchorPosition, thumbSpacing, thumbCenterOffset, clusterRotation, perKeyConfig),
    ),
  );

  return pipe(
    matrixKeysWithAnchor,
    A.map(({ key }) => key),
    A.concat(thumbKeys),
  );
}

function applyGlobalRotation(keyPlacements: KeyPlacement[], config: KeyboardConfig): KeyPlacement[] {
  const { baseDegrees } = config.layout;
  if (!baseDegrees) return keyPlacements;

  const origin = { x: 0, y: 0 };
  return keyPlacements.map(({ pos, rot }) => ({
    pos: rotatePoint(pos, origin, baseDegrees),
    rot: rot + baseDegrees,
  }));
}

function mirrorLayout(keyPlacements: KeyPlacement[], centerGap: number, maxKeySize: number): KeyPlacement[] {
  // Calculate the bounds of the original layout
  const yCoordinates = keyPlacements.map(({ pos }) => pos.y);
  const maxY = Math.max(...yCoordinates);
  const minY = Math.min(...yCoordinates);

  // The center of the original layout
  const centerY = (maxY + minY) / 2;

  // Offset to move left half down and right half up
  const halfExtent = (maxY - minY) / 2 + maxKeySize / 2;
  const halfGap = centerGap / 2;

  const leftHalf = keyPlacements.map(({ pos, rot }) => ({
    pos: { x: pos.x, y: -(pos.y - centerY) - halfGap - halfExtent },
    rot: -rot,
  }));

  const rightHalf = keyPlacements.map(({ pos, rot }) => ({
    pos: { x: pos.x, y: pos.y - centerY + halfGap + halfExtent },
    rot,
  }));

  return pipe(leftHalf, A.concat(rightHalf));
}

export function getLayout(config: KeyboardConfig): KeyPlacement[] {
  const rotatedKeys = applyGlobalRotation(buildLayout(config), config);

  const finalKeys =
    config.layout.mode === 'unibody' && config.layout.centerGap !== undefined
      ? mirrorLayout(rotatedKeys, config.layout.centerGap, config.switch.cutout.outer)
      : rotatedKeys;

  const bounds = calculateKeyBounds(finalKeys, config.switch.cutout.outer);
  const { edgeMargin } = config.layout;
  const wallThickness = config.enclosure.walls.thickness;

  const offsetX = -bounds.minX + edgeMargin.left + wallThickness;
  const offsetY = -bounds.minY + edgeMargin.top + wallThickness;

  return finalKeys.map(({ rot, pos }) => ({
    rot,
    pos: {
      x: pos.x + offsetX,
      y: pos.y + offsetY,
    },
  }));
}

export function calculatePlateDimensions(keyPlacements: KeyPlacement[], config: KeyboardConfig) {
  const bounds = calculateKeyBounds(keyPlacements, config.switch.cutout.outer);
  const { edgeMargin } = config.layout;

  return {
    plateWidth: bounds.maxX - bounds.minX + edgeMargin.left + edgeMargin.right,
    plateHeight: bounds.maxY - bounds.minY + edgeMargin.top + edgeMargin.bottom,
    plateOffset: { x: 0, y: 0 },
  };
}
