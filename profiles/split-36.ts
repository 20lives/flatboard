import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  output: {
    showSwitches: true,
    showKeycaps: true,
    keycapProfile: 'dsa',
  },
  layout: {
    mode: 'split',
    matrix: {
      rowLayout: [
        { start: 0, length: 3, offset: 5, thumbAnchor: 2 },
        { start: 0, length: 3, offset: 1 },
        { start: 0, length: 3, offset: 0 },
        { start: 0, length: 3, offset: 3 },
        { start: 0, length: 3, offset: 4 },
      ],
    },
    edgeMargin: {
      top: 4,
      bottom: 6,
      left: 4,
      right: 6,
    },
    baseDegrees: 0.0,
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
    cornerRadius: 2,
    plate: {
      topThickness: 1.5,
      bottomThickness: 1.5,
    },
    walls: {
      thickness: 1.5,
      height: 8.0,
    },
    bottomPadsSockets: [
      /*
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
      */
    ],
    bottomPattern: {
      type: 'honeycomb',
      cellSize: 14,
      wallThickness: 4,
      margin: 5,
    },
    magsafeRing: {
      clearance: 0.2,
      reinforcement: {
        outer: 3.0,
        inner: 3.0,
        height: 0.8,
      },
      position: {
        offset: { x: 0, y: 0 },
        placement: 'external' as const,
      },
    },
  },
  connectors: [
    {
      type: 'powerButton',
      enabled: true,
      face: 'right',
      position: 0.20,
      clearance: 0.2,
    },
    {
      type: 'usbC',
      enabled: true,
      face: 'bottom',
      position: 0.60,
      clearance: 0.2,
    },
  ],
};
