import { CONFIG, type Point2D, type KeyPlacement } from './config.js';
import { calculateHalfIndex, convertDegreesToRadians, calculateAbsoluteCosineSine, rotatePoint } from './utils.js';

/**
 * Generates key positions for the right hand half of the keyboard
 * Includes both the main matrix keys and thumb cluster
 */
export function buildRightHandLayout(config = CONFIG): KeyPlacement[] {
  const keyPlacements: KeyPlacement[] = [];
  const rowHalfIndex = calculateHalfIndex(config.layout.matrix.rows);
  
  // Generate main matrix keys in a grid pattern
  for (let rowIndex = 0; rowIndex < config.layout.matrix.rows; rowIndex++) {
    const rowYPosition = (rowHalfIndex - rowIndex) * config.layout.matrix.pitch;
    const rowXOffset = config.layout.matrix.baseRowOffsets[rowIndex] ?? 0;
    
    for (let colIndex = 0; colIndex < config.layout.matrix.cols; colIndex++) {
      const colXPosition = (colIndex - calculateHalfIndex(config.layout.matrix.cols)) * config.layout.matrix.pitch + rowXOffset;
      keyPlacements.push({ 
        pos: { x: colXPosition, y: rowYPosition }, 
        rot: 0 
      });
    }
  }

  // Generate thumb cluster with ergonomic positioning
  const baseBottomYPosition = -rowHalfIndex * config.layout.matrix.pitch;
  const thumbAnchorPoint: Point2D = { 
    x: config.thumb.offset.x, 
    y: baseBottomYPosition - config.thumb.offset.y 
  };
  const thumbHalfIndex = calculateHalfIndex(config.thumb.cluster.keys);

  for (let thumbIndex = 0; thumbIndex < config.thumb.cluster.keys; thumbIndex++) {
    const gridPosition: Point2D = config.thumb.cluster.vertical
      ? { x: 0, y: (thumbHalfIndex - thumbIndex) * config.thumb.cluster.pitch }
      : { x: (thumbIndex - thumbHalfIndex) * config.thumb.cluster.pitch, y: 0 };

    const keyOffset = config.thumb.perKey.offsets[thumbIndex] ?? { x: 0, y: 0 };
    const preRotationPosition = { 
      x: thumbAnchorPoint.x + gridPosition.x + keyOffset.x, 
      y: thumbAnchorPoint.y + gridPosition.y + keyOffset.y 
    };
    
    const worldPosition = rotatePoint(preRotationPosition, thumbAnchorPoint, config.thumb.cluster.rotation);
    const totalRotation = (config.thumb.perKey.rotations[thumbIndex] ?? 0) + config.thumb.cluster.rotation;

    keyPlacements.push({ pos: worldPosition, rot: totalRotation });
  }

  return keyPlacements;
}

export function applyGlobalRotation(keyPlacements: KeyPlacement[], config = CONFIG): KeyPlacement[] {
  if (!config.layout.rotation.baseDegrees) return keyPlacements;
  
  return keyPlacements.map(({ pos, rot }) => ({
    pos: rotatePoint(pos, { x: 0, y: 0 }, config.layout.rotation.baseDegrees),
    rot: rot + config.layout.rotation.baseDegrees,
  }));
}

export function createSplitLayout(config = CONFIG) {
  const rightHandKeys = applyGlobalRotation(buildRightHandLayout(config), config);

  const maximumKeySize = config.computed.maximumKeySize;
  let minimumXPosition = Infinity;
  let maximumXPosition = -Infinity;
  
  for (const { pos, rot } of rightHandKeys) {
    const normalizedAngle = convertDegreesToRadians(((rot % 360) + 360) % 360);
    const rotationExtent = 0.5 * calculateAbsoluteCosineSine(normalizedAngle) * maximumKeySize;
    minimumXPosition = Math.min(minimumXPosition, pos.x - rotationExtent);
    maximumXPosition = Math.max(maximumXPosition, pos.x + rotationExtent);
  }
  
  const groupCenterXPosition = (minimumXPosition + maximumXPosition) / 2;
  const groupHalfWidth = (maximumXPosition - minimumXPosition) / 2;
  const targetRightCenterXPosition = groupHalfWidth + config.layout.spacing.centerGap / 2;
  const xPositionOffset = targetRightCenterXPosition - groupCenterXPosition;

  const rightPlacedKeys = rightHandKeys.map(({ pos, rot }) => ({ 
    pos: { x: pos.x + xPositionOffset, y: pos.y }, 
    rot 
  }));
  
  const leftPlacedKeys = rightPlacedKeys.map(({ pos, rot }) => ({ 
    pos: { x: -pos.x, y: pos.y }, 
    rot: -rot 
  }));

  return { rightPlaced: rightPlacedKeys, leftPlaced: leftPlacedKeys };
}

export function getLayoutForBuildSide(config = CONFIG) {
  const { rightPlaced, leftPlaced } = createSplitLayout(config);
  
  switch (config.layout.build.side) {
    case 'left':
      return leftPlaced;
    case 'right':
      return rightPlaced;
    case 'both':
    default:
      return [...rightPlaced, ...leftPlaced];
  }
}

export function calculatePlateDimensions(keyPlacements: KeyPlacement[], config = CONFIG) {
  const maximumKeySize = config.computed.maximumKeySize;
  let minimumXPosition = Infinity;
  let maximumXPosition = -Infinity;
  let minimumYPosition = Infinity;
  let maximumYPosition = -Infinity;
  
  for (const { pos, rot } of keyPlacements) {
    const normalizedAngle = convertDegreesToRadians(((rot % 360) + 360) % 360);
    const rotationExtent = 0.5 * calculateAbsoluteCosineSine(normalizedAngle) * maximumKeySize;
    minimumXPosition = Math.min(minimumXPosition, pos.x - rotationExtent);
    maximumXPosition = Math.max(maximumXPosition, pos.x + rotationExtent);
    minimumYPosition = Math.min(minimumYPosition, pos.y - rotationExtent);
    maximumYPosition = Math.max(maximumYPosition, pos.y + rotationExtent);
  }
  
  const plateWidth = (maximumXPosition - minimumXPosition) + 2 * config.layout.spacing.edgeMargin;
  const plateHeight = (maximumYPosition - minimumYPosition) + 2 * config.layout.spacing.edgeMargin;
  const plateOffset: Point2D = { 
    x: -minimumXPosition + config.layout.spacing.edgeMargin, 
    y: -minimumYPosition + config.layout.spacing.edgeMargin 
  };
  
  return { plateWidth, plateHeight, plateOffset };
}