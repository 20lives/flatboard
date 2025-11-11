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
        { start: 0, length: 2, offset: 5.5, thumbAnchor: 1 },
        { start: 0, length: 3, offset: -2.382 },
        { start: 0, length: 3, offset: -4.763 },
        { start: 0, length: 3, offset: -7.144 },
        { start: 0, length: 3, offset: -4.763 },
        { start: 0, length: 3, offset: 0 },
        { start: 0, length: 3, offset: 0 },
      ],
    },
    edgeMargin: 3.0,
    baseDegrees: 0,
  },
  switch: {
    type: 'mx',
  },
  thumb: {
    cluster: {
      keys: 3,
    },
    offset: {
      x: 26,
      y: 27,
    },
    perKey: {
      rotations: [0, 11.94, 11.94 + 11.94],
      offsets: [
        { x: 0, y: 0 },
        { x: 2, y: -1.5 },
        { x: 4, y: -6 },
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
      type: 'circles',
      cellSize: 5,
      wallThickness: 1.5,
      margin: 3,
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
      face: 'top',
      position: 0.9,
      clearance: 0.2,
    },
  ],
};
