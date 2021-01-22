/// <reference types="node" />
import { EventEmitter } from 'events';
import { IOptions, IDefinition, Result, Service, Services } from './types';
export default class Fetcher extends EventEmitter {
    private _baseUrl;
    private _defaults;
    private _services;
    constructor(baseUrl: string, defaults?: IOptions);
    private processPath;
    private merge;
    addService(path: string | string[], definition: IDefinition): void;
    getService(path: string | string[]): Service;
    getServices(): Services;
    request(path: string | string[], options: IOptions): Promise<Result>;
}
