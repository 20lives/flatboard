import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import type { EdgeMargin, KeyboardConfig, ParameterProfile } from './interfaces.js';
import { KEYBOARD_PROFILES } from './profile-loader.js';
import { SWITCH_SPECS } from './switches.js';
import { deepMerge } from './utils.js';

export * from './connector-specs.js';
export * from './interfaces.js';
export * from './profile-loader.js';
export * from './switches.js';

const getProfile = (profileName: string): O.Option<ParameterProfile> =>
  pipe(KEYBOARD_PROFILES[profileName], O.fromNullable);

const getSwitchSpec = (switchType: string): O.Option<(typeof SWITCH_SPECS)[keyof typeof SWITCH_SPECS]> =>
  pipe(SWITCH_SPECS[switchType as keyof typeof SWITCH_SPECS], O.fromNullable);

function createFinalConfig(profileName: string): KeyboardConfig {
  return pipe(
    getProfile(profileName),
    O.fold(
      () => {
        throw new Error(`Profile '${profileName}' not found`);
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

const normalizeEdgeMargin = (edgeMargin: number | EdgeMargin | undefined): EdgeMargin => {
  if (typeof edgeMargin === 'number') {
    return { top: edgeMargin, bottom: edgeMargin, left: edgeMargin, right: edgeMargin };
  }
  if (edgeMargin) {
    return edgeMargin;
  }
  // Default fallback
  return { top: 0, bottom: 0, left: 0, right: 0 };
};

const createConfigFromProfile = (params: ParameterProfile): KeyboardConfig => {
  const config = params as unknown as KeyboardConfig;

  // Normalize edgeMargin from number to EdgeMargin object if needed
  if (config.layout?.edgeMargin !== undefined) {
    config.layout.edgeMargin = normalizeEdgeMargin(config.layout.edgeMargin as number | EdgeMargin);
  }

  return config;
};

export function createConfig(profileName: string): KeyboardConfig {
  return createFinalConfig(profileName);
}
