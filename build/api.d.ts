export interface Message {
    avatar: string;
    badge: string;
    userColor: string;
    message: string;
    timestamp: number;
    username: string;
    channel: string;
    global: boolean;
    showBadge?: boolean;
    type: string;
    id: string;
}
export interface Token {
    recaptcha: any;
    page: string;
    token: string;
}
export declare class BitwaveChat {
    private _socket;
    private userProfile;
    /**
     * Uses `credentials` to get a token from the server.
     *
     * @return JWT token as string
     */
    private initToken;
    global: boolean | any; /**< Global chat mode flag */
    /**
     * Callback function that receives messages (in bulk)
     * @param ms Message object array
     */
    rcvMessageBulk(ms: Message[]): void;
    /**
     * Callback function that receives paid chat alert objects
     * @param message Alert object
     */
    alert(message: Object): void;
    channelViewers: any[]; /**< Array of channel viewers.  */
    /**
     * Gets an array of usernames from the server and puts it in channelViewers
     * It is called automatically at request from the server, but can be called manually
     * @see channelViewers
     */
    updateUsernames(): Promise<void>;
    onHydrate(data: Message[]): void;
    /**
     * Requests messages from the server (called hydration)
     * It is called automatically when reconnecting.
     * @see socketError()
     * @return False if unsuccessful or empty
     */
    hydrate(): Promise<boolean>;
    /**
     * This function is called when connecting to the server
     */
    socketConnect(): void;
    /**
     * This function is called when the server issues a reconnect.
     * It force hydrates chat to catch up.
     */
    socketReconnect(): void;
    /**
     * This function is called when there's a socket error.
     */
    socketError(message: string, error: any): void;
    blocked(data: any): void;
    pollstate(data: any): void;
    constructor(doLogging?: boolean);
    /**
     * Inits data and starts connection to server
     * @param room is a string for the channel you wish to connect to
     * @param credentials User credentials if falsy, gets a new troll token. If a string, it's taken as the JWT chat token
     * @param specificServer URI to a specific chat server
     */
    connect(room: string, credentials: string | Token | void, specificServer?: string): Promise<void>;
    get room(): string; /**< Current room */
    set room(r: string);
    get doLogging(): boolean; /**< Enable log output */
    set doLogging(r: boolean);
    get socket(): any; /**< Deprecated, but allows access to underlying socket */
    set socket(s: any);
    disconnect(): void;
    /**
     * Sends message with current config (this.userProfile)
     * @param msg Message to be sent. Can be an object: { message, channel, global, showBadge }, or just a string (in which case channel/global use current values)
     */
    sendMessage(msg: Message | string): void;
}
