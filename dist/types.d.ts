import { METHOD, CONTENT_TYPE } from './consts';
export declare type Body = BodyInit | null | Record<string, unknown> | unknown[];
export interface Options extends Omit<RequestInit, 'body' | 'headers'> {
    method?: METHOD;
    contentType?: CONTENT_TYPE | false;
    headers?: Record<string, string | (() => string)>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Body;
}
export interface Definition extends Options {
    route: string;
}
export declare type Result = unknown | unknown[];
export declare type Service = (options?: Options) => Promise<Result>;
export interface Services extends Service, Record<string, Services> {
}
export interface FetcheryError extends Error {
    status: number;
    details: string;
}
