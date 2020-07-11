"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var $get = function (url, cb) {
    https.get(url, function (resp) {
        var data = '';
        // A chunk of data has been received.
        resp.on('data', function (chunk) {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', function () {
            cb(JSON.parse(data));
        });
    });
};
exports.default = {
    get: function (url) {
        return new Promise(function (resolve) {
            $get(url, function (response) { return resolve(response); });
        });
    }
};
//# sourceMappingURL=httpClient.js.map