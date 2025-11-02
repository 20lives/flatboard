import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { circle, difference, type ScadObject } from 'scad-js';
import type { KeyboardConfig } from './interfaces.js';

// MagSafe ring dimensions (based on standard MagSafe charger)
const MAGSAFE_RING = {
  OUTER_DIAMETER: 55,
  INNER_DIAMETER: 50,
  DEPTH: 0.5,
};

export function createMagSafeRingStructure(
  plateWidth: number,
  plateHeight: number,
  wallThickness: number,
  config: KeyboardConfig,
): ScadObject | null {
  return pipe(
    config.enclosure.magsafeRing,
    O.fromNullable,
    O.map((ringConfig) => {
      const externalWidth = plateWidth + 2 * wallThickness;
      const externalHeight = plateHeight + 2 * wallThickness;

      const centerX = externalWidth / 2 + ringConfig.position.offset.x;
      const centerY = externalHeight / 2 + ringConfig.position.offset.y;

      const outerRingRadius = MAGSAFE_RING.OUTER_DIAMETER / 2 + ringConfig.reinforcement.outer + ringConfig.clearance;
      const innerCutoutRadius = MAGSAFE_RING.INNER_DIAMETER / 2 - ringConfig.reinforcement.inner - ringConfig.clearance;
      const ringDepth = MAGSAFE_RING.DEPTH + ringConfig.reinforcement.height;

      const outerRing = circle(outerRingRadius);
      const innerCutout = circle(innerCutoutRadius);

      return difference(outerRing, innerCutout).linear_extrude(ringDepth).translate([centerX, centerY, 0]);
    }),
    O.toNullable,
  );
}

export function createMagSafeRingCutout(
  plateWidth: number,
  plateHeight: number,
  wallThickness: number,
  config: KeyboardConfig,
): ScadObject | null {
  return pipe(
    config.enclosure.magsafeRing,
    O.fromNullable,
    O.map((ringConfig) => {
      const externalWidth = plateWidth + 2 * wallThickness;
      const externalHeight = plateHeight + 2 * wallThickness;

      const centerX = externalWidth / 2 + ringConfig.position.offset.x;
      const centerY = externalHeight / 2 + ringConfig.position.offset.y;

      const outerCutoutRadius = MAGSAFE_RING.OUTER_DIAMETER / 2 + ringConfig.clearance;
      const innerCutoutRadius = MAGSAFE_RING.INNER_DIAMETER / 2 - ringConfig.clearance;

      const outerCircle = circle(outerCutoutRadius);
      const innerCircle = circle(innerCutoutRadius);

      const ringCutout2D = difference(outerCircle, innerCircle);

      // Extrude with slight extra depth for clean cutout
      return ringCutout2D.linear_extrude(MAGSAFE_RING.DEPTH + 0.1).translate([centerX, centerY, -0.1]);
    }),
    O.toNullable,
  );
}

export function createMagSafeRingExclusionZone(
  plateWidth: number,
  plateHeight: number,
  wallThickness: number,
  config: KeyboardConfig,
): ScadObject | null {
  return pipe(
    config.enclosure.magsafeRing,
    O.fromNullable,
    O.map((ringConfig) => {
      const externalWidth = plateWidth + 2 * wallThickness;
      const externalHeight = plateHeight + 2 * wallThickness;

      const centerX = externalWidth / 2 + ringConfig.position.offset.x;
      const centerY = externalHeight / 2 + ringConfig.position.offset.y;

      const outerRadius = MAGSAFE_RING.OUTER_DIAMETER / 2 + ringConfig.reinforcement.outer + ringConfig.clearance;
      const innerRadius = MAGSAFE_RING.INNER_DIAMETER / 2 - ringConfig.reinforcement.inner - ringConfig.clearance;

      const outerCircle = circle(outerRadius);
      const innerCircle = circle(innerRadius);

      return difference(outerCircle, innerCircle).translate([centerX, centerY, 0]);
    }),
    O.toNullable,
  );
}
