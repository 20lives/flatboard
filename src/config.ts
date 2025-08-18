// Base default configuration - all profiles inherit from this
const BASE_PARAMETERS = {
  layout: {
    matrix: {
      cols: 3,
      rows: 5,
      baseRowOffsets: [],
      pitch: 18.2,
    },
    spacing: {
      centerGap: 25.0,
      edgeMargin: 6.0,
    },
    build: {
      side: 'both', // 'left', 'right', or 'both'
    },
    rotation: {
      baseDegrees: 0,
    },
  },
  
  switch: {
    type: 'choc', // 'choc' for Kailh Choc, 'mx' for Cherry MX
    cutout: {
      size: 13.8,   // Kailh Choc cutout size
      thinZone: 15.0,
    },
    plate: {
      thickness: 1.6,
      totalThickness: 4.0,
    },
  },
  
  thumb: {
    cluster: {
      keys: 3,
      pitch: 20.0,
      vertical: true,
      rotation: 17.0,
    },
    offset: {
      x: 47.0,
      y: 5.0,
    },
    perKey: {
      rotations: [-10, 0, +10],
      offsets: [{ x: 0, y: 0 }, { x: -2.1, y: 0 }, { x: 0, y: 0 }],
    },
  },
  
  enclosure: {
    walls: {
      thickness: 1.5,         // Case wall thickness
      top: {
        height: 8.0,         // Height of walls attached to top plate (extended for overlap)
      },
      bottom: {
        height: 2.0,         // Height of walls in bottom case
        thickness: 1.0,      // Bottom plate thickness
      },
    },
    frame: {
      wallThickness: 1.0,    // Wall thickness around each key
      scaleFactor: 4,        // Multiplier for frame wall thickness in cutouts
    },
    skin: {
      reductionHeight: 2.5,   // Reduction from totalThickness for skin height
    },
  },
  
  mounting: {
    corner: {
      radius: 10,            // Heat insert mount radius
      insetDivisor: 2,       // wallThickness / mountInsetDivisor for corner inset
      offsetFactor: 2,       // mountRadius / 5 * 2 for screw positioning
      rotations: [0, 90, 270, 180] as const, // Bottom-left, bottom-right, top-left, top-right
    },
    insert: {
      height: 3,            // Heat insert mount height
      radius: 2,            // Heat insert hole radius
    },
    screw: {
      diameter: 3.2,         // M3 screw clearance hole diameter
      radius: 1.5,           // M3 screw shaft radius
      head: {
        radius: 3.0,       // M3 screw head radius
        height: 1.1,       // M3 screw head height
      },
    },
  },
  
  tolerances: {
    general: 0.1,      // General fitting clearance
    extrusion: 0.2,    // Additional height for boolean operations
  },
  
  output: {
    openscad: {
      resolution: 64,
    },
  },
} as const;

// Switch type specifications
export const SWITCH_SPECS = {
  choc: {
    description: 'Kailh Choc Low Profile',
    switch: {
      cutout: {
        size: 13.8,        // Kailh Choc switch cutout
        thinZone: 15.0,    // Clearance zone around switch
      },
      plate: {
        thickness: 1.6,     // Recommended plate thickness for Choc
        totalThickness: 8.0,     // Low profile total thickness
      },
    },
    layout: {
      matrix: {
        pitch: 18.0,             // Choc spacing
      },
    },
  },
  mx: {
    description: 'Cherry MX Compatible',
    switch: {
      cutout: {
        size: 13.9,        // Cherry MX switch cutout
        thinZone: 15.9,    // Slightly larger clearance for MX
      },
      plate: {
        thickness: 5.0,     // Standard MX plate thickness
        totalThickness: 7.1,     // Higher profile for MX switches
      },
    },
    layout: {
      matrix: {
        pitch: 18.6,            // Standard MX spacing (0.75")
      },
    },
  },
} as const;

// Type definitions
export type Point2D = { x: number; y: number };
export type KeyPlacement = { pos: Point2D; rot: number };
export type ParameterProfile = Partial<typeof BASE_PARAMETERS>;

