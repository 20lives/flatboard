import { KEYBOARD_PROFILES, type ParameterProfile } from './config.js';

/**
 * Profile management utilities
 */
export class ProfileManager {
  /**
   * Get all available profile names
   */
  static getAvailableProfiles(): string[] {
    return Object.keys(KEYBOARD_PROFILES);
  }

  /**
   * Check if a profile exists
   */
  static profileExists(profileName: string): boolean {
    return profileName in KEYBOARD_PROFILES;
  }

  /**
   * Get profile details
   */
  static getProfile(profileName: string): ParameterProfile | undefined {
    return KEYBOARD_PROFILES[profileName as keyof typeof KEYBOARD_PROFILES];
  }

  /**
   * Create a custom profile by merging existing profile with overrides
   */
  static createCustomProfile(
    baseName: string, 
    overrides: ParameterProfile, 
    customName?: string
  ): { name: string; profile: ParameterProfile } {
    const baseProfile = this.getProfile(baseName);
    if (!baseProfile) {
      throw new Error(`Base profile '${baseName}' not found`);
    }

    const customProfile = { ...baseProfile, ...overrides };
    const name = customName || `${baseName}-custom`;
    
    return { name, profile: customProfile };
  }

  /**
   * Validate a profile configuration
   */
  static validateProfile(profile: ParameterProfile): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required numeric values are positive
    if (profile.cols !== undefined && profile.cols <= 0) {
      errors.push('cols must be positive');
    }
    if (profile.rows !== undefined && profile.rows <= 0) {
      errors.push('rows must be positive');
    }
    if (profile.thumbKeys !== undefined && profile.thumbKeys < 0) {
      errors.push('thumbKeys must be non-negative');
    }

    // Check array lengths match expectations
    if (profile.baseRowOffsets && profile.rows && profile.baseRowOffsets.length !== profile.rows) {
      errors.push('baseRowOffsets array length must match rows');
    }
    if (profile.thumbPerKeyRotation && profile.thumbKeys && profile.thumbPerKeyRotation.length !== profile.thumbKeys) {
      errors.push('thumbPerKeyRotation array length must match thumbKeys');
    }
    if (profile.thumbPerKeyOffset && profile.thumbKeys && profile.thumbPerKeyOffset.length !== profile.thumbKeys) {
      errors.push('thumbPerKeyOffset array length must match thumbKeys');
    }

    // Check thickness relationships
    if (profile.totalThickness !== undefined && profile.plateThickness !== undefined) {
      if (profile.plateThickness >= profile.totalThickness) {
        errors.push('plateThickness must be less than totalThickness');
      }
    }

    return { valid: errors.length === 0, errors };
  }

}

/**
 * Export utility functions for convenience
 */
export const {
  getAvailableProfiles,
  profileExists,
  getProfile,
  createCustomProfile,
  validateProfile,
} = ProfileManager;
