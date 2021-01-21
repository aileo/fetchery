"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var events_1 = require("events");
var consts_1 = require("./consts");
var processData = require("./data");
function solveParams(route, params) {
    if (params === void 0) { params = {}; }
    return Object.keys(params).reduce(function (url, param) {
        return url.replace(new RegExp(":" + param + "\\b", 'g'), escape(processData.sanitize(params[param])));
    }, route);
}
var Fetcher = /** @class */ (function (_super) {
    __extends(Fetcher, _super);
    function Fetcher(baseUrl, defaults) {
        if (defaults === void 0) { defaults = {}; }
        var _this = _super.call(this) || this;
        _this._services = {};
        _this._baseUrl = baseUrl;
        _this._defaults = __assign({ method: consts_1.METHOD.GET }, defaults);
        return _this;
    }
    Fetcher.prototype.processPath = function (path, check) {
        if (check === void 0) { check = false; }
        var _path = Array.isArray(path) ? path.join('.') : path;
        if (check && !this._services[_path]) {
            throw new Error("Service \"" + _path + "\" not found");
        }
        return _path;
    };
    Fetcher.prototype.merge = function (definition, options) {
        var _a = this._defaults, defaultsContentType = _a.contentType, _b = _a.headers, defaultsHeaders = _b === void 0 ? {} : _b, defaults = __rest(_a, ["contentType", "headers"]);
        var definitionContentType = definition.contentType, _c = definition.headers, definitionHeaders = _c === void 0 ? {} : _c, route = definition.route, _definition = __rest(definition, ["contentType", "headers", "route"]);
        var optionsContentType = options.contentType, _d = options.headers, optionsHeaders = _d === void 0 ? {} : _d, _options = __rest(options, ["contentType", "headers"]);
        var headers = __assign(__assign(__assign({}, defaultsHeaders), definitionHeaders), optionsHeaders);
        var contentType = [
            defaultsContentType,
            definitionHeaders['Content-Type'],
            definitionContentType,
            optionsHeaders['Content-Type'],
            optionsContentType,
        ].reduce(function (keep, value) {
            if (value !== undefined)
                return value;
            return keep;
        }, defaultsHeaders['Content-Type']);
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        return __assign(__assign(__assign(__assign({}, defaults), _definition), _options), { headers: headers, route: route });
    };
    Fetcher.prototype.addService = function (path, definition) {
        var _path = this.processPath(path);
        if (this._services[_path]) {
            throw new Error("Service \"" + _path + "\" already exists");
        }
        this._services[_path] = definition;
    };
    Fetcher.prototype.getService = function (path) {
        var _path = this.processPath(path, true);
        var request = this.request.bind(this);
        return function (options) {
            return request(_path, options);
        };
    };
    Fetcher.prototype.getServices = function () {
        var _this = this;
        return Object.keys(this._services)
            .sort()
            .reduce(function (services, path) {
            var _path = path.split('.');
            var name = _path.pop();
            var handler = services;
            for (var _i = 0, _path_1 = _path; _i < _path_1.length; _i++) {
                var part = _path_1[_i];
                handler[part] = handler[part] || {};
                handler = handler[part];
            }
            handler[name] = _this.getService(path);
            return services;
        }, {});
    };
    Fetcher.prototype.request = function (path, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, route, cast, _c, params, query, body, init, response, url, error_1, error, _d, data;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _b = this.merge(this._services[this.processPath(path, true)], options), route = _b.route, cast = _b.cast, _c = _b.params, params = _c === void 0 ? {} : _c, query = _b.query, body = _b.body, init = __rest(_b, ["route", "cast", "params", "query", "body"]);
                        url = new URL(solveParams(route, params), this._baseUrl || ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.origin));
                        if (query) {
                            url.search = processData.query(query);
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url.toString(), __assign(__assign({}, init), { body: processData.body(cast, body) }))];
                    case 2:
                        response = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        this.emit('error', { path: path, error: error_1, options: options });
                        throw error_1;
                    case 4:
                        if (!!response.ok) return [3 /*break*/, 6];
                        error = new Error(response.statusText);
                        error.status = response.status;
                        _d = error;
                        return [4 /*yield*/, response.text()];
                    case 5:
                        _d.details = _e.sent();
                        throw error;
                    case 6:
                        data = undefined;
                        try {
                            data = response.json();
                        }
                        catch (error) {
                            this.emit('error', { path: path, error: error, options: options });
                            throw error;
                        }
                        this.emit('data', { path: path, data: data, options: options });
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return Fetcher;
}(events_1.EventEmitter));
exports["default"] = Fetcher;
