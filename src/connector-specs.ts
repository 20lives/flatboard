import type { ConnectorSpec } from './interfaces.js';

export const CONNECTOR_SPECS = {
  usbC: {
    description: 'USB-C Female Socket', // https://s.click.aliexpress.com/e/_c4PfIdE7
    geometry: {
      type: 'pill' as const,
      circleRadius: 1.55,
      centerDistance: 5.8,
    },
  },
  trrs: {
    description: 'TRRS 3.5mm Audio Jack',
    geometry: {
      type: 'circle' as const,
      radius: 2.45,
    },
  },
  powerButton: {
    description: 'Generic circle power button', // https://s.click.aliexpress.com/e/_c2I9J4Wr
    geometry: {
      type: 'circle' as const,
      radius: 3.4,
    },
  },
} as const satisfies Record<string, ConnectorSpec>;

export type ConnectorType = keyof typeof CONNECTOR_SPECS;
