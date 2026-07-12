import type { DateInput, NumericInput } from './types';

/**
 * Safely converts a DB numeric string, a JS number, or a nullish value into a finite number.
 * Falls back to `fallback` (default `0`) for `null`, `undefined`, empty strings, or values that
 * don't parse to a finite number.
 */
export function toFiniteNumber(value: NumericInput, fallback = 0): number {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}
	const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Same as {@link toFiniteNumber}, but returns `null` instead of a fallback so callers can
 * distinguish "value is genuinely zero" from "value is missing/unparsable".
 */
export function toNullableNumber(value: NumericInput): number | null {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

/** Normalizes a `Date`, an ISO string, or a nullish value into a `Date`, or `null` if unparsable. */
export function toNullableDate(value: DateInput): Date | null {
	if (value === null || value === undefined) {
		return null;
	}
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Rounds to a fixed number of decimal places, guarding against binary floating point drift. */
export function round(value: number, decimals: number): number {
	if (!Number.isFinite(value)) {
		return value;
	}
	const factor = 10 ** decimals;
	return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Divides two numbers, returning `fallback` (default `0`) instead of `NaN`/`Infinity` when `denominator` is 0. */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
	if (denominator === 0 || !Number.isFinite(denominator)) {
		return fallback;
	}
	return numerator / denominator;
}

export function sum(values: readonly number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

/** Arithmetic mean of `values`, or `fallback` (default `0`) when the array is empty. */
export function average(values: readonly number[], fallback = 0): number {
	if (values.length === 0) {
		return fallback;
	}
	return sum(values) / values.length;
}

export function max(values: readonly number[], fallback = 0): number {
	return values.length === 0 ? fallback : Math.max(...values);
}

export function min(values: readonly number[], fallback = 0): number {
	return values.length === 0 ? fallback : Math.min(...values);
}
