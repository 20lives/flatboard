import { square, union } from "scad-js";
import { type KeyPlacement, type Point2D } from './config.js';

/**
 * Creates a rotated square geometry for switch cutouts
 */
function createRotatedSquareGeometry(keySize: number, centerXPosition: number, centerYPosition: number, rotationDegrees: number, extrusionHeight: number) {
  return square([keySize, keySize], { center: true })
    .rotate([0, 0, rotationDegrees])
    .linear_extrude(extrusionHeight)
    .translate([centerXPosition, centerYPosition, 0]);
}

/**
 * Creates cutout geometry for key placements
 */
export function createKeyCutoutGeometry(keyPlacements: KeyPlacement[], plateOffset: Point2D, cutoutSize: number, cutoutHeight: number, zPositionOffset = 0) {
  return keyPlacements.map(({ pos, rot }) =>
    createRotatedSquareGeometry(
      cutoutSize,
      pos.x + plateOffset.x,
      pos.y + plateOffset.y,
      rot,
      cutoutHeight
    ).translate([0, 0, zPositionOffset])
  );
}

/**
 * Creates switch hole cutouts for key switches
 */
export function createSwitchHoleCutouts(keyPlacements: KeyPlacement[], plateOffset: Point2D, generalClearance: number, effectiveTotalThickness: number, effectiveCutoutSize: number) {
  return createKeyCutoutGeometry(
    keyPlacements, 
    plateOffset, 
    effectiveCutoutSize,
    effectiveTotalThickness + generalClearance * 2,
    -generalClearance - effectiveTotalThickness
  );
}

/**
 * Creates thin zone cutouts around switches for socket clearance
 */
export function createThinZoneCutouts(keyPlacements: KeyPlacement[], plateOffset: Point2D, frameStructureHeight: number, generalClearance: number, effectiveThinZone: number) {
  return createKeyCutoutGeometry(
    keyPlacements, 
    plateOffset, 
    effectiveThinZone,
    frameStructureHeight + generalClearance, 
    -frameStructureHeight
  );
}

/**
 * Creates frame outer boundary cutouts
 */
export function createFrameOuterBoundCutouts(keyPlacements: KeyPlacement[], plateOffset: Point2D, frameWallThickness: number, frameScaleFactor: number, effectiveTotalThickness: number, effectiveThinZone: number) {
  return createKeyCutoutGeometry(
    keyPlacements, 
    plateOffset, 
    effectiveThinZone + frameWallThickness * frameScaleFactor,
    effectiveTotalThickness, 
    -effectiveTotalThickness
  );
}

/**
 * Creates all switch-related cutout geometry as a single union
 */
export function createAllSwitchCutouts(keyPlacements: KeyPlacement[], plateOffset: Point2D, config: any) {
  const { frameStructureHeight } = config;

  const switchHoleCutouts = createSwitchHoleCutouts(keyPlacements, plateOffset, config.generalClearance, config.totalThickness, config.cutoutSize);
  const thinZoneCutouts = createThinZoneCutouts(keyPlacements, plateOffset, frameStructureHeight, config.generalClearance, config.thinZone);
  const frameOuterBoundCutouts = createFrameOuterBoundCutouts(keyPlacements, plateOffset, config.frameWallThickness, config.frameScaleFactor, config.totalThickness, config.thinZone);

  return {
    switchHoleCutouts,
    thinZoneCutouts,
    frameOuterBoundCutouts,
    allCutouts: union(...switchHoleCutouts, ...thinZoneCutouts)
  };
}