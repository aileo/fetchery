import { Body } from './types';
export declare function sanitize(value: unknown): string;
export declare function query(data: Record<string, unknown>): string;
export declare function body(contentType?: string, data?: Body): BodyInit | null | undefined;
