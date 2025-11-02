import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
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
    bottomPattern: {
      type: 'honeycomb',
      cellSize: 12,
      wallThickness: 4,
      margin: 5,
    },
    magsafeRing: {
      clearance: 0.2,
      reinforcement: {
        outer: 2.0,
        inner: 2.0,
        height: 0.5,
      },
      position: {
        offset: { x: 0, y: 0 },
      },
    },
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
};
