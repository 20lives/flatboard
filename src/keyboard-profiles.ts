import type { ParameterProfile } from './interfaces.js';
export const KEYBOARD_PROFILES = {
  'split-36': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 5, thumbAnchor: 2 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 },
        ],
      },
      edgeMargin: 8.0,
      baseDegrees: 13.0,
    },
    switch: {
      type: 'choc',
    },
    thumb: {
      cluster: {
        keys: 3,
        spacing: 20.0,
        rotation: 17.0,
      },
      offset: {
        x: 25,
        y: 2,
      },
      perKey: {
        rotations: [-10, 0, +10],
        offsets: [
          { x: 2, y: 0 },
          { x: 0, y: 0 },
          { x: 2, y: 0 },
        ],
      },
    },
    enclosure: {
      plate: {
        topThickness: 1.5,
        bottomThickness: 1.5,
      },
      walls: {
        thickness: 1.5,
        height: 9.0,
      },
      bottomPadsSockets: [
        {
          shape: 'round',
          size: { radius: 5.05 },
          depth: 1.1,
          position: { anchor: 'bottom-left', offset: { x: 0, y: 0 } },
          reinforcement: { thickness: 1, height: 0.2 },
        },
        {
          shape: 'round',
          size: { radius: 5.05 },
          depth: 1.1,
          position: { anchor: 'top-left', offset: { x: 0, y: 0 } },
          reinforcement: { thickness: 1, height: 0.2 },
        },
        {
          shape: 'round',
          size: { radius: 5.05 },
          depth: 1.1,
          position: { anchor: 'bottom-right', offset: { x: 0, y: 0 } },
          reinforcement: { thickness: 1, height: 0.2 },
        },
        {
          shape: 'round',
          size: { radius: 5.05 },
          depth: 1.1,
          position: { anchor: 'top-right', offset: { x: 0, y: 0 } },
          reinforcement: { thickness: 1, height: 0.2 },
        },
      ],
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'left',
        position: 0.95,
        clearance: 0.2,
      },
      {
        type: 'powerButton',
        enabled: true,
        face: 'top',
        position: 0.1,
        clearance: 0.2,
      },
    ],
  },
  'macropad-3x3': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
        ],
      },
      edgeMargin: 12.0,
      baseDegrees: 0,
    },
    switch: {
      type: 'choc',
    },
    enclosure: {
      plate: {
        topThickness: 1.5,
        bottomThickness: 1.5,
      },
      walls: {
        thickness: 1.5,
        height: 8.0,
      },
      bottomPadsSockets: [
        {
          shape: 'square',
          size: { radius: 5.05 },
          depth: 1.1,
          position: { anchor: 'bottom-right', offset: { x: -1, y: 1 } },
          reinforcement: { thickness: 1, height: 0.2 },
        },
      ],
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top',
        position: 0.5,
        clearance: 0.2,
      },
    ],
  },
  'test-single-choc': {
    layout: {
      matrix: {
        rowLayout: [{ start: 0, length: 1, offset: 0 }],
      },
      edgeMargin: 10.0,
      baseDegrees: 0,
    },
    switch: {
      type: 'choc',
    },
    enclosure: {
      plate: {
        topThickness: 1.0,
        bottomThickness: 1.0,
      },
      walls: {
        thickness: 1.0,
        height: 5.0,
      },
    },
  },
} as const satisfies Record<string, ParameterProfile>;

export const DEFAULT_PROFILE = 'split-36' as keyof typeof KEYBOARD_PROFILES;

export type ProfileName = keyof typeof KEYBOARD_PROFILES;
