import { METHOD, CONTENT_TYPE } from './consts';

export type Body = BodyInit | null | Record<string, unknown> | unknown[];

export interface ServiceOptions
  extends Omit<Omit<RequestInit, 'body'>, 'headers'> {
  method?: METHOD;
  contentType?: CONTENT_TYPE | false;
  headers?: Record<string, string | (() => string)>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Body;
}

export interface ServiceDefinition extends ServiceOptions {
  route: string;
}

export type ServiceDefinitions = Record<string, ServiceDefinition>;

export type Result = unknown | unknown[];

export type Service = (options?: ServiceOptions) => Promise<Result>;

export interface Services extends Service, Record<string, Services> {}

export interface FetcheryError extends Error {
  status: number;
  details: string;
}
