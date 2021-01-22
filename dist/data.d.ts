import { CAST } from './consts';
import { Body } from './types';
export declare function sanitize(value: unknown): string;
export declare function query(data: Record<string, unknown>): string;
export declare function body(cast?: CAST, data?: Body): BodyInit | null | undefined;
