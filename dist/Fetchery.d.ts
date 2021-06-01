/// <reference types="node" />
import { EventEmitter } from 'events';
import { Options, Definition, Result, Service, Services } from './types';
export declare class Client extends EventEmitter {
    private _baseUrl;
    private _defaults;
    private _services;
    constructor(baseUrl: string, defaults?: Options);
    private processPath;
    private merge;
    addService(path: string | string[], definition: Definition): void;
    getService(path: string | string[]): Service;
    getServices(): Services;
    request(path: string | string[], options?: Options): Promise<Result>;
}
