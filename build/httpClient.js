"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNode = typeof process === 'object';
var $get = function (url, cb) {
    if (isNode) {
        Promise.resolve().then(function () { return require('https'); }).then(function (https) {
            https.get(url, function (resp) {
                var data = '';
                // A chunk of data has been received.
                resp.on('data', function (chunk) {
                    data += chunk;
                });
                // The whole response has been received.
                // Print out the result.
                resp.on('end', function () {
                    cb(JSON.parse(data));
                });
            });
        });
    }
    else {
        var req_1 = new XMLHttpRequest();
        req_1.onreadystatechange = function () {
            if (req_1.readyState === 4 && req_1.status === 200) {
                cb(JSON.parse(req_1.responseText));
            }
        };
        req_1.open('GET', url, true);
        req_1.send(null);
    }
};
exports.default = {
    get: function (url) {
        return new Promise(function (resolve) {
            $get(url, function (response) { return resolve(response); });
        });
    }
};
//# sourceMappingURL=httpClient.js.map