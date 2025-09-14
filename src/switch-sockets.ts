import { square, union } from 'scad-js';
import type { KeyPlacement } from './interfaces.js';

const createRotatedSquareGeometry = (
  keySize: number,
  extrusionHeight: number,
  centerXPosition: number,
  centerYPosition: number,
  rotationDegrees: number,
) => 
  square([keySize, keySize], { center: true })
    .rotate([0, 0, rotationDegrees])
    .linear_extrude(extrusionHeight)
    .translate([centerXPosition, centerYPosition, 0]);

export const createAllSwitchCutouts = (
  keyPlacements: KeyPlacement[], 
  size: number, 
  height: number
) => 
  keyPlacements.map(({ pos: { x, y }, rot }) =>
    createRotatedSquareGeometry(size, height, x, y, rot)
  );
