/**
 * Profile Loader
 *
 * Provides type-safe access to keyboard profiles.
 * This module bridges the src/ codebase with the profiles/ data directory.
 */

import { PROFILES, type ProfileName } from '../profiles/index.js';
import type { ParameterProfile } from './interfaces.js';

/**
 * Get all available profile names
 */
export function getProfileNames(): string[] {
  return Object.keys(PROFILES);
}

/**
 * Check if a profile exists
 */
export function profileExists(profileName: string): boolean {
  return profileName in PROFILES;
}

/**
 * Get a profile by name
 * Returns the profile or undefined if not found
 */
export function getProfile(profileName: string): ParameterProfile | undefined {
  return PROFILES[profileName];
}

/**
 * Export the profiles object for compatibility
 */
export { PROFILES as KEYBOARD_PROFILES };
export type { ProfileName };
