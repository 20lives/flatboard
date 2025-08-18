// Base default configuration - all profiles inherit from this
const BASE_PARAMETERS = {
  // Layout Configuration
  cols: 3,
  rows: 5,
  baseRowOffsets: [],
  pitch: 18.2,
  centerGap: 25.0,
  edgeMargin: 6.0,
  buildSide: 'both', // 'left', 'right', or 'both'
  
  // Switch & Plate
  switchType: 'choc', // 'choc' for Kailh Choc, 'mx' for Cherry MX
  baseCutout: 13.8,   // Kailh Choc cutout size
  topPlateThickness: 1.6,
  totalThickness: 4.0,
  thinZone: 15.0,
  
  // Thumb Cluster
  thumbKeys: 3,
  thumbPitch: 20.0,
  thumbXOffset: 47.0,
  thumbYOffset: 5.0,
  thumbVertical: true,
  thumbClusterRotation: 17.0,
  thumbPerKeyRotation: [-10, 0, +10],
  thumbPerKeyOffset: [{ x: 0, y: 0 }, { x: -2.1, y: 0 }, { x: 0, y: 0 }],
  
  // Global Rotation
  baseRotationDegrees: 0,
  
  // Enclosure Design
  wallThickness: 1.5,         // Case wall thickness
  bottomThickness: 1.0,       // Bottom plate thickness
  topWallHeight: 8.0,         // Height of walls attached to top plate (extended for overlap)
  bottomWallHeight: 2.0,      // Height of walls in bottom case
  
  // Heat Insert Mounting
  mountRadius: 10,            // Heat insert mount radius
  insertHeight: 3,            // Heat insert mount height
  insertRadius: 2,            // Heat insert hole radius
  screwDiameter: 3.2,         // M3 screw clearance hole diameter
  
  // Mounting Hardware Geometry
  mountInsetDivisor: 2,       // wallThickness / mountInsetDivisor for corner inset
  mountOffsetFactor: 2,       // mountRadius / 5 * 2 for screw positioning
  cornerRotations: [0, 90, 270, 180] as const, // Bottom-left, bottom-right, top-left, top-right
  
  // Screw Specifications
  screwRadius: 1.5,           // M3 screw shaft radius
  screwHeadRadius: 3.0,       // M3 screw head radius
  screwHeadHeight: 1.1,       // M3 screw head height
  
  // Manufacturing Tolerances
  generalClearance: 0.1,      // General fitting clearance
  extrusionTolerance: 0.2,    // Additional height for boolean operations
  
  // Frame Design
  frameWallThickness: 1.0,    // Wall thickness around each key
  frameScaleFactor: 4,        // Multiplier for frame wall thickness in cutouts
  
  // Top Plate Geometry
  skinReductionHeight: 2.5,   // Reduction from totalThickness for skin height
  
  // Output
  openscadResolution: 64,
} as const;

// Switch type specifications
export const SWITCH_SPECS = {
  choc: {
    description: 'Kailh Choc Low Profile',
    cutoutSize: 13.8,        // Kailh Choc switch cutout
    plateThickness: 1.6,     // Recommended plate thickness for Choc
    totalThickness: 8.0,     // Low profile total thickness
    thinZone: 15.0,          // Clearance zone around switch
    pitch: 18.0,             // Choc spacing
  },
  mx: {
    description: 'Cherry MX Compatible',
    cutoutSize: 13.9,        // Cherry MX switch cutout
    plateThickness: 5.0,     // Standard MX plate thickness
    totalThickness: 7.1,     // Higher profile for MX switches
    thinZone: 15.9,          // Slightly larger clearance for MX
    pitch: 18.6,            // Standard MX spacing (0.75")
  },
} as const;

// Type definitions
export type Point2D = { x: number; y: number };
export type KeyPlacement = { pos: Point2D; rot: number };
export type ParameterProfile = Partial<typeof BASE_PARAMETERS>;

