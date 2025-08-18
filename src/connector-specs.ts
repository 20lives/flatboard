/**
 * Connector type specifications and configurations
 */

import type { ConnectorSpec } from './interfaces.js';

// Connector type specifications
export const CONNECTOR_SPECS = {
  usbC: {
    description: 'USB-C Female Socket',
    geometry: {
      type: 'pill' as const, // Two circles with hull
      circleRadius: 1.55, // Radius of each circle
      centerDistance: 5.8, // Distance between circle centers
      depth: 7.0, // Default cutout depth
    },
  },
  trrs: {
    description: 'TRRS 3.5mm Audio Jack',
    geometry: {
      type: 'circle' as const, // Single circle
      radius: 2.45, // 2.45mm radius for TRRS jack
      depth: 8.0, // Default cutout depth
    },
  },
} as const satisfies Record<string, ConnectorSpec>;

export type ConnectorType = keyof typeof CONNECTOR_SPECS;
