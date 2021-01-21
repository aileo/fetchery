import { METHOD, CONTENT_TYPE, CAST } from './consts';

export type Body = BodyInit | null | Record<string, unknown> | unknown[];

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

export type Definitions = Record<string, IDefinition>;

export type Result = unknown | unknown[];

export type Service = (options: IOptions) => Promise<Result>;

export interface IService extends Service, Record<string, IService> {}

export type Services = IService;
