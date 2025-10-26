import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import type { Predicate } from 'fp-ts/Predicate';
import { circle, hull } from 'scad-js';
import type { Point2D } from './interfaces.js';

const isPlainObject: Predicate<unknown> = (value: unknown): value is Record<string, unknown> =>
  pipe(
    value,
    O.fromNullable,
    O.filter((v): v is object => typeof v === 'object'),
    O.map((v) => v.constructor === Object || v.constructor === undefined),
    O.getOrElse(() => false),
  );

export const deepMerge = <T extends Record<string, unknown>>(
  base: T,
  override: Partial<T> | null | undefined,
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
          deepMerge(baseValue as Record<string, unknown>, overrideValue as Partial<Record<string, unknown>>),
          E.map((merged) => [key, merged] as const),
        );
      }

      return E.right([key, overrideValue] as const);
    }),
    E.map((entries) => {
      const result = { ...base };
      for (const [key, value] of entries) {
        if (value !== undefined) {
          result[key as keyof T] = value as T[keyof T];
        }
      }
      return result;
    }),
  );
};

export const convertDegreesToRadians = (degrees: number): number => (Math.PI * degrees) / 180;

export const calculateAbsoluteCosineSine = (angle: number): number =>
  Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle));

export const calculateHalfIndex = (n: number): number => (n - 1) / 2;

export const rotatePoint = (point: Point2D, pivot: Point2D, degrees: number): Point2D =>
  pipe(
    degrees,
    O.fromPredicate((deg) => deg !== 0),
    O.fold(
      () => point,
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
      },
    ),
  );

type RoundedSquareParams = {
  width: number;
  height: number;
  cornerRadius?: number;
};

const validateRoundedSquareParams = (params: RoundedSquareParams): E.Either<string, Required<RoundedSquareParams>> => {
  const { width, height, cornerRadius = 1 } = params;

  if (width <= 0) return E.left('Width must be positive');
  if (height <= 0) return E.left('Height must be positive');
  if (cornerRadius < 0) return E.left('Corner radius must be non-negative');
  if (cornerRadius * 2 > width) return E.left('Corner radius too large for width');
  if (cornerRadius * 2 > height) return E.left('Corner radius too large for height');

  return E.right({ width, height, cornerRadius });
};

export const createRoundedSquare = (width: number, height: number, cornerRadius: number = 0.5) =>
  pipe(
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
      console.warn(`createRoundedSquare validation error: ${error}`);
      return circle(Math.min(width, height) / 2);
    }),
  );
