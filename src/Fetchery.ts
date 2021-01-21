import { EventEmitter } from 'events';

import { METHOD } from './consts';
import {
  IOptions,
  IDefinition,
  Definitions,
  Result,
  Service,
  Services,
} from './types';

import * as processData from './data';

function solveParams(
  route: string,
  params: Record<string, unknown> = {}
): string {
  return Object.keys(params).reduce((url, param) => {
    return url.replace(
      new RegExp(`:${param}\\b`, 'g'),
      escape(processData.sanitize(params[param]))
    );
  }, route);
}

export default class Fetcher extends EventEmitter {
  private _baseUrl: string;
  private _defaults: IOptions;

  private _services: Definitions = {};

  constructor(baseUrl: string, defaults: IOptions = {}) {
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

  private merge(definition: IDefinition, options: IOptions): IDefinition {
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

  public addService(path: string | string[], definition: IDefinition): void {
    const _path = this.processPath(path);
    if (this._services[_path]) {
      throw new Error(`Service "${_path}" already exists`);
    }
    this._services[_path] = definition;
  }

  public getService(path: string | string[]): Service {
    const _path = this.processPath(path, true);
    const request = this.request.bind(this);
    return function (options) {
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
          handler[part] = handler[part] || {};
          handler = handler[part];
        }

        handler[name] = this.getService(path) as Services;

        return services;
      }, {} as Services);
  }

  public async request(
    path: string | string[],
    options: IOptions
  ): Promise<Result> {
    const { route, cast, params = {}, query, body, ...init } = this.merge(
      this._services[this.processPath(path, true)],
      options
    );
    let response;

    const url: URL = new URL(solveParams(route, params), this._baseUrl);
    if (query) {
      url.search = processData.query(query);
    }

    try {
      response = await fetch(url.toString(), {
        ...init,
        body: processData.body(cast, body),
      });
    } catch (error) {
      this.emit('error', { path, error, options });
      throw error;
    }

    let data = undefined;

    try {
      data = response.json();
    } catch (error) {
      this.emit('error', { path, error, options });
      throw error;
    }

    this.emit('data', { path, data, options });
    return data;
  }
}
