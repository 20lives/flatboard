import { cube, cylinder, hull, union } from "scad-js";
import { type Point2D, CONNECTOR_SPECS } from './config.js';

/**
 * Generic connector geometry and positioning utilities
 */

export type ConnectorFace = 'top' | 'bottom' | 'left' | 'right';

export interface ConnectorConfig {
  type: keyof typeof CONNECTOR_SPECS;
  enabled: boolean;
  face: ConnectorFace;
  position: number;
  clearance: number;
}

/**
 * Calculates the 3D position for a connector on a specified face
 */
export function calculateConnectorPosition(
  plateWidth: number, 
  plateHeight: number, 
  face: ConnectorFace, 
  position: number,
  config: any
): { x: number; y: number; z: number; rotation: [number, number, number] } {
  const wallThickness = config.enclosure.walls.thickness;
  const topWallHeight = config.enclosure.walls.top.height;
  const topPlateThickness = config.enclosure.plate.thickness;
  
  // Calculate connector Z position using the specified formula
  // Center vertically at: plate_thickness + (total_wall_height - plate_thickness) / 2 from the top
  const connectorZ = -(topPlateThickness + (topWallHeight - topPlateThickness) / 2);
  
  // Clamp position to valid range
  const normalizedPosition = Math.max(0, Math.min(1, position));
  
  // Calculate wall dimensions (walls extend wallThickness on all sides)
  const totalWallWidth = plateWidth + 2 * wallThickness;
  const totalWallHeight = plateHeight + 2 * wallThickness;
  
  switch (face) {
    case 'top':
      return {
        x: -wallThickness + totalWallWidth * normalizedPosition,  // Position along top wall length
        y: plateHeight + wallThickness,  // Position at outer face of top wall
        z: connectorZ,  // Position below plate with clearance
        rotation: [0, 0, 0]
      };
      
    case 'bottom':
      return {
        x: -wallThickness + totalWallWidth * normalizedPosition,  // Position along bottom wall length
        y: -wallThickness,  // Position at outer face of bottom wall
        z: connectorZ,  // Position below plate with clearance
        rotation: [0, 0, 180]
      };
      
    case 'left':
      return {
        x: 0,  // Position at center of left wall (cutout extends both ways after rotation)
        y: -wallThickness + totalWallHeight * normalizedPosition,  // Position along left wall length
        z: connectorZ,  // Position below plate with clearance
        rotation: [0, 0, -90]
      };
      
    case 'right':
      return {
        x: plateWidth,  // Position at center of right wall (cutout extends both ways after rotation)
        y: -wallThickness + totalWallHeight * normalizedPosition,  // Position along right wall length
        z: connectorZ,  // Position below plate with clearance
        rotation: [0, 0, 90]
      };
  }
}

/**
 * Creates a connector socket cutout geometry based on connector type
 */
export function createConnectorCutout(connectorConfig: ConnectorConfig, globalConfig: any) {
  const spec = CONNECTOR_SPECS[connectorConfig.type];
  const wallThickness = globalConfig.enclosure.walls.thickness;
  const extrusionTolerance = globalConfig.tolerances.extrusion;
  
  // Use full wall thickness + tolerance for complete penetration
  const cutoutDepth = wallThickness + extrusionTolerance * 2 + 0.2;
  
  if (spec.geometry.type === 'pill') {
    // USB-C style: Two circles with hull
    const circleRadius = spec.geometry.circleRadius + connectorConfig.clearance;
    const centerDistance = spec.geometry.centerDistance;
    const halfDistance = centerDistance / 2;
    
    const leftCircle = cylinder(cutoutDepth, circleRadius)
      .rotate([90, 0, 0])
      .translate([-halfDistance, 0, 0]);
      
    const rightCircle = cylinder(cutoutDepth, circleRadius)
      .rotate([90, 0, 0])
      .translate([halfDistance, 0, 0]);
    
    return hull(leftCircle, rightCircle)
      .translate([0, -cutoutDepth / 2 + 0.1, 0]);
  }
  
  if (spec.geometry.type === 'circle') {
    // TRRS style: Single circle
    const radius = spec.geometry.radius + connectorConfig.clearance;
    
    return cylinder(cutoutDepth, radius)
      .rotate([90, 0, 0])
      .translate([0, -cutoutDepth / 2 + 0.1, 0]);
  }
  
  throw new Error(`Unknown connector geometry type: ${(spec.geometry as any).type}`);
}

/**
 * Creates a positioned connector cutout for the specified plate dimensions and configuration
 */
export function createConnector(connectorConfig: ConnectorConfig, plateWidth: number, plateHeight: number, globalConfig: any) {
  if (!connectorConfig.enabled) {
    return null;
  }
  
  const position = calculateConnectorPosition(
    plateWidth,
    plateHeight,
    connectorConfig.face,
    connectorConfig.position,
    globalConfig
  );
  
  const socketCutout = createConnectorCutout(connectorConfig, globalConfig);
  
  return socketCutout
    .rotate(position.rotation)
    .translate([position.x, position.y, position.z]);
}

/**
 * Creates all enabled connector cutouts for the keyboard
 */
export function createAllConnectors(plateWidth: number, plateHeight: number, config: any) {
  const connectors = config.connectors || [];
  
  return connectors
    .filter((connector: ConnectorConfig) => connector.enabled)
    .map((connector: ConnectorConfig) => createConnector(connector, plateWidth, plateHeight, config))
    .filter((cutout: any) => cutout !== null);
}