// Predefined keyboard profiles
export const KEYBOARD_PROFILES = {
  'ortho-36': {
    layout: {
      matrix: {
        cols: 3,
        rows: 5,
        baseRowOffsets: [5, 1, 0, 3, 4],
      },
      spacing: {
        centerGap: 25.0,
      },
      rotation: {
        baseDegrees: -77.0,
      },
    },
    thumb: {
      cluster: {
        keys: 3,
      },
      offset: {
        x: 47.0,
        y: 5.0,
      },
    },
  },
  'ortho-4x10': {
    layout: {
      matrix: {
        cols: 4,
        rows: 10,
      },
      spacing: {
        centerGap: 25.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 0,
      },
      offset: {
        x: 47.0,
        y: 5.0,
      },
    },
  },
  'ortho-36-mx': {
    switch: {
      type: 'mx',
    },
    layout: {
      matrix: {
        cols: 3,
        rows: 5,
        baseRowOffsets: [5, 1, 0, 3, 4],
      },
      spacing: {
        centerGap: 23.0,
        edgeMargin: 4.0,
      },
      rotation: {
        baseDegrees: -77.0,
      },
    },
    thumb: {
      cluster: {
        keys: 3,
      },
      offset: {
        x: 50.0,
        y: 6.0,
      },
    },
    enclosure: {
      walls: {
        top: {
          height: 12,
        },
      },
    },
  },
  'test-single-choc': {
    layout: {
      matrix: {
        cols: 1,
        rows: 1,
      },
      spacing: {
        edgeMargin: 10.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 0,
      },
    },
  },
  'test-single-mx': {
    layout: {
      matrix: {
        cols: 1,
        rows: 1,
      },
      spacing: {
        edgeMargin: 15.0,
      },
      build: {
        side: 'left',
      },
    },
    switch: {
      type: 'mx',
    },
    thumb: {
      cluster: {
        keys: 0,
      },
    },
    enclosure: {
      walls: {
        top: {
          height: 12,
        },
      },
    },
  },
  
} as const satisfies Record<string, ParameterProfile>;

// Default profile - configured here as single source of truth
const DEFAULT_PROFILE = 'ortho-36' as keyof typeof KEYBOARD_PROFILES;

// Export for external use
export { DEFAULT_PROFILE };

import { deepMerge } from './utils.js';

/**
 * Creates a final nested configuration with all computed values included
 */
function createFinalConfig(profileName?: keyof typeof KEYBOARD_PROFILES) {
  const actualProfile = profileName || DEFAULT_PROFILE;
  const profile = KEYBOARD_PROFILES[actualProfile];
  
  if (!profile) {
    console.warn(`Profile '${actualProfile}' not found. Using base configuration.`);
    return createFinalConfig(DEFAULT_PROFILE);
  }
  
  // Deep merge base parameters with profile overrides
  const mergedParams = deepMerge(BASE_PARAMETERS, profile);
  
  // Get switch specifications and apply them
  const switchSpec = SWITCH_SPECS[mergedParams.switch.type as keyof typeof SWITCH_SPECS];
  const finalParams = deepMerge(mergedParams, switchSpec);
  
  // Add computed values to the final configuration
  const finalConfig = {
    ...finalParams,
    
    // Enhanced enclosure section with computed skin thickness
    enclosure: {
      ...finalParams.enclosure,
      skin: {
        ...finalParams.enclosure.skin,
        thickness: finalParams.switch.plate.totalThickness - finalParams.enclosure.skin.reductionHeight,
      },
    },
    
    // Enhanced mounting section with computed values
    mounting: {
      ...finalParams.mounting,
      corner: {
        ...finalParams.mounting.corner,
        inset: finalParams.enclosure.walls.thickness / finalParams.mounting.corner.insetDivisor,
        offset: finalParams.mounting.corner.radius / 5 * finalParams.mounting.corner.offsetFactor,
        cutoutWidth: finalParams.mounting.corner.radius * 2,
        cutoutOffset: (finalParams.enclosure.walls.thickness + finalParams.mounting.corner.radius) / 2,
      },
      insert: {
        ...finalParams.mounting.insert,
        centerZ: finalParams.mounting.insert.height / 2 - finalParams.enclosure.walls.top.height + finalParams.enclosure.walls.bottom.height,
      },
    },
    
    // Enhanced tolerances section with computed values
    tolerances: {
      ...finalParams.tolerances,
      generalHeight: finalParams.tolerances.general,
      extrusionHeight: finalParams.tolerances.extrusion,
      doubleGeneralHeight: finalParams.tolerances.general * 2,
    },
    
    // Additional computed dimensions
    computed: {
      manufacturingScaleMargin: 1.2,
      frameStructureHeight: finalParams.switch.plate.totalThickness - finalParams.switch.plate.thickness,
      maximumKeySize: Math.max(finalParams.switch.cutout.size, finalParams.switch.cutout.thinZone),
      cornerInset: finalParams.enclosure.walls.thickness / 2,
      topWallCenterZ: -finalParams.enclosure.walls.top.height / 2,
      bottomWallCenterZ: finalParams.enclosure.walls.bottom.height / 2,
    },
  } as const;
  
  return finalConfig;
}

// Current active profile - can be set via environment variable or defaults to configured default
const ACTIVE_PROFILE = (process.env.KEYBOARD_PROFILE as keyof typeof KEYBOARD_PROFILES) || DEFAULT_PROFILE;

// Export the resolved final configuration for the active profile
export const CONFIG = createFinalConfig(ACTIVE_PROFILE);

// Export factory function for creating configs for specific profiles
export function createConfig(profileName?: keyof typeof KEYBOARD_PROFILES) {
  return createFinalConfig(profileName);
}

