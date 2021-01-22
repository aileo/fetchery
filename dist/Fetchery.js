"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const consts_1 = require("./consts");
const processData = require("./data");
function solveParams(route, params = {}) {
    return Object.keys(params).reduce((url, param) => {
        return url.replace(new RegExp(`:${param}\\b`, 'g'), escape(processData.sanitize(params[param])));
    }, route);
}
class Fetcher extends events_1.EventEmitter {
    constructor(baseUrl, defaults = {}) {
        super();
        this._services = {};
        this._baseUrl = baseUrl;
        this._defaults = {
            method: consts_1.METHOD.GET,
            ...defaults,
        };
    }
    processPath(path, check = false) {
        const _path = Array.isArray(path) ? path.join('.') : path;
        if (check && !this._services[_path]) {
            throw new Error(`Service "${_path}" not found`);
        }
        return _path;
    }
    merge(definition, options) {
        const { contentType: defaultsContentType, headers: defaultsHeaders = {}, ...defaults } = this._defaults;
        const { contentType: definitionContentType, headers: definitionHeaders = {}, route, ..._definition } = definition;
        const { contentType: optionsContentType, headers: optionsHeaders = {}, ..._options } = options;
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
            if (value !== undefined)
                return value;
            return keep;
        }, defaultsHeaders['Content-Type']);
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        return { ...defaults, ..._definition, ..._options, headers, route };
    }
    addService(path, definition) {
        const _path = this.processPath(path);
        if (this._services[_path]) {
            throw new Error(`Service "${_path}" already exists`);
        }
        this._services[_path] = definition;
    }
    getService(path) {
        const _path = this.processPath(path, true);
        const request = this.request.bind(this);
        return function (options) {
            return request(_path, options);
        };
    }
    getServices() {
        return Object.keys(this._services)
            .sort()
            .reduce((services, path) => {
            const _path = path.split('.');
            const name = _path.pop();
            let handler = services;
            for (const part of _path) {
                handler[part] = handler[part] || {};
                handler = handler[part];
            }
            handler[name] = this.getService(path);
            return services;
        }, {});
    }
    async request(path, options) {
        var _a;
        const { route, cast, params = {}, query, body, ...init } = this.merge(this._services[this.processPath(path, true)], options);
        let response;
        const url = new URL(solveParams(route, params), this._baseUrl || ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.origin));
        if (query) {
            url.search = processData.query(query);
        }
        try {
            response = await fetch(url.toString(), {
                ...init,
                body: processData.body(cast, body),
            });
        }
        catch (error) {
            this.emit('error', { path, error, options });
            throw error;
        }
        if (!response.ok) {
            const error = new Error(response.statusText);
            error.status = response.status;
            error.details = await response.text();
            throw error;
        }
        let data = undefined;
        try {
            data = response.json();
        }
        catch (error) {
            this.emit('error', { path, error, options });
            throw error;
        }
        this.emit('data', { path, data, options });
        return data;
    }
}
exports.default = Fetcher;
//# sourceMappingURL=Fetchery.js.map