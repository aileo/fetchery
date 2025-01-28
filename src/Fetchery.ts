import { EventEmitter } from 'events';

import { METHOD } from './consts';
import {
  Options,
  Definition,
  Result,
  Service,
  Services,
  FetcheryError,
  ParamSolver,
} from './types';

import * as processData from './data';

const defaultParamSolver: ParamSolver = (url, param, value) => {
  return url.replace(new RegExp(`:${param}\\b`, 'g'), value);
};

function solveParams(
  route: string,
  params: Record<string, unknown> = {},
  solver: ParamSolver = defaultParamSolver
): string {
  return Object.keys(params).reduce((url, param) => {
    return solver(url, param, escape(processData.sanitize(params[param])));
  }, route);
}

function resolveHeaders(
  headers: Record<string, string | (() => string)>
): Record<string, string> {
  return Object.keys(headers).reduce((resolvedHeaders, header) => {
    const value = headers[header];
    if (typeof value === 'function') {
      resolvedHeaders[header] = value();
    } else {
      resolvedHeaders[header] = value;
    }
    return resolvedHeaders;
  }, {} as Record<string, string>);
}

export class Client extends EventEmitter {
  private _baseUrl: string;
  private _defaults: Options;

  private _services: Record<string, Definition> = {};

  constructor(baseUrl: string, defaults: Options = {}) {
    super();
    this._baseUrl = baseUrl;
    this._defaults = {
      method: METHOD.GET,
      ...defaults,
    };
  }

  private processPath(path: string | string[], check = false) {
    const _path = Array.isArray(path) ? path.join('.') : path;
    if (check && !this._services[_path]) {
      throw new Error(`Service "${_path}" not found`);
    }
    return _path;
  }

  private merge(definition: Definition, options: Options): Definition {
    const {
      contentType: defaultsContentType,
      headers: defaultsHeaders = {},
      ...defaults
    } = this._defaults;

    const {
      contentType: definitionContentType,
      headers: definitionHeaders = {},
      route,
      ..._definition
    } = definition;

    const {
      contentType: optionsContentType,
      headers: optionsHeaders = {},
      ..._options
    } = options;

    const headers = {
      ...defaultsHeaders,
      ...definitionHeaders,
      ...optionsHeaders,
    };

    const contentType = [
      defaultsContentType,
      definitionHeaders['Content-Type'],
      definitionContentType,
      optionsHeaders['Content-Type'],
      optionsContentType,
    ].reduce((keep, value) => {
      if (value !== undefined) return value;
      return keep;
    }, defaultsHeaders['Content-Type']);

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    return { ...defaults, ..._definition, ..._options, headers, route };
  }

  public addService(path: string | string[], definition: Definition): void {
    const _path = this.processPath(path);
    if (this._services[_path]) {
      throw new Error(`Service "${_path}" already exists`);
    }
    this._services[_path] = definition;
  }

  public getService(path: string | string[]): Service {
    const _path = this.processPath(path, true);
    const request = this.request.bind(this);
    return function (options = {}) {
      return request(_path, options);
    };
  }

  public getServices(): Services {
    return Object.keys(this._services)
      .sort()
      .reduce((services: Services, path: string) => {
        const _path = path.split('.');
        const name = _path.pop() as string;

        let handler = services;
        for (const part of _path) {
          handler[part] = handler[part] || ({} as Services);
          handler = handler[part];
        }

        handler[name] = this.getService(path) as Services;

        return services;
      }, {} as Services);
  }

  public async request(
    path: string | string[],
    options: Options = {}
  ): Promise<Result> {
    const {
      route,
      params = {},
      query,
      body,
      solver,
      ...init
    } = this.merge(this._services[this.processPath(path, true)], options);
    const headers = resolveHeaders(init.headers || {});
    let response;

    const url: URL = new URL(
      solveParams(route, params, solver),
      this._baseUrl || window?.location?.origin
    );
    if (query) {
      url.search = processData.query(query);
    }

    try {
      response = await fetch(url.toString(), {
        ...init,
        headers,
        body: processData.body(headers['Content-Type'], body),
      });
    } catch (error) {
      this.emit('error', { path, error, options });
      throw error;
    }

    if (!response.ok) {
      const error = new Error(response.statusText) as FetcheryError;
      error.status = response.status;
      error.details = await response.text();
      throw error;
    }

    let data = await response.text();

    try {
      data = JSON.parse(data);
    } catch (error) {
      this.emit('error', { path, error, options, text: data });
      throw error;
    }

    this.emit('data', { path, data, options });
    return data;
  }
}
