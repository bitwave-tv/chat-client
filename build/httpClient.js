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
var $post = function (url, path, data, cb) {
    if (isNode) {
        Promise.resolve().then(function () { return require('https'); }).then(function (https) {
            Promise.resolve().then(function () { return require('querystring'); }).then(function (querystring) {
                var _data = JSON.stringify(data);
                var options = {
                    hostname: url,
                    port: 443,
                    path: path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': _data.length
                    }
                };
                var req = https.request(options, function (res) {
                    res.on('data', cb);
                });
                req.on('error', cb);
                req.write(_data);
                req.end();
            });
        });
    }
    else {
        var req_2 = new XMLHttpRequest();
        req_2.onreadystatechange = function () {
            if (req_2.readyState === 4 && req_2.status === 200) {
                cb(JSON.parse(req_2.responseText));
            }
        };
        req_2.open('POST', url + path);
        req_2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req_2.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        req_2.send(JSON.stringify(data));
    }
};
exports.default = {
    get: function (url) {
        return new Promise(function (resolve) {
            $get(url, function (response) { return resolve(response); });
        });
    },
    post: function (url, path, data) {
        return new Promise(function (resolve) {
            $post(url, path, data, function (response) { return resolve(response); });
        });
    }
};
//# sourceMappingURL=httpClient.js.map