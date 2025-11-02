import type { SwitchSpec } from './interfaces.js';

export const SWITCH_SPECS = {
  choc: {
    description: 'Kailh Choc Low Profile',
    switch: {
      cutout: {
        height: 1.5,
        startHeight: 2.6,
        inner: 13.8,
        outer: 15.0,
      },
      plate: {
        thickness: 1.6,
        totalThickness: 8.0,
      },
    },
    layout: {
      matrix: {
        spacing: 18.0,
      },
    },
  },
  mx: {
    description: 'Cherry MX Compatible',
    switch: {
      cutout: {
        height: 1.5,
        startHeight: 2.6,
        inner: 13.8,
        outer: 15.0,
      },
      plate: {
        thickness: 1.6,
        totalThickness: 8.0,
      },
    },
    layout: {
      matrix: {
        spacing: 18.6,
      },
    },
  },
} as const satisfies Record<string, SwitchSpec>;

export type SwitchType = keyof typeof SWITCH_SPECS;
