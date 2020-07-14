"use strict";
/**
 * Represents a logger
 * @constructor
 * @param {string} prefix - logger prefix
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    /** Creates new logger */
    function default_1(prefix) {
        this.prefix = prefix !== null && prefix !== void 0 ? prefix : '[bitwave.tv API]';
    }
    /** Creates logger info */
    default_1.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArrays([this.prefix + message], args));
    };
    /** Creates logger warn */
    default_1.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArrays([this.prefix + '[WARN] ' + message], args));
    };
    /** Creates logger error */
    default_1.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.error.apply(console, __spreadArrays([this.prefix + '[ERROR] ' + message], args));
    };
    return default_1;
}());
exports.default = default_1;
//# sourceMappingURL=log.js.map