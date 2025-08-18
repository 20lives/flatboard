// Base default configuration - all profiles inherit from this
const BASE_PARAMETERS = {
  layout: {
    matrix: {
      rowLayout: [], // Array of { start, length, offset } objects defining each row
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
    plate: {
      thickness: 1.5,        // Top plate thickness (separate from switch plate)
    },
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
  
  connectors: [
    // Default USB-C connector
    {
      type: 'usbC',
      enabled: true,
      face: 'top',        // 'top', 'bottom', 'left', 'right'
      position: 0.5,      // 0.0 to 1.0 along the face (0.5 = center)
      clearance: 0.2,     // Additional clearance around socket
    },
  ],
  
  output: {
    openscad: {
      resolution: 64,
    },
  },
} as const;

// Connector type specifications
export const CONNECTOR_SPECS = {
  usbC: {
    description: 'USB-C Female Socket',
    geometry: {
      type: 'pill',           // Two circles with hull
      circleRadius: 1.55,     // Radius of each circle
      centerDistance: 5.8,    // Distance between circle centers
      depth: 7.0,             // Default cutout depth
    },
  },
  trrs: {
    description: 'TRRS 3.5mm Audio Jack',
    geometry: {
      type: 'circle',         // Single circle
      radius: 2.45,           // 2.45mm radius for TRRS jack
      depth: 8.0,             // Default cutout depth
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
        thickness: 4.1,     // Standard MX plate thickness
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
        rowLayout: [
          { start: 0, length: 3, offset: 5 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 }
        ],
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
        rowLayout: [
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 },
          { start: 0, length: 4, offset: 0 }
        ],
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
        rowLayout: [
          { start: 0, length: 3, offset: 5 },
          { start: 0, length: 3, offset: 1 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 3 },
          { start: 0, length: 3, offset: 4 }
        ],
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
      plate: {
        thickness: 1.6,
      },
      walls: {
        top: {
          height: 12,
        },
      },
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'left',
        position: 0.25,
        clearance: 0.2,
      },
    ],
  },
  'test-single-choc': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 1, offset: 0 }
        ],
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
        rowLayout: [
          { start: 0, length: 1, offset: 0 }
        ],
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
  'test-multi-connectors': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 },
          { start: 0, length: 3, offset: 0 }
        ],
      },
      spacing: {
        edgeMargin: 15.0,
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
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'bottom',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'left',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'usbC',
        enabled: true,
        face: 'right',
        position: 0.5,
        clearance: 0.2,
      },
      {
        type: 'trrs',
        enabled: true,
        face: 'left',
        position: 0.7,
        clearance: 0.1,
      },
    ],
  },
  'test-custom-rows': {
    layout: {
      matrix: {
        rowLayout: [
          { start: 0, length: 4, offset: 2 },
          { start: 0, length: 5, offset: 0 },
          { start: 0, length: 5, offset: 1 }
        ],
      },
      spacing: {
        edgeMargin: 12.0,
      },
      build: {
        side: 'right',
      },
    },
    thumb: {
      cluster: {
        keys: 2,
      },
    },
    connectors: [
      {
        type: 'usbC',
        enabled: true,
        face: 'top',
        position: 0.3,
        clearance: 0.2,
      },
    ],
  },
  'test-advanced-layout': {
    layout: {
      matrix: {
        rowLayout: [
          { start: -1, length: 3 },  // Row 0: keys at grid positions 0,1,2,3
          { start: 1, length: 4 },  // Row 1: keys at grid positions 0,1,2,3,4  
          { start: 0, length: 3 }   // Row 2: keys at grid positions 1,2,3,4 (offset right)
        ],
        baseRowOffsets: [2, 0, 1],  // Stagger still works
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
        keys: 2,
      },
    },
    connectors: [
      {
        type: 'trrs',
        enabled: true,
        face: 'left',
        position: 0.5,
        clearance: 0.1,
      },
    ],
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
    
    // Enhanced connectors section - pass through as array
    connectors: finalParams.connectors,
    
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

