import { CONFIG, type Point2D, type KeyPlacement } from './config.js';

// Utility functions
export const calculateHalfIndex = (n: number) => (n - 1) / 2;
export const convertDegreesToRadians = (degrees: number) => (Math.PI * degrees) / 180;
export const calculateAbsoluteCosineSine = (angle: number) => Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle));

export function rotatePoint(point: Point2D, pivot: Point2D, degrees: number): Point2D {
  if (!degrees) return point;
  
  const radians = convertDegreesToRadians(degrees);
  const cosValue = Math.cos(radians);
  const sinValue = Math.sin(radians);
  const deltaX = point.x - pivot.x;
  const deltaY = point.y - pivot.y;
  
  return {
    x: pivot.x + cosValue * deltaX - sinValue * deltaY,
    y: pivot.y + sinValue * deltaX + cosValue * deltaY
  };
}

/**
 * Generates key positions for the right hand half of the keyboard
 * Includes both the main matrix keys and thumb cluster
 */
export function buildRightHandLayout(config = CONFIG): KeyPlacement[] {
  const keyPlacements: KeyPlacement[] = [];
  const rowHalfIndex = calculateHalfIndex(config.rows);
  
  // Generate main matrix keys in a grid pattern
  for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
    const rowYPosition = (rowHalfIndex - rowIndex) * config.pitch;
    const rowXOffset = config.baseRowOffsets[rowIndex] ?? 0;
    
    for (let colIndex = 0; colIndex < config.cols; colIndex++) {
      const colXPosition = (colIndex - calculateHalfIndex(config.cols)) * config.pitch + rowXOffset;
      keyPlacements.push({ 
        pos: { x: colXPosition, y: rowYPosition }, 
        rot: 0 
      });
    }
  }

  // Generate thumb cluster with ergonomic positioning
  const baseBottomYPosition = -rowHalfIndex * config.pitch;
  const thumbAnchorPoint: Point2D = { 
    x: config.thumbXOffset, 
    y: baseBottomYPosition - config.thumbYOffset 
  };
  const thumbHalfIndex = calculateHalfIndex(config.thumbKeys);

  for (let thumbIndex = 0; thumbIndex < config.thumbKeys; thumbIndex++) {
    const gridPosition: Point2D = config.thumbVertical
      ? { x: 0, y: (thumbHalfIndex - thumbIndex) * config.thumbPitch }
      : { x: (thumbIndex - thumbHalfIndex) * config.thumbPitch, y: 0 };

    const keyOffset = config.thumbPerKeyOffset[thumbIndex] ?? { x: 0, y: 0 };
    const preRotationPosition = { 
      x: thumbAnchorPoint.x + gridPosition.x + keyOffset.x, 
      y: thumbAnchorPoint.y + gridPosition.y + keyOffset.y 
    };
    
    const worldPosition = rotatePoint(preRotationPosition, thumbAnchorPoint, config.thumbClusterRotation);
    const totalRotation = (config.thumbPerKeyRotation[thumbIndex] ?? 0) + config.thumbClusterRotation;

    keyPlacements.push({ pos: worldPosition, rot: totalRotation });
  }

  return keyPlacements;
}

export function applyGlobalRotation(keyPlacements: KeyPlacement[], config = CONFIG): KeyPlacement[] {
  if (!config.baseRotationDegrees) return keyPlacements;
  
  return keyPlacements.map(({ pos, rot }) => ({
    pos: rotatePoint(pos, { x: 0, y: 0 }, config.baseRotationDegrees),
    rot: rot + config.baseRotationDegrees,
  }));
}

export function createSplitLayout(config = CONFIG) {
  const rightHandKeys = applyGlobalRotation(buildRightHandLayout(config), config);

  const { maximumKeySize } = config;
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
  const targetRightCenterXPosition = groupHalfWidth + config.centerGap / 2;
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
  
  switch (config.buildSide) {
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
  const { maximumKeySize } = config;
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
  
  const plateWidth = (maximumXPosition - minimumXPosition) + 2 * config.edgeMargin;
  const plateHeight = (maximumYPosition - minimumYPosition) + 2 * config.edgeMargin;
  const plateOffset: Point2D = { 
    x: -minimumXPosition + config.edgeMargin, 
    y: -minimumYPosition + config.edgeMargin 
  };
  
  return { plateWidth, plateHeight, plateOffset };
}