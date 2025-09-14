import { KEYBOARD_PROFILES, type ParameterProfile } from './config.js';
import type { RowLayoutItem } from './interfaces.js';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

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
   * Get profile details with fp-ts Either for better error handling
   */
  static getProfile(profileName: string): ParameterProfile | undefined {
    return KEYBOARD_PROFILES[profileName as keyof typeof KEYBOARD_PROFILES];
  }

  /**
   * Safe profile getter using fp-ts Either
   */
  static getProfileSafe(profileName: string): E.Either<string, ParameterProfile> {
    const profile = KEYBOARD_PROFILES[profileName as keyof typeof KEYBOARD_PROFILES];
    return profile 
      ? E.right(profile)
      : E.left(`Profile '${profileName}' not found`);
  }

  /**
   * Create a custom profile by merging existing profile with overrides
   */
  static createCustomProfile(
    baseName: string,
    overrides: ParameterProfile,
    customName?: string,
  ): { name: string; profile: ParameterProfile } {
    const baseProfile = ProfileManager.getProfile(baseName);
    if (!baseProfile) {
      throw new Error(`Base profile '${baseName}' not found`);
    }

    const customProfile = { ...baseProfile, ...overrides };
    const name = customName || `${baseName}-custom`;

    return { name, profile: customProfile };
  }

  // Helper functions for pure validation using fp-ts
  private static validateRowLayoutItem = (row: any, index: number): string[] => {
    if (!row || typeof row !== 'object') {
      return [`rowLayout[${index}] must be an object`];
    }
    
    const validationChecks = [
      typeof row.start !== 'number' ? O.some(`rowLayout[${index}].start must be a number`) : O.none,
      (typeof row.length !== 'number' || row.length <= 0) ? O.some(`rowLayout[${index}].length must be a positive number`) : O.none,
      (row.offset !== undefined && typeof row.offset !== 'number') ? O.some(`rowLayout[${index}].offset must be a number if defined`) : O.none,
    ];
    
    return pipe(validationChecks, A.compact);
  };

  private static validateRowLayout = (rowLayout: any): string[] => {
    if (!rowLayout) return [];
    
    if (!Array.isArray(rowLayout) || rowLayout.length === 0) {
      return ['rowLayout must be a non-empty array'];
    }
    
    return pipe(
      rowLayout,
      A.mapWithIndex((index, row) => ProfileManager.validateRowLayoutItem(row, index)),
      A.flatten
    );
  };

  private static validateThumbCluster = (profile: ParameterProfile): string[] => {
    const thumbKeys = profile.thumb?.cluster?.keys;
    const thumbPerKeyRotation = profile.thumb?.perKey?.rotations;
    const thumbPerKeyOffset = profile.thumb?.perKey?.offsets;

    const validationChecks = [
      (thumbKeys !== undefined && thumbKeys < 0) ? O.some('thumb cluster keys must be non-negative') : O.none,
      (thumbPerKeyRotation && thumbKeys && thumbPerKeyRotation.length !== thumbKeys) ? 
        O.some('thumb perKey rotations array length must match thumb cluster keys') : O.none,
      (thumbPerKeyOffset && thumbKeys && thumbPerKeyOffset.length !== thumbKeys) ? 
        O.some('thumb perKey offsets array length must match thumb cluster keys') : O.none,
    ];
    
    return pipe(validationChecks, A.compact);
  };

  private static validateThickness = (profile: ParameterProfile): string[] => {
    const totalThickness = profile.switch?.plate?.totalThickness;
    const plateThickness = profile.switch?.plate?.thickness;
    
    if (totalThickness !== undefined && plateThickness !== undefined && plateThickness >= totalThickness) {
      return ['switch plate thickness must be less than total thickness'];
    }
    
    return [];
  };

  /**
   * Validate a profile configuration using fp-ts Either for comprehensive validation
   */
  static validateProfileWithEither(profile: ParameterProfile): E.Either<string[], ParameterProfile> {
    const validationResults = [
      ProfileManager.validateRowLayoutEither(profile.layout?.matrix?.rowLayout),
      ProfileManager.validateThumbClusterEither(profile),
      ProfileManager.validateThicknessEither(profile),
    ];

    return pipe(
      validationResults,
      A.sequence(E.Applicative),
      E.map(() => profile),
      E.mapLeft(A.flatten)
    );
  }

  /**
   * Enhanced validation functions returning Either
   */
  private static validateRowLayoutEither = (rowLayout: any): E.Either<string[], void> => {
    if (!rowLayout) return E.right(undefined);
    
    if (!Array.isArray(rowLayout) || rowLayout.length === 0) {
      return E.left(['rowLayout must be a non-empty array']);
    }
    
    const rowValidations = pipe(
      rowLayout,
      A.mapWithIndex((index, row) => 
        ProfileManager.validateRowLayoutItemEither(row, index)
      )
    );
    
    return pipe(
      rowValidations,
      A.sequence(E.Applicative),
      E.map(() => undefined)
    );
  };

  private static validateRowLayoutItemEither = (row: any, index: number): E.Either<string[], void> => {
    if (!row || typeof row !== 'object') {
      return E.left([`rowLayout[${index}] must be an object`]);
    }
    
    const validationChecks = [
      typeof row.start !== 'number' ? E.left([`rowLayout[${index}].start must be a number`]) : E.right(undefined),
      (typeof row.length !== 'number' || row.length <= 0) ? E.left([`rowLayout[${index}].length must be a positive number`]) : E.right(undefined),
      (row.offset !== undefined && typeof row.offset !== 'number') ? E.left([`rowLayout[${index}].offset must be a number if defined`]) : E.right(undefined),
    ];
    
    return pipe(
      validationChecks,
      A.sequence(E.Applicative),
      E.map(() => undefined)
    );
  };

  private static validateThumbClusterEither = (profile: ParameterProfile): E.Either<string[], void> => {
    const thumbKeys = profile.thumb?.cluster?.keys;
    const thumbPerKeyRotation = profile.thumb?.perKey?.rotations;
    const thumbPerKeyOffset = profile.thumb?.perKey?.offsets;

    const validationChecks = [
      (thumbKeys !== undefined && thumbKeys < 0) ? E.left(['thumb cluster keys must be non-negative']) : E.right(undefined),
      (thumbPerKeyRotation && thumbKeys && thumbPerKeyRotation.length !== thumbKeys) ? 
        E.left(['thumb perKey rotations array length must match thumb cluster keys']) : E.right(undefined),
      (thumbPerKeyOffset && thumbKeys && thumbPerKeyOffset.length !== thumbKeys) ? 
        E.left(['thumb perKey offsets array length must match thumb cluster keys']) : E.right(undefined),
    ];
    
    return pipe(
      validationChecks,
      A.sequence(E.Applicative),
      E.map(() => undefined)
    );
  };

  private static validateThicknessEither = (profile: ParameterProfile): E.Either<string[], void> => {
    const totalThickness = profile.switch?.plate?.totalThickness;
    const plateThickness = profile.switch?.plate?.thickness;
    
    if (totalThickness !== undefined && plateThickness !== undefined && plateThickness >= totalThickness) {
      return E.left(['switch plate thickness must be less than total thickness']);
    }
    
    return E.right(undefined);
  };

  /**
   * Original validation function for backward compatibility
   */
  static validateProfile(profile: ParameterProfile): { valid: boolean; errors: string[] } {
    return pipe(
      ProfileManager.validateProfileWithEither(profile),
      E.fold(
        (errors) => ({ valid: false, errors }),
        () => ({ valid: true, errors: [] })
      )
    );
  }
}
