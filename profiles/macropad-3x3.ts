import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  layout: {
    mode: 'split',
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
};
