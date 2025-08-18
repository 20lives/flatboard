import { KEYBOARD_PROFILES, type ParameterProfile, type RowLayoutItem } from './config.js';

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

    // Check rowLayout is properly defined
    const rowLayout = profile.layout?.matrix?.rowLayout;
    if (rowLayout) {
      if (!Array.isArray(rowLayout) || rowLayout.length === 0) {
        errors.push('rowLayout must be a non-empty array');
      } else {
        for (let i = 0; i < rowLayout.length; i++) {
          const row = rowLayout[i] as RowLayoutItem;
          if (!row || typeof row !== 'object') {
            errors.push(`rowLayout[${i}] must be an object`);
            continue;
          }
          if (typeof row.start !== 'number') {
            errors.push(`rowLayout[${i}].start must be a number`);
          }
          if (typeof row.length !== 'number' || row.length <= 0) {
            errors.push(`rowLayout[${i}].length must be a positive number`);
          }
          if (row.offset !== undefined && typeof row.offset !== 'number') {
            errors.push(`rowLayout[${i}].offset must be a number if defined`);
          }
        }
      }
    }

    // Check thumb cluster configuration
    const thumbKeys = profile.thumb?.cluster?.keys;
    if (thumbKeys !== undefined && thumbKeys < 0) {
      errors.push('thumb cluster keys must be non-negative');
    }

    const thumbPerKeyRotation = profile.thumb?.perKey?.rotations;
    if (thumbPerKeyRotation && thumbKeys && thumbPerKeyRotation.length !== thumbKeys) {
      errors.push('thumb perKey rotations array length must match thumb cluster keys');
    }

    const thumbPerKeyOffset = profile.thumb?.perKey?.offsets;
    if (thumbPerKeyOffset && thumbKeys && thumbPerKeyOffset.length !== thumbKeys) {
      errors.push('thumb perKey offsets array length must match thumb cluster keys');
    }

    // Check thickness relationships
    const totalThickness = profile.switch?.plate?.totalThickness;
    const plateThickness = profile.switch?.plate?.thickness;
    if (totalThickness !== undefined && plateThickness !== undefined) {
      if (plateThickness >= totalThickness) {
        errors.push('switch plate thickness must be less than total thickness');
      }
    }

    return { valid: errors.length === 0, errors };
  }

}

