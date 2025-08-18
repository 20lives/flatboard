import { cube, cylinder, difference, union } from "scad-js";
import { type Point2D } from './config.js';

/**
 * Calculates the exact corner positions for mounting hardware
 * These positions are shared between heat inserts (top) and screw sockets (bottom)
 */
export function calculateMountingCornerPositions(plateWidth: number, plateHeight: number, config: any): Point2D[] {
  const cornerInset = config.computed.cornerInset;
  
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
  const mountRadius = config.mounting.corner.radius;
  const insertHeight = config.mounting.insert.height;
  const insertRadius = config.mounting.insert.radius;
  const mountCutoutWidth = config.mounting.corner.cutoutWidth;
  const mountCutoutOffset = config.mounting.corner.cutoutOffset;
  const insertMountCenterZ = config.mounting.insert.centerZ;
  const extrusionTolerance = config.tolerances.extrusion;
  
  const cornerMountData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.mounting.corner.rotations[index]
  }));
  
  return cornerMountData.map(({ x, y, rotation }) => {
    const mountGeometry = difference(
      cylinder(insertHeight, mountRadius),
      cylinder(insertHeight + extrusionTolerance, insertRadius)
        .translate([config.mounting.corner.offset, config.mounting.corner.offset, 0]),
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
  const mountRadius = config.mounting.corner.radius;
  const screwRadius = config.mounting.screw.radius;
  const bottomWallHeight = config.enclosure.walls.bottom.height;
  const bottomWallCenterZ = config.computed.bottomWallCenterZ;
  const mountCutoutWidth = config.mounting.corner.cutoutWidth;
  const mountCutoutOffset = config.mounting.corner.cutoutOffset;
  const extrusionTolerance = config.tolerances.extrusion;
  
  const cornerMountData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.mounting.corner.rotations[index]
  }));
  
  return cornerMountData.map(({ x, y, rotation }) => {
    const mountGeometry = difference(
      cylinder(bottomWallHeight, mountRadius),
      cylinder(bottomWallHeight + extrusionTolerance, screwRadius)
        .translate([config.mounting.corner.offset, config.mounting.corner.offset, 0]),
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
  const screwRadius = config.mounting.screw.radius;
  const screwHeadRadius = config.mounting.screw.head.radius;
  const screwHeadHeight = config.mounting.screw.head.height;
  const bottomWallHeight = config.enclosure.walls.bottom.height;
  const bottomWallCenterZ = config.computed.bottomWallCenterZ;
  const extrusionTolerance = config.tolerances.extrusion;
  
  const cornerSocketData = cornerPositions.map((position, index) => ({
    ...position,
    rotation: config.mounting.corner.rotations[index]
  }));
  
  return cornerSocketData.map(({ x, y, rotation }) => {
    return union(
      cylinder(bottomWallHeight + extrusionTolerance, screwRadius),
      cylinder(screwHeadHeight + extrusionTolerance, screwHeadRadius)
        .translate([0, 0, -(bottomWallHeight - screwHeadHeight) / 2]),
    )
      .translate([config.mounting.corner.offset, config.mounting.corner.offset, 0])
      .rotate([0, 0, rotation])
      .translate([x, y, bottomWallCenterZ]);
  });
}
