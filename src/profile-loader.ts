import { PROFILES, type ProfileName } from '../profiles/index.js';
import type { ParameterProfile } from './interfaces.js';

export function getProfileNames(): string[] {
  return Object.keys(PROFILES);
}

export function profileExists(profileName: string): boolean {
  return profileName in PROFILES;
}

export function getProfile(profileName: string): ParameterProfile | undefined {
  return PROFILES[profileName];
}

export { PROFILES as KEYBOARD_PROFILES };
export type { ProfileName };
