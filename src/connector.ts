import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { cube, cylinder, hull } from 'scad-js';
import { CONNECTOR_SPECS } from './config.js';
import type { ConnectorConfig, ConnectorSpec, KeyboardConfig } from './interfaces.js';

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

  const spec = CONNECTOR_SPECS[connectorConfig.type as keyof typeof CONNECTOR_SPECS];
  const geometry = spec.geometry as ConnectorSpec['geometry'];
  const centerDistance = geometry.centerDistance ?? 0;
  const circleRadius = (geometry.circleRadius ?? geometry.radius ?? geometry.width ?? 0) + connectorConfig.clearance;

  const z = (wallsHeight + topThickness - bottomThickness) / 2;

  const positionCalculators = {
    top: () => ({
      x: wallThickness,
      y:
        centerDistance +
        circleRadius / 2 -
        offset +
        (plateHeight - centerDistance - 2 * circleRadius - 2 * wallThickness + 2 * offset) * normalizedPosition,
      z,
      rotation: [0, 0, -90] as [number, number, number],
    }),
    right: () => ({
      x:
        centerDistance +
        wallThickness * 2 -
        offset +
        (plateWidth - centerDistance - 2 * circleRadius - wallThickness + offset + offset) * normalizedPosition,
      y: wallThickness,
      z,
      rotation: [0, 0, 0] as [number, number, number],
    }),
    bottom: () => ({
      x: plateWidth + wallThickness,
      y:
        centerDistance +
        wallThickness * 2 -
        offset +
        (plateHeight - centerDistance - 2 * circleRadius - wallThickness + 2 * offset) * normalizedPosition,
      z,
      rotation: [0, 0, 90] as [number, number, number],
    }),
    left: () => ({
      x:
        centerDistance +
        wallThickness * 2 -
        offset +
        (plateWidth - centerDistance - 2 * circleRadius - wallThickness + 2 * offset) * normalizedPosition -
        circleRadius / 2 -
        wallThickness,
      y: plateHeight + wallThickness,
      z,
      rotation: [0, 0, 180] as [number, number, number],
    }),
  };

  return positionCalculators[face]();
}

export function createConnectorCutout(connectorConfig: ConnectorConfig, globalConfig: KeyboardConfig) {
  const spec = CONNECTOR_SPECS[connectorConfig.type as keyof typeof CONNECTOR_SPECS];
  const geometry = spec.geometry as ConnectorSpec['geometry'];
  const { thickness } = globalConfig.enclosure.walls;

  const geometryCreators = {
    pill: () => {
      const circleRadius = (geometry.circleRadius ?? 0) + connectorConfig.clearance;
      const centerDistance = geometry.centerDistance ?? 0;
      const circle = cylinder(thickness + 0.1, circleRadius).rotate_x(90);

      return hull(circle.translate_x(centerDistance), circle).translate([
        circleRadius - centerDistance,
        -thickness / 2,
        0,
      ]);
    },
    circle: () => {
      const radius = (geometry.radius ?? 0) + connectorConfig.clearance;
      return cylinder(thickness + 0.1, radius)
        .rotate_x(90)
        .translate_y(-thickness / 2);
    },
    square: () => {
      const width = (geometry.width ?? 0) + connectorConfig.clearance * 2;
      const height = (geometry.height ?? 0) + connectorConfig.clearance * 2;
      return cube([width, thickness + 0.1, height]).translate([thickness * 2, -thickness / 2, 0]);
    },
  };

  const creator = geometryCreators[spec.geometry.type as keyof typeof geometryCreators];

  if (!creator) {
    throw new Error(`Unknown connector geometry type: ${spec.geometry.type}`);
  }

  return creator();
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

  const position = calculateConnectorPosition(plateWidth, plateHeight, offset, connectorConfig, globalConfig);

  return createConnectorCutout(connectorConfig, globalConfig)
    .rotate(position.rotation)
    .translate([position.x, position.y, position.z]);
}

export function createAllConnectors(plateWidth: number, plateHeight: number, offset: number, config: KeyboardConfig) {
  return pipe(
    config.connectors ?? [],
    A.map((connector) => createConnector(connector, plateWidth, plateHeight, offset, config)),
  );
}
