import { METHOD, CONTENT_TYPE, CAST } from './consts';
export declare type Body = BodyInit | null | Record<string, unknown> | unknown[];
export interface IOptions extends Omit<RequestInit, 'body'> {
    method?: METHOD;
    contentType?: CONTENT_TYPE | false;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Body;
    cast?: CAST;
}
export interface IDefinition extends IOptions {
    route: string;
}
export declare type Definitions = Record<string, IDefinition>;
export declare type Result = unknown | unknown[];
export declare type Service = (options: IOptions) => Promise<Result>;
export interface IService extends Service, Record<string, IService> {
}
export declare type Services = IService;
export interface IError extends Error {
    status: number;
    details: string;
}
