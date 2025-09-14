/**
 * Main configuration factory and exports
 * Orchestrates the modular configuration system
 */

import type { KeyboardConfig } from './interfaces.js';
import { DEFAULT_PROFILE, KEYBOARD_PROFILES } from './keyboard-profiles.js';
import { SWITCH_SPECS } from './switches.js';
import { deepMergeUnsafe } from './utils.js';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export * from './connector-specs.js';
// Re-export everything for backward compatibility
export * from './interfaces.js';
export * from './keyboard-profiles.js';
export * from './switches.js';

// ParameterProfile type - now that profiles are complete, they can be used directly
export type ParameterProfile = typeof KEYBOARD_PROFILES[keyof typeof KEYBOARD_PROFILES];

/**
 * Safe profile lookup using fp-ts Option
 */
const getProfile = (profileName: keyof typeof KEYBOARD_PROFILES): O.Option<typeof KEYBOARD_PROFILES[keyof typeof KEYBOARD_PROFILES]> =>
  pipe(
    KEYBOARD_PROFILES[profileName],
    O.fromNullable
  );

/**
 * Safe switch spec lookup using fp-ts Option
 */
const getSwitchSpec = (switchType: string): O.Option<typeof SWITCH_SPECS[keyof typeof SWITCH_SPECS]> =>
  pipe(
    SWITCH_SPECS[switchType as keyof typeof SWITCH_SPECS],
    O.fromNullable
  );

/**
 * Creates a final nested configuration with all computed values included
 * Enhanced with fp-ts Option for safer operations
 */
function createFinalConfig(profileName?: keyof typeof KEYBOARD_PROFILES): KeyboardConfig {
  const actualProfile = profileName || DEFAULT_PROFILE;
  
  return pipe(
    getProfile(actualProfile),
    O.fold(
      () => {
        console.warn(`Profile '${actualProfile}' not found. Using base configuration.`);
        return createFinalConfig(DEFAULT_PROFILE);
      },
      (profile) => {
        // Get switch specifications and apply them
        const switchSpecOption = getSwitchSpec(profile.switch.type);
        
        return pipe(
          switchSpecOption,
          O.fold(
            () => {
              console.warn(`Switch spec '${profile.switch.type}' not found. Using profile defaults.`);
              return createConfigFromProfile(profile);
            },
            (switchSpec) => {
              const finalParams = deepMergeUnsafe(profile, switchSpec);
              return createConfigFromProfile(finalParams);
            }
          )
        );
      }
    )
  );
}

/**
 * Creates KeyboardConfig from merged parameters with computed values
 */
const createConfigFromProfile = (params: any): KeyboardConfig => ({
  layout: params.layout,
  switch: params.switch,
  thumb: params.thumb,
  output: params.output,
  connectors: params.connectors,
  
  // Enhanced enclosure section
  enclosure: {
    ...params.enclosure,
  },
  
  // Enhanced tolerances section with computed values
  tolerances: {
    ...params.tolerances,
    generalHeight: params.tolerances.general,
    extrusionHeight: params.tolerances.extrusion,
    doubleGeneralHeight: params.tolerances.general * 2,
  },
});

// Safe version that returns Either for error handling
export const createConfigSafe = (profileName?: keyof typeof KEYBOARD_PROFILES): E.Either<string, KeyboardConfig> => {
  const actualProfile = profileName || DEFAULT_PROFILE;
  
  return pipe(
    getProfile(actualProfile),
    E.fromOption(() => `Profile '${actualProfile}' not found`),
    E.chain((profile) => 
      pipe(
        getSwitchSpec(profile.switch.type),
        E.fromOption(() => `Switch spec '${profile.switch.type}' not found`),
        E.map((switchSpec) => {
          const finalParams = deepMergeUnsafe(profile, switchSpec);
          return createConfigFromProfile(finalParams);
        })
      )
    )
  );
};

// Export factory function for creating configs for specific profiles (unsafe for backward compatibility)
export function createConfig(profileName?: keyof typeof KEYBOARD_PROFILES): KeyboardConfig {
  return createFinalConfig(profileName);
}
