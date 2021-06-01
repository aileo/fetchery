"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_TYPE = exports.METHOD = void 0;
var METHOD;
(function (METHOD) {
    METHOD["GET"] = "GET";
    METHOD["POST"] = "POST";
    METHOD["PUT"] = "PUT";
    METHOD["DELETE"] = "DELETE";
    METHOD["HEAD"] = "HEAD";
})(METHOD = exports.METHOD || (exports.METHOD = {}));
var CONTENT_TYPE;
(function (CONTENT_TYPE) {
    CONTENT_TYPE["TEXT"] = "plain/text";
    CONTENT_TYPE["CSV"] = "text/csv";
    CONTENT_TYPE["JSON"] = "application/json";
    CONTENT_TYPE["URLENCODED"] = "application/x-www-form-urlencoded";
    CONTENT_TYPE["BINARY"] = "application/octet-stream";
    CONTENT_TYPE["MULTIPART_FORMDATA"] = "multipart/form-data";
})(CONTENT_TYPE = exports.CONTENT_TYPE || (exports.CONTENT_TYPE = {}));
//# sourceMappingURL=consts.js.map