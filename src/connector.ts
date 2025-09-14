import { cylinder, hull } from 'scad-js';
import { CONNECTOR_SPECS } from './config.js';
import type { ConnectorConfig, KeyboardConfig } from './interfaces.js';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

export type ConnectorFace = 'top' | 'bottom' | 'left' | 'right';

export function calculateConnectorPosition(
  plateWidth: number,
  plateHeight: number,
  offset: number,
  connectorConfig: ConnectorConfig,
  config: KeyboardConfig,
): { x: number; y: number; z: number; rotation: [number, number, number] } {

  const { face, position } = connectorConfig;

  const { thickness: wallThickness, height: wallsHeight } = config.enclosure.walls;

  const { topThickness, bottomThickness } = config.enclosure.plate;

  const normalizedPosition = Math.max(0, Math.min(1, position));

  const isTopBottom = ['top', 'bottom'].includes(face);

  const totalWallLength = 2 * wallThickness + (isTopBottom ? plateWidth : plateHeight);

  const rotation: [number, number, number] = [
    0, 
    0, 
    { top: 0, bottom: 180, left: -90, right: 90 }[face] ?? 0,
  ];

  const spec = CONNECTOR_SPECS[connectorConfig.type as keyof typeof CONNECTOR_SPECS];
  const centerDistance = spec.geometry.centerDistance ?? 0;
  const circleRadius = spec.geometry.circleRadius + connectorConfig.clearance;

  if (face == 'top') {
    return {
      x: centerDistance + wallThickness * 2 - offset + (plateWidth - centerDistance - 2 * circleRadius - wallThickness + offset + offset) * normalizedPosition,
      y: wallThickness,
      z: (wallsHeight + topThickness - bottomThickness) / 2,
      rotation,
    }
  }
  if (face == 'right') {
    return {
      x: plateWidth + wallThickness,
      y: centerDistance + wallThickness * 2 - offset + (plateHeight - centerDistance - 2 * circleRadius - wallThickness + 2 * offset) * normalizedPosition,
      z: (wallsHeight + topThickness - bottomThickness) / 2,
      rotation,
    }

  }
  if (face == 'bottom') {
    return {
      x: centerDistance + wallThickness * 2 - offset + (plateWidth - centerDistance - 2 * circleRadius - wallThickness + 2 * offset) * normalizedPosition - circleRadius / 2 - wallThickness,
      y: plateHeight + wallThickness,
      z: (wallsHeight + topThickness - bottomThickness) / 2,
      rotation,
    }

  }
  if (face == 'left') {
    return {
      x: wallThickness,
      y: centerDistance + circleRadius / 2 - offset + (plateHeight - centerDistance - 2 * circleRadius - 2 * wallThickness + 2 * offset) * normalizedPosition,
      z: (wallsHeight + topThickness - bottomThickness) / 2,
      rotation,
    }

  }
}

export function createConnectorCutout(connectorConfig: ConnectorConfig, globalConfig: KeyboardConfig) {
  const spec = CONNECTOR_SPECS[connectorConfig.type as keyof typeof CONNECTOR_SPECS];
  const { thickness } = globalConfig.enclosure.walls;

  if (spec.geometry.type === 'pill') {
    const circleRadius = spec.geometry.circleRadius + connectorConfig.clearance;
    const centerDistance = spec.geometry.centerDistance;

    const circle = cylinder(thickness + 0.1, circleRadius).rotate([90, 0, 0]);

    return hull(
      circle.translate([centerDistance , 0, 0]),
      circle,
    ).translate([circleRadius - centerDistance, -thickness / 2 , 0]);
  }

  if (spec.geometry.type === 'circle') {
    const radius = spec.geometry.radius + connectorConfig.clearance;

    return cylinder(thickness + 0.0, radius).rotate([90, 0, 0]).translate([0, -thickness / 2 + 0.00, 0]);
  }

  throw new Error(`Unknown connector geometry type: ${(spec.geometry as any).type}`);
}

function createConnector(
  connectorConfig: ConnectorConfig,
  plateWidth: number,
  plateHeight: number,
  offset: number,
  globalConfig: KeyboardConfig,
) {
  if (!connectorConfig.enabled) {
    return null;
  }

  const position = calculateConnectorPosition( plateWidth, plateHeight, offset, connectorConfig, globalConfig);

  return createConnectorCutout(connectorConfig, globalConfig)
    .rotate(position.rotation).translate([position.x, position.y, position.z]);
}

export function createAllConnectors(plateWidth: number, plateHeight: number, offset: number, config: KeyboardConfig) {
  return pipe(
    config.connectors ?? [],
    A.map((connector) => createConnector(connector, plateWidth, plateHeight, offset, config)),
  );
}
