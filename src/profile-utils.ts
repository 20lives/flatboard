import { KEYBOARD_PROFILES } from './config.js';

export function profileExists(profileName: string): boolean {
  return profileName in KEYBOARD_PROFILES;
}
