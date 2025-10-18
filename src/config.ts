/**
 * Main configuration factory and exports
 * Orchestrates the modular configuration system
 */

import type { KeyboardConfig } from './interfaces.js';
import { DEFAULT_PROFILE, KEYBOARD_PROFILES } from './keyboard-profiles.js';
import { SWITCH_SPECS } from './switches.js';
import { deepMerge } from './utils.js';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export * from './connector-specs.js';
export * from './interfaces.js';
export * from './keyboard-profiles.js';
export * from './switches.js';

export type ParameterProfile = (typeof KEYBOARD_PROFILES)[keyof typeof KEYBOARD_PROFILES];

const getProfile = (
  profileName: keyof typeof KEYBOARD_PROFILES,
): O.Option<(typeof KEYBOARD_PROFILES)[keyof typeof KEYBOARD_PROFILES]> =>
  pipe(KEYBOARD_PROFILES[profileName], O.fromNullable);

const getSwitchSpec = (switchType: string): O.Option<(typeof SWITCH_SPECS)[keyof typeof SWITCH_SPECS]> =>
  pipe(SWITCH_SPECS[switchType as keyof typeof SWITCH_SPECS], O.fromNullable);

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
        const switchSpecOption = getSwitchSpec(profile.switch.type);

        return pipe(
          switchSpecOption,
          O.fold(
            () => {
              console.warn(`Switch spec '${profile.switch.type}' not found. Using profile defaults.`);
              return createConfigFromProfile(profile);
            },
            (switchSpec) =>
              pipe(
                deepMerge(profile, switchSpec as unknown as Partial<ParameterProfile>),
                E.getOrElse(() => {
                  console.error('Deep merge failed, using profile without switch spec');
                  return profile;
                }),
                createConfigFromProfile,
              ),
          ),
        );
      },
    ),
  );
}

const createConfigFromProfile = (params: ParameterProfile): KeyboardConfig => {
  // After merging profile with switch spec, all required fields should be present
  // TypeScript doesn't track this, so we use type assertion
  return params as unknown as KeyboardConfig;
};

export function createConfig(profileName?: keyof typeof KEYBOARD_PROFILES): KeyboardConfig {
  return createFinalConfig(profileName);
}
