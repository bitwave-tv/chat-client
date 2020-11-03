"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitwaveChat = void 0;
var httpClient_1 = require("./httpClient");
var log_1 = require("./log");
//
// Despite my best attempts to stay standalone, slim (and nodejs-free),
// as socketio docs say:
//
//  - 'a WebSocket client will not be able to successfully connect to a
//     Socket.IO server'
//
// ...hence the import. :sadblob:
//
var socketio = require("socket.io-client");
var $log = new log_1.default('[bitwave.tv API]');
var apiPrefix = 'https://api.bitwave.tv/api/';
var chatServer = 'https://chat.bitwave.tv';
var whisperEndpoint = ['api.bitwave.tv', '/v1/whispers/send'];
/**
 * Gets a new troll token from the API server.
 * @return JWT token as string
 */
var getTrollToken = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, httpClient_1.default.get(apiPrefix + 'troll-token')];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                e_1 = _a.sent();
                $log.error("Couldn't get troll token!", e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/* ========================================= */
var BitwaveChat = /** @class */ (function () {
    function BitwaveChat(doLogging) {
        this._socket = null;
        this.userProfile = {
            recaptcha: null,
            page: 'global',
            token: null,
        };
        this.global = true; /**< Global chat mode flag */
        this.channelViewers = []; /**< Array of channel viewers.  */
        $log.doOutput = doLogging;
    }
    /**
     * Uses `credentials` to get a token from the server.
     *
     * @return JWT token as string
     */
    BitwaveChat.prototype.initToken = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!credentials) return [3 /*break*/, 1];
                        this.userProfile = credentials;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this.userProfile;
                        return [4 /*yield*/, getTrollToken()];
                    case 2:
                        _a.token = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    /**
     * Callback function that receives messages (in bulk)
     * @param ms Message object array
     */
    BitwaveChat.prototype.rcvMessageBulk = function (ms) { for (var _i = 0, ms_1 = ms; _i < ms_1.length; _i++) {
        var m = ms_1[_i];
        console.log(m);
    } };
    /**
     * Callback function that receives paid chat alert objects
     * @param message Alert object
     */
    BitwaveChat.prototype.alert = function (message) { $log.warn("Received alert: ", message); };
    /**
     * Gets an array of usernames from the server and puts it in channelViewers
     * It is called automatically at request from the server, but can be called manually
     * @see channelViewers
     */
    BitwaveChat.prototype.updateUsernames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, httpClient_1.default.get('https://api.bitwave.tv/v1/chat/channels')];
                    case 1:
                        data = _a.sent();
                        if (data && data.success) {
                            this.channelViewers = data.data;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        $log.error("Couldn't update usernames!");
                        console.error(e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BitwaveChat.prototype.onHydrate = function (data) { this.rcvMessageBulk(data); };
    /**
     * Requests messages from the server (called hydration)
     * It is called automatically when reconnecting.
     * @see socketError()
     * @return False if unsuccessful or empty
     */
    BitwaveChat.prototype.hydrate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        url = 'https://chat.bitwave.tv/v1/messages/'
                            + (!this.global && this.userProfile.page ? this.userProfile.page : '');
                        return [4 /*yield*/, httpClient_1.default.get(url)];
                    case 1:
                        data = _a.sent();
                        if (!data.size)
                            return [2 /*return*/, $log.warn('Hydration data was empty') === undefined && false];
                        this.onHydrate(data.data);
                        return [2 /*return*/, true];
                    case 2:
                        e_3 = _a.sent();
                        $log.error("Couldn't get chat hydration data!");
                        console.error(e_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function is called when connecting to the server
     */
    BitwaveChat.prototype.socketConnect = function () { };
    /**
     * This function is called when the server issues a reconnect.
     * It force hydrates chat to catch up.
     */
    BitwaveChat.prototype.socketReconnect = function () { };
    /**
     * This function is called when there's a socket error.
     */
    BitwaveChat.prototype.socketError = function (message, error) { };
    BitwaveChat.prototype.blocked = function (data) {
        $log.info('TODO: handle blocked event', data);
    };
    BitwaveChat.prototype.pollstate = function (data) {
        $log.info('TODO: handle pollstate event', data);
    };
    /**
     * Inits data and starts connection to server
     * @param room is a string for the channel you wish to connect to
     * @param credentials User credentials if falsy, gets a new troll token. If a string, it's taken as the JWT chat token
     * @param specificServer URI to a specific chat server
     */
    BitwaveChat.prototype.connect = function (room, credentials, specificServer) {
        return __awaiter(this, void 0, void 0, function () {
            var socketOptions, _a, sockSetup;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof credentials == 'string')) return [3 /*break*/, 1];
                        this.userProfile.token = credentials;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.initToken(credentials)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        this.userProfile.page = room;
                        socketOptions = { transports: ['websocket'] };
                        _a = this;
                        return [4 /*yield*/, socketio(specificServer || chatServer, socketOptions)];
                    case 4:
                        _a._socket = _b.sent();
                        sockSetup = new Map([
                            ['connect', function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this._socket.emit('new user', this.userProfile);
                                                $log.info("Connected to chat! (" + this.userProfile.page + ")");
                                                return [4 /*yield*/, this.socketConnect.call(this)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }],
                            ['reconnect', function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                $log.info("Socket issued 'reconnect'. Forcing hydration...");
                                                return [4 /*yield*/, this.hydrate()];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, this.socketReconnect.call(this)];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }],
                            ['error', function (error) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                // TODO: handle error
                                                $log.error("Socket error: Connection Failed", error);
                                                return [4 /*yield*/, this.socketError.call(this, "Connection Failed", error)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }],
                            ['disconnect', function (data) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, $log.error("Socket error: Connection Lost", data)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }],
                            ['update usernames', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.updateUsernames()];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }],
                            ['bulkmessage', function (data) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.rcvMessageBulk(data)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }],
                            ['alert', function (data) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.alert(data)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }],
                        ]);
                        sockSetup.forEach(function (cb, event) {
                            _this._socket.on(event, cb);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(BitwaveChat.prototype, "room", {
        get: function () { return this.userProfile.page; } /**< Current room */,
        set: function (r) {
            this.userProfile.page = r;
            $log.info("Changed to room " + r);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitwaveChat.prototype, "doLogging", {
        get: function () { return $log.doOutput; } /**< Enable log output */,
        set: function (r) {
            $log.doOutput = r;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitwaveChat.prototype, "socket", {
        get: function () { return this._socket; } /**< Deprecated, but allows access to underlying socket */,
        set: function (s) {
            this._socket = s;
        },
        enumerable: false,
        configurable: true
    });
    BitwaveChat.prototype.disconnect = function () {
        var _a, _b;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.off();
        (_b = this.socket) === null || _b === void 0 ? void 0 : _b.disconnect();
    };
    /**
     * Sends message with current config (this.userProfile)
     * @param msg Message to be sent. Can be an object: { message, channel, global, showBadge }, or just a string (in which case channel/global use current values)
     */
    BitwaveChat.prototype.sendMessage = function (msg) {
        switch (typeof msg) {
            case 'object':
                this._socket.emit('message', msg);
                break;
            case 'string':
                this._socket.emit('message', {
                    message: msg,
                    channel: this.userProfile.page,
                    global: this.global,
                    showBadge: true,
                });
                break;
        }
    };
    BitwaveChat.prototype.sendWhisper = function (recipient, msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, httpClient_1.default.post(whisperEndpoint[0], whisperEndpoint[1], {
                            chatToken: this.userProfile.token,
                            receiver: recipient,
                            message: msg,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BitwaveChat;
}());
exports.BitwaveChat = BitwaveChat;
//# sourceMappingURL=api.js.map