// Predefined keyboard profiles
export const KEYBOARD_PROFILES = {
  'ortho-36': {
    cols: 3,
    rows: 5,
    baseRotationDegrees: -77.0,
    baseRowOffsets: [5, 1, 0, 3, 4],
    thumbKeys: 3,
    centerGap: 25.0,
    thumbXOffset: 47.0,
    thumbYOffset: 5.0,
  },
  'ortho-4x10': {
    cols: 4,
    rows: 10,
    thumbKeys: 0,
    centerGap: 25.0,
    thumbXOffset: 47.0,
    thumbYOffset: 5.0,
    buildSide: 'right',
  },
  'ortho-36-mx': {
    switchType: 'mx',
    cols: 3,
    rows: 5,
    baseRowOffsets: [5, 1, 0, 3, 4],
    thumbKeys: 3,
    centerGap: 23.0,
    thumbXOffset: 50.0,
    thumbYOffset: 6.0,
    baseRotationDegrees: -77.0,
    topWallHeight: 12,
    edgeMargin: 4.0,
  },
  'test-single-choc': {
    buildSide: 'right',
    cols: 1,
    rows: 1,
    thumbKeys: 0,
    edgeMargin: 10.0,
  },
  'test-single-mx': {
    buildSide: 'left',
    switchType: 'mx',
    cols: 1,
    rows: 1,
    thumbKeys: 0,
    edgeMargin: 15.0,
    topWallHeight: 12,
  },
  
} as const satisfies Record<string, ParameterProfile>;

// Default profile - configured here as single source of truth
const DEFAULT_PROFILE = 'ortho-36' as keyof typeof KEYBOARD_PROFILES;

// Export for external use
export { DEFAULT_PROFILE };

/**
 * Creates a final flattened configuration with all computed values included
 */
function createFinalConfig(profileName?: keyof typeof KEYBOARD_PROFILES) {
  const actualProfile = profileName || DEFAULT_PROFILE;
  const profile = KEYBOARD_PROFILES[actualProfile];
  
  if (!profile) {
    console.warn(`Profile '${actualProfile}' not found. Using base configuration.`);
    return createFinalConfig(DEFAULT_PROFILE);
  }
  
  // Merge base parameters with profile overrides
  const mergedParams = { ...BASE_PARAMETERS, ...profile };
  
  // Get switch specifications
  const switchSpec = SWITCH_SPECS[mergedParams.switchType as keyof typeof SWITCH_SPECS];
  
  // Create final flattened configuration with all computed values
  return {
    ...mergedParams,
    
    // Switch-specific values (flattened from switch specs)
    cutoutSize: switchSpec.cutoutSize,
    pitch: switchSpec.pitch,
    thinZone: switchSpec.thinZone,
    plateThickness: switchSpec.plateThickness,
    totalThickness: switchSpec.totalThickness,
    
    // Other computed values
    manufacturingScaleMargin: 1.2,
    mountInset: mergedParams.wallThickness / mergedParams.mountInsetDivisor,
    mountOffset: mergedParams.mountRadius / 5 * mergedParams.mountOffsetFactor,
    skinThickness: mergedParams.totalThickness - mergedParams.skinReductionHeight,
    
    // Frequently calculated dimensions - computed once to eliminate duplication
    frameStructureHeight: switchSpec.totalThickness - switchSpec.plateThickness,
    maximumKeySize: Math.max(switchSpec.cutoutSize, switchSpec.thinZone),
    cornerInset: mergedParams.wallThickness / 2,
    
    // Mount geometry calculations
    mountCutoutWidth: mergedParams.mountRadius * 2,
    mountCutoutOffset: (mergedParams.wallThickness + mergedParams.mountRadius) / 2,
    
    // Z-position calculations
    topWallCenterZ: -mergedParams.topWallHeight / 2,
    bottomWallCenterZ: mergedParams.bottomWallHeight / 2,
    insertMountCenterZ: mergedParams.insertHeight / 2 - mergedParams.topWallHeight + mergedParams.bottomWallHeight,
    
    // Tolerance-based height extensions (helper functions would be better, but values work for now)
    extrusionToleranceHeight: mergedParams.extrusionTolerance,
    generalClearanceHeight: mergedParams.generalClearance,
    doubleGeneralClearanceHeight: mergedParams.generalClearance * 2,
  } as const;
}

// Current active profile - can be set via environment variable or defaults to configured default
const ACTIVE_PROFILE = (process.env.KEYBOARD_PROFILE as keyof typeof KEYBOARD_PROFILES) || DEFAULT_PROFILE;

// Export the resolved final configuration for the active profile
export const CONFIG = createFinalConfig(ACTIVE_PROFILE);

// Export factory function for creating configs for specific profiles
export function createConfig(profileName?: keyof typeof KEYBOARD_PROFILES) {
  return createFinalConfig(profileName);
}

