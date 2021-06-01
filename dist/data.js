"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.body = exports.query = exports.sanitize = void 0;
const consts_1 = require("./consts");
function sanitize(value) {
    const _value = typeof value === 'function' ? value() : value;
    if (typeof _value === 'string')
        return _value;
    return JSON.stringify(_value);
}
exports.sanitize = sanitize;
function toRecords(data) {
    const obj = {};
    //@ts-ignore: entries does not exists on FormData/URLSearchParams
    for (const [key, value] of data.entries()) {
        obj[key] = value;
    }
    return obj;
}
function toDataObject(data, Constructor) {
    if (data instanceof Constructor)
        return data;
    if (Array.isArray(data)) {
        throw new Error(`Can not convert to ${Constructor.name}`);
    }
    const _data = data instanceof FormData || data instanceof URLSearchParams
        ? toRecords(data)
        : data;
    const obj = new Constructor(typeof _data === 'string' ? _data : undefined);
    if (typeof _data !== 'string') {
        Object.keys(_data).forEach((key) => {
            if (Array.isArray(_data[key])) {
                _data[key].forEach((value) => {
                    obj.append(key, sanitize(value));
                });
            }
            else if (_data[key] instanceof File) {
                obj.append(key, _data[key]);
            }
            else {
                obj.append(key, sanitize(_data[key]));
            }
        });
    }
    return obj;
}
function toJson(data) {
    let _data;
    if (typeof data === 'string') {
        try {
            JSON.parse(data);
            return data;
        }
        catch (e) {
            _data = data;
        }
    }
    else if (data instanceof URLSearchParams || data instanceof FormData) {
        _data = toRecords(data);
    }
    else if (Array.isArray(data)) {
        _data = data;
    }
    else if (typeof data === 'function') {
        _data = data();
    }
    else {
        _data = Object.assign({}, data);
    }
    return JSON.stringify(_data);
}
function query(data) {
    return toDataObject(data, URLSearchParams).toString();
}
exports.query = query;
function body(contentType, data) {
    if (data === undefined)
        return undefined;
    if (data === null)
        return null;
    if (contentType === undefined ||
        data instanceof Blob ||
        data instanceof ArrayBuffer ||
        data instanceof ReadableStream) {
        return data;
    }
    if (contentType === consts_1.CONTENT_TYPE.JSON)
        return toJson(data);
    if (contentType === consts_1.CONTENT_TYPE.URLENCODED) {
        return toDataObject(data, URLSearchParams);
    }
    if (contentType === consts_1.CONTENT_TYPE.MULTIPART_FORMDATA) {
        return toDataObject(data, FormData);
    }
    return data;
}
exports.body = body;
//# sourceMappingURL=data.js.map