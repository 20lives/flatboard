import type { ParameterProfile } from '../src/interfaces.js';

// Sweep-style 17-key split keyboard from KiCad PCB
// Layout has 5 columns with column stagger and 2 rotated thumb keys
export const profile: ParameterProfile = {
  output: {
    showSwitches: false,
    showKeycaps: true,
    keycapProfile: 'choc',
  },
  layout: {
    mode: 'split',
    matrix: {
      rowLayout: [
        { start: 0, length: 3, offset: 0, thumbAnchor: 1 },
        { start: 0, length: 3, offset: -3 },
        { start: 0, length: 3, offset: -8 },
        { start: 0, length: 3, offset: -1},
        { start: 0, length: 3, offset: 11 },
      ],
    },
    edgeMargin: 4.0,
    baseDegrees: 0.0,
  },
  switch: {
    type: 'choc',
  },
  thumb: {
    cluster: {
      keys: 2,
      rotation:15, 
    },
    offset: {
      x: 40,
      y: 0,
    },
    perKey: {
      rotations: [0, 12],
      offsets: [
        { x: 0, y: 0 },
        { x: 2, y: -2.5 },
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
    bottomPattern: {
      type: 'honeycomb',
      cellSize: 8,
      wallThickness: 3.5,
      margin: 6,
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
    magsafeRing: {
      clearance: 0.2,
      reinforcement: {
        outer: 2.0,
        inner: 2.0,
        height: 0.5,
      },
      position: {
        offset: { x: 0, y: 0 },
        placement: 'embedded' as const,
      },
    },
  },
  connectors: [
    {
      type: 'usbC',
      enabled: true,
      face: 'left',
      position: 0.5,
      clearance: 0.2,
    },
  ],
};
