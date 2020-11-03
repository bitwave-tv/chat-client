import $http from './httpClient';
import logger from './log';
//
// Despite my best attempts to stay standalone, slim (and nodejs-free),
// as socketio docs say:
//
//  - 'a WebSocket client will not be able to successfully connect to a
//     Socket.IO server'
//
// ...hence the import. :sadblob:
//
import * as socketio from 'socket.io-client';

const $log = new logger( '[bitwave.tv API]' );

export interface Message {
    avatar: string,
    badge: string,
    userColor: string,
    message: string,
    timestamp: number,
    username: string,
    channel: string,
    global: boolean,
    type: string,
    id: string,
}

export interface OutgoingMessage {
    message: string,
    channel: string,
    global: boolean,
    showBadge: boolean,
}

const apiPrefix  = 'https://api.bitwave.tv/api/';
const chatServer = 'https://chat.bitwave.tv';
const whisperEndpoint: [string, string] = ['api.bitwave.tv', '/v1/whispers/send'];

/**
 * Gets a new troll token from the API server.
 * @return JWT token as string
 */
const getTrollToken = async () => {
    try {
        return await $http.get( apiPrefix + 'troll-token' );
    } catch ( e ) {
        $log.error( `Couldn't get troll token!`, e );
    }
};

export interface Token {
    recaptcha: any,
    page: string,
    token: string
}

/* ========================================= */


export class BitwaveChat {

    private _socket = null;

    private userProfile: Token = {
        recaptcha: null, // rawr XD
        page: 'global',  // room name
        token: null,
    };

    /**
     * Uses `credentials` to get a token from the server.
     *
     * @return JWT token as string
     */
    private async initToken(credentials: Token | void) {
        if( credentials ) {
            this.userProfile = credentials;
        } else {
            this.userProfile.token = await getTrollToken();
        }
    };

    public global: boolean | any = true; /**< Global chat mode flag */

    /**
     * Callback function that receives messages (in bulk)
     * @param ms Message object array
     */
    public rcvMessageBulk( ms: Message[] ): void { for( const m of ms ) console.log( m ); }

    /**
     * Callback function that receives paid chat alert objects
     * @param message Alert object
     */
    public alert( message: Object ): void { $log.warn( `Received alert: `, message ); }

    public channelViewers = []; /**< Array of channel viewers.  */

    /**
     * Gets an array of usernames from the server and puts it in channelViewers
     * It is called automatically at request from the server, but can be called manually
     * @see channelViewers
     */
    public async updateUsernames(): Promise<void> {
        try {
            const data = await $http.get( 'https://api.bitwave.tv/v1/chat/channels' );
            if( data && data.success ) {
                this.channelViewers = data.data;
            }
        } catch ( e ) {
            $log.error( `Couldn't update usernames!` );
            console.error( e );
        }
    }

    public onHydrate( data: Message[] ) { this.rcvMessageBulk( data ) }

    /**
     * Requests messages from the server (called hydration)
     * It is called automatically when reconnecting.
     * @see socketError()
     * @return False if unsuccessful or empty
     */
    public async hydrate(): Promise<boolean> {
        try {
            const url: string = 'https://chat.bitwave.tv/v1/messages/'
                + ( !this.global && this.userProfile.page ? this.userProfile.page : '' );
            const data = await $http.get( url );
            if( !data.size ) return $log.warn( 'Hydration data was empty' ) === undefined && false;

            this.onHydrate( data.data );
            return true;
        } catch ( e ) {
            $log.error( `Couldn't get chat hydration data!` );
            console.error( e );
            return false;
        }
    }

    /**
     * This function is called when connecting to the server
     */
    public socketConnect()  {}

    /**
     * This function is called when the server issues a reconnect.
     * It force hydrates chat to catch up.
     */
    public socketReconnect() {}

    /**
     * This function is called when there's a socket error.
     */
    public socketError( message: string, error )  {}

    public blocked( data ) {
        $log.info( 'TODO: handle blocked event', data );
    }

    public pollstate( data ) {
        $log.info( 'TODO: handle pollstate event', data );
    }

    public constructor(doLogging?: boolean) {
        $log.doOutput = doLogging;
    }

    /**
     * Inits data and starts connection to server
     * @param room is a string for the channel you wish to connect to
     * @param credentials User credentials if falsy, gets a new troll token. If a string, it's taken as the JWT chat token
     * @param specificServer URI to a specific chat server
     */
    async connect( room: string, credentials: string | Token | void, specificServer?: string ) {
        if( typeof credentials == 'string' ) {
            this.userProfile.token = credentials;
        } else {
            await this.initToken( credentials );
        }

        this.userProfile.page = room;

        const socketOptions = { transports: [ 'websocket' ] };
        this._socket = await socketio( specificServer || chatServer, socketOptions );

        // nicked from bitwave-tv/bitwave with care; <3
        const sockSetup = new Map([
            [ 'connect', async () => {
                this._socket.emit( 'new user', this.userProfile );
                $log.info( `Connected to chat! (${this.userProfile.page})` );
                await this.socketConnect.call( this );
            } ],
            [ 'reconnect',        async () => {
                $log.info( "Socket issued 'reconnect'. Forcing hydration..." );
                await this.hydrate();
                await this.socketReconnect.call( this );
            } ],
            [ 'error',            async (error: Object) => {
                // TODO: handle error
                $log.error( `Socket error: Connection Failed`, error );
                await this.socketError.call( this, `Connection Failed`, error );
            } ],
            [ 'disconnect',       async (data: Object)  => await $log.error( `Socket error: Connection Lost`, data ) ],
            [ 'update usernames', async () => await this.updateUsernames() ],
            [ 'bulkmessage',      async (data: Message[]) => await this.rcvMessageBulk( data ) ],
            [ 'alert',            async data => await this.alert( data ) ],
            [ 'blocked',          async data => await this.blocked( data ) ],
        ]);

        sockSetup.forEach( (cb, event) => {
            this._socket.on( event, cb );
        });
    }

    get room()  { return this.userProfile.page; } /**< Current room */
    set room(r) {
        this.userProfile.page = r;
        $log.info( `Changed to room ${r}` );
    }

    get doLogging()  { return $log.doOutput; } /**< Enable log output */
    set doLogging(r) {
        $log.doOutput = r;
    }

    get socket()  { return this._socket; } /**< Deprecated, but allows access to underlying socket */
    set socket(s) {
        this._socket = s;
    }

    disconnect(): void {
        this.socket?.off();
        this.socket?.disconnect();
    }

    /**
     * Sends message with current config (this.userProfile)
     * @param msg Message to be sent. Can be an object: { message, channel, global, showBadge }, or just a string (in which case channel/global use current values)
     */
    sendMessage( msg: OutgoingMessage | string ): void {
        switch( typeof msg ) {
        case 'object':
            this._socket.emit( 'message', msg );
            break;
        case 'string':
            this._socket.emit(
                'message',
                {
                    message: msg,
                    channel: this.userProfile.page,
                    global: this.global,
                    showBadge: true,
                }
            );
            break;
        }
    }

    async sendWhisper( recipient: string, msg: string ): Promise<void> {
        await $http.post(whisperEndpoint[0], whisperEndpoint[1], {
            chatToken: this.userProfile.token,
            receiver: recipient,
            message: msg,
        });
    }
}
