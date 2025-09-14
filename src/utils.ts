import type { Point2D } from './interfaces.js';
import { hull, circle } from 'scad-js';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as R from 'fp-ts/Record';
import { pipe, flow } from 'fp-ts/function';
import { Predicate } from 'fp-ts/Predicate';

// Enhanced with fp-ts patterns
export const isPlainObject: Predicate<unknown> = (value: unknown): value is Record<string, any> => 
  pipe(
    value,
    O.fromNullable,
    O.filter((v): v is object => typeof v === 'object'),
    O.map(v => v.constructor === Object || v.constructor === undefined),
    O.getOrElse(() => false)
  );

// Alternative using Either for better error information
export const validatePlainObject = (value: unknown): E.Either<string, Record<string, any>> => {
  if (value === null) {
    return E.left('Value is null');
  }
  if (typeof value !== 'object') {
    return E.left(`Expected object, got ${typeof value}`);
  }
  if (value.constructor !== Object && value.constructor !== undefined) {
    return E.left('Value is not a plain object');
  }
  return E.right(value as Record<string, any>);
};

// Enhanced deepMerge with fp-ts Either for error handling
export const deepMerge = <T extends Record<string, any>>(
  base: T, 
  override: Partial<T> | null | undefined
): E.Either<string, T> => {
  if (!override || typeof override !== 'object') {
    return E.right(base);
  }

  if (!base || typeof base !== 'object') {
    return E.right(override as T);
  }

  return pipe(
    Object.entries(override),
    A.filter(([key]) => Object.hasOwn(override, key)),
    A.traverse(E.Applicative)(([key, overrideValue]) => {
      if (overrideValue === undefined) {
        return E.right([key, undefined] as const);
      }
      
      if (overrideValue === null) {
        return E.right([key, null] as const);
      }
      
      const baseValue = base[key as keyof T];
      
      if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
        return pipe(
          deepMerge(baseValue, overrideValue),
          E.map(merged => [key, merged] as const)
        );
      }
      
      return E.right([key, overrideValue] as const);
    }),
    E.map(entries => 
      pipe(
        entries.filter(([, value]) => value !== undefined),
        A.reduce({ ...base }, (result, [key, value]) => ({
          ...result,
          [key]: value
        }))
      )
    )
  );
};

// Unsafe version for backward compatibility
export const deepMergeUnsafe = <T extends Record<string, any>>(
  base: T, 
  override: Partial<T> | null | undefined
): T => pipe(
  deepMerge(base, override),
  E.getOrElse(() => base)
);

// Enhanced math utilities with fp-ts validation
export const convertDegreesToRadians = (degrees: number): number => (Math.PI * degrees) / 180;

export const convertDegreesToRadiansSafe = (degrees: number): E.Either<string, number> =>
  pipe(
    degrees,
    E.fromPredicate(
      (deg): deg is number => typeof deg === 'number' && !isNaN(deg),
      () => `Invalid degrees: ${degrees}`
    ),
    E.map(deg => (Math.PI * deg) / 180)
  );

export const calculateAbsoluteCosineSine = (angle: number): number => 
  Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle));

export const calculateAbsoluteCosineSineSafe = (angle: number): E.Either<string, number> =>
  pipe(
    angle,
    E.fromPredicate(
      (a): a is number => typeof a === 'number' && !isNaN(a),
      () => `Invalid angle: ${angle}`
    ),
    E.map(a => Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)))
  );

export const calculateHalfIndex = (n: number): number => (n - 1) / 2;

export const calculateHalfIndexSafe = (n: number): E.Either<string, number> =>
  pipe(
    n,
    E.fromPredicate(
      (num): num is number => typeof num === 'number' && !isNaN(num) && num >= 0,
      () => `Invalid count: ${n}`
    ),
    E.map(num => (num - 1) / 2)
  );

// Additional fp-ts utility functions
export const clamp = (min: number, max: number) => (value: number): number =>
  Math.min(Math.max(value, min), max);

export const clampSafe = (min: number, max: number) => (value: number): E.Either<string, number> => {
  if (min > max) {
    return E.left(`Invalid range: min (${min}) > max (${max})`);
  }
  if (typeof value !== 'number' || isNaN(value)) {
    return E.left(`Invalid value: ${value}`);
  }
  return E.right(clamp(min, max)(value));
};

