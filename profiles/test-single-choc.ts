import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  layout: {
    mode: 'split',
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
    bottomPattern: {
      type: 'circles',
      cellSize: 5,
      wallThickness: 1.2,
      margin: 3,
    },
  },
};
