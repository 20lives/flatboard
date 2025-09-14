/**
 * Predefined keyboard profiles and profile management
 * Enhanced with fp-ts Record utilities
 */

import type { ParameterProfile } from './interfaces.js';
import * as R from 'fp-ts/Record';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

// Predefined keyboard profiles
export const KEYBOARD_PROFILES = {
  '3x3': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
        ],
        spacing: 18,
      },
      spacing: {
        edgeMargin: 10.0,
      },
      rotation: {
        baseDegrees: 0.0,
      },
    },
    switch: {
      type: 'choc' as const,
    },
    thumb: {
      cluster: {
        keys: 0,
      },
      offset: {
        x: 25,
        y: 5,
      },
    },
    enclosure: {
      plate: {
        topThickness: 1.5,
        bottomThickness: 1.0,
      },
      walls: {
        thickness: 1.5,
        height: 8.0,
      },
    },
    tolerances: {
      general: 0.1,
      extrusion: 0.2,
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top' as const,
        position: 0.5,
        clearance: 0.2,
      },
    ],
    output: {
      openscad: {
        resolution: 64,
      },
    },
  },
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
        spacing: 18,
      },
      spacing: {
        edgeMargin: 6.0,
      },
      rotation: {
        baseDegrees: 13.0,
      },
    },
    switch: {
      type: 'choc' as const,
    },
    thumb: {
      cluster: {
        keys: 3,
        spacing: 20.0,
        rotation: 17.0,
      },
      offset: {
        x: 25,
        y: 5,
      },
      perKey: {
        rotations: [-10, 0, +10],
        offsets: [
          { x: 0, y: 0 },
          { x: -2.1, y: 0 },
          { x: 0, y: 0 },
        ],
      },
    },
    enclosure: {
      plate: {
        topThickness: 1.5,
        bottomThickness: 1.0,
      },
      walls: {
        thickness: 1.5,
        height: 5.0,
      },
    },
    tolerances: {
      general: 0.1,
      extrusion: 0.2,
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'bottom' as const,
        position: 0.8,
        clearance: 0.2,
      },
    ],
    output: {
      openscad: {
        resolution: 128,
      },
    },
  },
  'test-single-choc': {
    layout: {
      matrix: {
        rowLayout: [{ start: 0, length: 1, offset: 0 }],
        spacing: 18.2,
      },
      spacing: {
        edgeMargin: 24.0,
      },
      rotation: {
        baseDegrees: 0,
      },
    },
    switch: {
      type: 'choc' as const,
    },
    thumb: {
      cluster: {
        keys: 0,
        spacing: 20.0,
        rotation: 17.0,
      },
      offset: {
        x: 0.0,
        y: 0.0,
      },
      perKey: {
        rotations: [-10, 0, +10],
        offsets: [
          { x: 0, y: 0 },
          { x: -2.1, y: 0 },
          { x: 0, y: 0 },
        ],
      },
    },
    enclosure: {
      plate: {
        topThickness: 1.5,
        bottomThickness: 1.0,
      },
      walls: {
        thickness: 1.5,
        height: 8.0,
      },
    },
    tolerances: {
      general: 0.1,
      extrusion: 0.2,
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top' as const,
        position: 0.5,
        clearance: 0.2,
      },
    ],
    output: {
      openscad: {
        resolution: 64,
      },
    },
  },
} as const satisfies Record<string, ParameterProfile>;

// Default profile - configured here as single source of truth
export const DEFAULT_PROFILE = 'split-36' as keyof typeof KEYBOARD_PROFILES;

export type ProfileName = keyof typeof KEYBOARD_PROFILES;

// Enhanced profile utilities using fp-ts Record
export const getProfileNames = (): string[] => 
  pipe(
    KEYBOARD_PROFILES,
    R.keys
  );

export const getProfileByName = (name: string): O.Option<ParameterProfile> =>
  pipe(
    KEYBOARD_PROFILES,
    R.lookup(name)
  );

export const filterProfilesBySwitch = (switchType: 'choc' | 'mx'): Record<string, ParameterProfile> =>
  pipe(
    KEYBOARD_PROFILES,
    R.filter((profile) => profile.switch.type === switchType)
  );

export const getProfileKeyCount = (profileName: string): O.Option<number> =>
  pipe(
    getProfileByName(profileName),
    O.map((profile) => {
      const matrixKeys = profile.layout?.matrix?.rowLayout?.reduce(
        (sum, row) => sum + row.length, 
        0
      ) ?? 0;
      const thumbKeys = profile.thumb?.cluster?.keys ?? 0;
      return matrixKeys + thumbKeys;
    })
  );

export const getAllProfileStats = () =>
  pipe(
    KEYBOARD_PROFILES,
    R.mapWithIndex((name, profile) => ({
      name,
      switchType: profile.switch.type,
      keyCount: pipe(
        getProfileKeyCount(name),
        O.getOrElse(() => 0)
      ),
      hasThumb: (profile.thumb?.cluster?.keys ?? 0) > 0,
    }))
  );

// Validate all profiles using fp-ts
export const validateAllProfiles = (): Record<string, boolean> =>
  pipe(
    KEYBOARD_PROFILES,
    R.map((profile) => {
      const hasValidLayout = Boolean(
        profile.layout?.matrix?.rowLayout && 
        profile.layout.matrix.rowLayout.length > 0
      );
      const hasValidSwitch = Boolean(profile.switch?.type);
      const hasValidThumb = Boolean(profile.thumb?.cluster !== undefined);
      
      return hasValidLayout && hasValidSwitch && hasValidThumb;
    })
  );