// Range utilities with fp-ts
export const range = (start: number, end: number): E.Either<string, number[]> => {
  if (start > end) {
    return E.left(`Invalid range: start (${start}) > end (${end})`);
  }
  return E.right(
    pipe(
      A.makeBy(end - start, i => start + i)
    )
  );
};

export const rangeUnsafe = (start: number, end: number): number[] =>
  pipe(
    range(start, end),
    E.getOrElse(() => [])
  );

// Enhanced rotatePoint with fp-ts Option and validation
const validatePoint = (point: Point2D): E.Either<string, Point2D> => {
  if (typeof point.x !== 'number' || isNaN(point.x)) {
    return E.left(`Invalid x coordinate: ${point.x}`);
  }
  if (typeof point.y !== 'number' || isNaN(point.y)) {
    return E.left(`Invalid y coordinate: ${point.y}`);
  }
  return E.right(point);
};

const validateRotation = (degrees: number): E.Either<string, number> => {
  if (typeof degrees !== 'number' || isNaN(degrees)) {
    return E.left(`Invalid rotation: ${degrees}`);
  }
  return E.right(degrees);
};

export const rotatePoint = (point: Point2D, pivot: Point2D, degrees: number): Point2D => 
  pipe(
    degrees,
    O.fromPredicate(deg => deg !== 0),
    O.fold(
      () => point, // No rotation needed
      (deg) => {
        const radians = convertDegreesToRadians(deg);
        const cosValue = Math.cos(radians);
        const sinValue = Math.sin(radians);
        const deltaX = point.x - pivot.x;
        const deltaY = point.y - pivot.y;

        return {
          x: pivot.x + cosValue * deltaX - sinValue * deltaY,
          y: pivot.y + sinValue * deltaX + cosValue * deltaY,
        };
      }
    )
  );

// Safe version with validation
export const rotatePointSafe = (
  point: Point2D, 
  pivot: Point2D, 
  degrees: number
): E.Either<string, Point2D> => {
  return pipe(
    E.Do,
    E.bind('validPoint', () => validatePoint(point)),
    E.bind('validPivot', () => validatePoint(pivot)),
    E.bind('validRotation', () => validateRotation(degrees)),
    E.map(({ validPoint, validPivot, validRotation }) => 
      rotatePoint(validPoint, validPivot, validRotation)
    )
  );
};

// Enhanced with fp-ts Option for validation
type RoundedSquareParams = {
  width: number;
  height: number;
  cornerRadius?: number;
};

const validateRoundedSquareParams = (params: RoundedSquareParams): E.Either<string, RoundedSquareParams> => {
  const { width, height, cornerRadius = 1 } = params;
  
  if (width <= 0) return E.left('Width must be positive');
  if (height <= 0) return E.left('Height must be positive');
  if (cornerRadius < 0) return E.left('Corner radius must be non-negative');
  if (cornerRadius * 2 > width) return E.left('Corner radius too large for width');
  if (cornerRadius * 2 > height) return E.left('Corner radius too large for height');
  
  return E.right({ width, height, cornerRadius });
};

export const createRoundedSquare = (
  width: number, 
  height: number, 
  cornerRadius: number = 0.00001,
) => pipe(
  validateRoundedSquareParams({ width, height, cornerRadius }),
  E.map(({ width, height, cornerRadius }) => {
    const cornerCircle = circle(cornerRadius);
    const innerWidth = width - 2 * cornerRadius;
    const innerHeight = height - 2 * cornerRadius;
    const halfWidth = innerWidth / 2;
    const halfHeight = innerHeight / 2;

    return hull(
      cornerCircle.translate([halfWidth, halfHeight, 0]),
      cornerCircle.translate([-halfWidth, halfHeight, 0]),
      cornerCircle.translate([halfWidth, -halfHeight, 0]),
      cornerCircle.translate([-halfWidth, -halfHeight, 0]),
    );
  }),
  E.getOrElse((error) => {
    // Fallback for invalid parameters with fp-ts logging
    console.warn(`createRoundedSquare validation error: ${error}`);
    return circle(Math.min(width, height) / 2);
  })
);
