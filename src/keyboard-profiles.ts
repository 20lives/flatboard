/**
 * Predefined keyboard profiles and profile management
 */

import type { ParameterProfile } from './interfaces.js';

// Predefined keyboard profiles
export const KEYBOARD_PROFILES = {
  'ortho-36': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 5 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 },
        ],
      },
      spacing: {
        centerGap: 25.0,
      },
      rotation: {
        baseDegrees: -77.0,
      },
    },
    thumb: {
      cluster: {
        keys: 3,
      },
      offset: {
        x: 47.0,
        y: 5.0,
      },
    },
  },
  'ortho-36-right': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 5 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 },
        ],
      },
      spacing: {
        centerGap: 25.0,
      },
      rotation: {
        baseDegrees: -77.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 3,
      },
      offset: {
        x: 47.0,
        y: 5.0,
      },
    },
  },
  'ortho-4x10': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
        ],
      },
      spacing: {
        centerGap: 25.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 0,
      },
      offset: {
        x: 47.0,
        y: 5.0,
      },
    },
  },
  'ortho-36-mx': {
    switch: {
      type: 'mx',
    },
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 5 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 },
        ],
      },
      spacing: {
        centerGap: 23.0,
        edgeMargin: 4.0,
      },
      rotation: {
        baseDegrees: -77.0,
      },
    },
    thumb: {
      cluster: {
        keys: 3,
      },
      offset: {
        x: 50.0,
        y: 6.0,
      },
    },
    enclosure: {
      plate: {
        thickness: 1.6,
      },
      walls: {
        top: {
          height: 12,
        },
      },
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'left',
        position: 0.25,
        clearance: 0.2,
      },
    ],
  },
  'test-single-choc': {
    layout: {
      matrix: {
        rowLayout: [{ start: 0, length: 1, offset: 0 }],
      },
      spacing: {
        edgeMargin: 10.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 0,
      },
    },
  },
  'test-single-mx': {
    layout: {
      matrix: {
        rowLayout: [{ start: 0, length: 1, offset: 0 }],
      },
      spacing: {
        edgeMargin: 15.0,
      },
      build: {
        side: 'left',
      },
    },
    switch: {
      type: 'mx',
    },
    thumb: {
      cluster: {
        keys: 0,
      },
    },
    enclosure: {
      walls: {
        top: {
          height: 12,
        },
      },
    },
  },
  'test-multi-connectors': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
        ],
      },
      spacing: {
        edgeMargin: 15.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 0,
      },
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'bottom',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'left',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'right',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'trrs',
        enabled: true,
        face: 'left',
        position: 0.7,
        clearance: 0.1,
      },
    ],
  },
  'test-custom-rows': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 4, offset: 2 },
          { start: 0, length: 5, offset: 0 },
          { start: 0, length: 5, offset: 1 },
        ],
      },
      spacing: {
        edgeMargin: 12.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 2,
      },
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top',
        position: 0.3,
        clearance: 0.2,
      },
    ],
  },
  'test-advanced-layout': {
    layout: {
      matrix: {
        rowLayout: [
          { start: -1, length: 3, offset: 2 }, // Row 0: keys at grid positions -1,0,1 with offset 2
          { start: 1, length: 4, offset: 0 }, // Row 1: keys at grid positions 1,2,3,4 with offset 0
          { start: 0, length: 3, offset: 1 }, // Row 2: keys at grid positions 0,1,2 with offset 1
        ],
      },
      spacing: {
        edgeMargin: 10.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 2,
      },
    },
    connectors: [
      {
        type: 'trrs',
        enabled: true,
        face: 'left',
        position: 0.5,
        clearance: 0.1,
      },
    ],
  },
} as const satisfies Record<string, ParameterProfile>;

// Default profile - configured here as single source of truth
export const DEFAULT_PROFILE = 'ortho-36' as keyof typeof KEYBOARD_PROFILES;

export type ProfileName = keyof typeof KEYBOARD_PROFILES;
