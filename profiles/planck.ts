import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  output: {
    showSwitches: true,
    showKeycaps: true,
    keycapProfile: 'dsa',
  },
  layout: {
    mode: 'unibody',
    centerGap: 4,
    matrix: {
      rowLayout: [
        { start: 0, length: 4, offset: 0 },
        { start: 0, length: 4, offset: 0 },
        { start: 0, length: 4, offset: 0 },
        { start: 0, length: 4, offset: 0 },
        { start: 0, length: 4, offset: 0 },
        { start: 0, length: 4, offset: 0 },
      ],
    },
    edgeMargin: 12.0,
    baseDegrees: 0,
  },
  switch: {
    type: 'mx',
  },
  enclosure: {
    plate: {
      topThickness: 1.5,
      bottomThickness: 1.5,
    },
    walls: {
      thickness: 2.0,
      height: 10.0,
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
  ],
};
