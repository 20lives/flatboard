/**
 * Switch type specifications and configurations
 */

import type { SwitchSpec } from './interfaces.js';

// Switch type specifications
export const SWITCH_SPECS = {
  choc: {
    description: 'Kailh Choc Low Profile',
    switch: {
      cutout: {
        size: 13.8, // Kailh Choc switch cutout
        thinZone: 15.0, // Clearance zone around switch
      },
      plate: {
        thickness: 1.6, // Recommended plate thickness for Choc
        totalThickness: 8.0, // Low profile total thickness
      },
    },
    layout: {
      matrix: {
        pitch: 18.0, // Choc spacing
      },
    },
  },
  mx: {
    description: 'Cherry MX Compatible',
    switch: {
      cutout: {
        size: 13.9, // Cherry MX switch cutout
        thinZone: 15.9, // Slightly larger clearance for MX
      },
      plate: {
        thickness: 4.1, // Standard MX plate thickness
        totalThickness: 7.1, // Higher profile for MX switches
      },
    },
    layout: {
      matrix: {
        pitch: 18.6, // Standard MX spacing (0.75")
      },
    },
  },
} as const satisfies Record<string, SwitchSpec>;

export type SwitchType = keyof typeof SWITCH_SPECS;
