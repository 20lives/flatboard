/**
 * Base default configuration parameters
 * All profiles inherit from these base parameters
 */

// Base default configuration - all profiles inherit from this
export const BASE_PARAMETERS = {
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
      side: 'both' as const, // 'left', 'right', or 'both'
    },
    rotation: {
      baseDegrees: 0,
    },
  },
  
  switch: {
    type: 'choc' as const, // 'choc' for Kailh Choc, 'mx' for Cherry MX
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
      face: 'top' as const,        // 'top', 'bottom', 'left', 'right'
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