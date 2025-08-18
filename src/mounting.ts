import { cube, cylinder, difference, union } from "scad-js";
import { type Point2D } from './config.js';

/**
 * Calculates the exact corner positions for mounting hardware
 * These positions are shared between heat inserts (top) and screw sockets (bottom)
 */
export function calculateMountingCornerPositions(plateWidth: number, plateHeight: number, config: any): Point2D[] {
  const { cornerInset } = config;
  
  return [
    { x: -cornerInset, y: -cornerInset },                                    // Bottom-left corner
    { x: plateWidth + cornerInset, y: -cornerInset },                        // Bottom-right corner  
    { x: -cornerInset, y: plateHeight + cornerInset },                       // Top-left corner
    { x: plateWidth + cornerInset, y: plateHeight + cornerInset }            // Top-right corner
  ];
}

/**
 * Creates heat insert mounts for the top plate corners
 * These are the mounting tabs that extend from the top plate with heat insert holes
 */
export function createCornerHeatInsertMounts(plateWidth: number, plateHeight: number, config: any) {
  const cornerPositions = calculateMountingCornerPositions(plateWidth, plateHeight, config);
  const { mountRadius, insertHeight, insertRadius, mountCutoutWidth, mountCutoutOffset, insertMountCenterZ, extrusionTolerance } = config;
  
  const cornerMountData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.cornerRotations[index]
  }));
  
  return cornerMountData.map(({ x, y, rotation }) => {
    const mountGeometry = difference(
      cylinder(insertHeight, mountRadius),
      cylinder(insertHeight + extrusionTolerance, insertRadius)
        .translate([config.mountOffset, config.mountOffset, 0]),
      cube([mountCutoutWidth, mountRadius, insertHeight + extrusionTolerance])
        .translate([0, -mountCutoutOffset, 0]),
      cube([mountRadius, mountCutoutWidth, insertHeight + extrusionTolerance])
        .translate([-mountCutoutOffset, 0, 0]),
    );
    
    return mountGeometry
      .rotate([0, 0, rotation])
      .translate([x, y, insertMountCenterZ]);
  });
}

export function createCornerScrewMounts(plateWidth: number, plateHeight: number, config: any) {
  const cornerPositions = calculateMountingCornerPositions(plateWidth, plateHeight, config);
  const { mountRadius, screwRadius, bottomWallHeight, bottomWallCenterZ, mountCutoutWidth, mountCutoutOffset, extrusionTolerance } = config;
  
  const cornerMountData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.cornerRotations[index]
  }));
  
  return cornerMountData.map(({ x, y, rotation }) => {
    const mountGeometry = difference(
      cylinder(bottomWallHeight, mountRadius),
      cylinder(bottomWallHeight + extrusionTolerance, screwRadius)
        .translate([config.mountOffset, config.mountOffset, 0]),
      cube([mountCutoutWidth, mountRadius, bottomWallHeight + extrusionTolerance])
        .translate([0, -mountCutoutOffset, 0]),
      cube([mountRadius, mountCutoutWidth, bottomWallHeight + extrusionTolerance])
        .translate([-mountCutoutOffset, 0, 0]),
    );
    
    return mountGeometry
      .rotate([0, 0, rotation])
      .translate([x, y, bottomWallCenterZ]);
  });
}

export function createCornerScrewSockets(plateWidth: number, plateHeight: number, config: any) {
  const cornerPositions = calculateMountingCornerPositions(plateWidth, plateHeight, config);
  const { screwRadius, screwHeadRadius, screwHeadHeight, bottomWallHeight, bottomWallCenterZ, extrusionTolerance } = config;
  
  const cornerSocketData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.cornerRotations[index]
  }));
  
  return cornerSocketData.map(({ x, y, rotation }) => {
    return union(
      cylinder(bottomWallHeight + extrusionTolerance, screwRadius),
      cylinder(screwHeadHeight + extrusionTolerance, screwHeadRadius)
        .translate([0, 0, -(bottomWallHeight - screwHeadHeight) / 2]),
    )
      .translate([config.mountOffset, config.mountOffset, 0])
      .rotate([0, 0, rotation])
      .translate([x, y, bottomWallCenterZ]);
  });
}
