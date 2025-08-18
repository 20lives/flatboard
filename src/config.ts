/**
 * Main configuration factory and exports
 * Orchestrates the modular configuration system
 */

import { BASE_PARAMETERS } from './base-params.js';
import { SWITCH_SPECS } from './switches.js';
import { CONNECTOR_SPECS } from './connector-specs.js';
import { KEYBOARD_PROFILES, DEFAULT_PROFILE } from './keyboard-profiles.js';
import { deepMerge } from './utils.js';
import { type KeyboardConfig } from './interfaces.js';

// Re-export everything for backward compatibility
export * from './interfaces.js';
export * from './switches.js';
export * from './connector-specs.js';
export * from './keyboard-profiles.js';
export * from './base-params.js';

// Update ParameterProfile type now that we have BASE_PARAMETERS
export type ParameterProfile = Partial<typeof BASE_PARAMETERS>;

/**
 * Creates a final nested configuration with all computed values included
 */
function createFinalConfig(profileName?: keyof typeof KEYBOARD_PROFILES): KeyboardConfig {
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
  const finalConfig: KeyboardConfig = {
    layout: finalParams.layout,
    switch: finalParams.switch,
    thumb: finalParams.thumb,
    output: finalParams.output,
    connectors: finalParams.connectors,
    
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
  };
  
  return finalConfig;
}

// Export factory function for creating configs for specific profiles
export function createConfig(profileName?: keyof typeof KEYBOARD_PROFILES): KeyboardConfig {
  return createFinalConfig(profileName);
}