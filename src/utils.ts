/**
 * Utility functions shared across the keyboard generation system
 */

import { type Point2D } from './config.js';

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Checks if a value is a plain object (not an array, date, etc.)
 */
export function isPlainObject(value: any): value is Record<string, any> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  
  // Check if it's a plain object (not an array, Date, etc.)
  return value.constructor === Object || value.constructor === undefined;
}

/**
 * Deep merge utility for nested objects with proper type handling
 * Handles arrays, primitives, and nested objects correctly
 */
export function deepMerge<T extends Record<string, any>>(base: T, override: any): T {
  // If override is null, undefined, or not an object, return base
  if (!override || typeof override !== 'object') {
    return base;
  }
  
  // If base is null, undefined, or not an object, return override
  if (!base || typeof base !== 'object') {
    return override as T;
  }
  
  // Create a shallow copy of the base to avoid mutation
  const result = { ...base };
  
  // Iterate through all keys in the override object
  for (const key in override) {
    if (!override.hasOwnProperty(key)) continue;
    
    const baseValue = result[key as keyof T];
    const overrideValue = override[key];
    
    // If override value is undefined, skip it
    if (overrideValue === undefined) {
      continue;
    }
    
    // If override value is null, set it directly
    if (overrideValue === null) {
      result[key as keyof T] = overrideValue;
      continue;
    }
    
    // If both values are plain objects, recursively merge them
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key as keyof T] = deepMerge(baseValue, overrideValue);
    } 
    // For arrays, primitives, or any other types, override completely
    else {
      result[key as keyof T] = overrideValue;
    }
  }
  
  return result;
}

// ============================================================================
// Mathematical Utilities
// ============================================================================

/**
 * Converts degrees to radians
 */
export const convertDegreesToRadians = (degrees: number) => (Math.PI * degrees) / 180;

/**
 * Calculates the absolute value of cosine plus sine for rotation extent calculations
 */
export const calculateAbsoluteCosineSine = (angle: number) => Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle));

/**
 * Calculates the half index for centering calculations
 */
export const calculateHalfIndex = (n: number) => (n - 1) / 2;

/**
 * Rotates a point around a pivot by the specified degrees
 */
export function rotatePoint(point: Point2D, pivot: Point2D, degrees: number): Point2D {
  if (!degrees) return point;
  
  const radians = convertDegreesToRadians(degrees);
  const cosValue = Math.cos(radians);
  const sinValue = Math.sin(radians);
  const deltaX = point.x - pivot.x;
  const deltaY = point.y - pivot.y;
  
  return {
    x: pivot.x + cosValue * deltaX - sinValue * deltaY,
    y: pivot.y + sinValue * deltaX + cosValue * deltaY
  };
}