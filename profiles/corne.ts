import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  layout: {
    mode: 'split',
    matrix: {
      rowLayout: [
        { start: 0, length: 2, offset: 5.5, thumbAnchor: 1 },       // Row 7: 0 offset
        { start: 0, length: 3, offset: -2.382 },   // Row 6: +2.382 offset
        { start: 0, length: 3, offset: -4.763 },   // Row 5: +4.763 offset
        { start: 0, length: 3, offset: -7.144 },   // Row 4: +7.144 offset (anchor for thumb)
        { start: 0, length: 3, offset: -4.763 },   // Row 3: +4.763 offset
        { start: 0, length: 3, offset: 0 },       // Row 1: 0 offset
        { start: 0, length: 3, offset: 0 },       // Row 2: 0 offset
      ],
    },
    edgeMargin: 10.0,
    baseDegrees: 0,
  },
  switch: {
    type: 'choc',
  },
  thumb: {
    cluster: {
      keys: 3,
      // spacing: 18.0,
      // rotation: 11.94,
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
    caseStyle: 'organic',
    poleVisualization: {
      enabled: true,
      showAllPoles: false,
      showExtremePoles: true,
      showFaces: ['bottom', 'top', 'left', 'right'],
      sectionSize: 15,
      sectionOffset: 5, 
    },
    organicCornerRadius: 0.0,
    bottomPattern: {
      type: 'honeycomb',
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
  },
  connectors: [
    {
      type: 'usbC',
      enabled: true,
      face: 'right',
      position: 0.5,
      segment: 4,
      clearance: 0.2,
    },
    {
      type: 'usbC',
      enabled: true,
      face: 'top',
      position: 0.5,
      segment: 3,
      clearance: 0.2,
    },
    {
      type: 'usbC',
      enabled: true,
      face: 'bottom',
      position: 0.5,
      segment: 0,
      clearance: 0.2,
    },
    {
      type: 'usbC',
      enabled: true,
      face: 'left',
      position: 0.5,
      segment: 0,
      clearance: 0.2,
    },
  ],
};
