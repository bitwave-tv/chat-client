import $http from './httpClient';
import logger  from './log';

const $log = new logger( '[bitwave.tv API]' );

interface Message {
  message: string,
  channel: string,
  global: boolean,
  showBadge: boolean,
};

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

const apiPrefix  = 'https://api.bitwave.tv/api/';
const chatServer = 'https://chat.bitwave.tv';

/**
 * Gets a new troll token from the API server.
 * @return JWT token as string
 */
const getTrollToken = async () => {
    try {
        const data = await $http.get( apiPrefix + 'troll-token' );
        return data;
    } catch ( e ) {
        $log.error( `Couldn't get troll token!` );
        console.error( e );
    }
};

let userProfile = {
    recaptcha: null, // rawr XD
    page: 'global',  // room name
    token: null,
};

/**
 * Uses @p credentials to get a token from the server.
 * Note: currently ignores credentials and gets a troll token.
 *
 * @return JWT token as string
 */
const initToken = async credentials => {
    if( typeof credentials === "object" ) {
        userProfile = credentials;
    } else {
        userProfile.token = await getTrollToken();
    }
};

/* ========================================= */

let socket = null;

const socketConnect = () => {
    socket.emit( 'new user', userProfile );
    $log.info( `Connected to chat! (${userProfile.page})` );
};

const socketReconnect = async ( hydrate: Function ): Promise<void> => {
    $log.info( "Socket issued 'reconnect'. Forcing hydration..." );
    await hydrate();
};

const socketError = async ( message: string, error: Object ): Promise<void> => {
    $log.error( `Socket error: ${message}`, error );
    // TODO: handle error
};

export default {

    global: true, /**< Global chat mode flag */

    /**
     * Callback function that receives messages (in bulk)
     * @param ms Message object array
     */
  rcvMessageBulk: ( ms: Message[] ): void => { for( const m of ms ) console.log( m ); },

    /**
     * Callback function that receives paid chat alert objects
     * @param message Alert object
     */
    alert( message: Object ): void { $log.warn( `Received alert: `, message ); },

    channelViewers: [], /**< Array of channel viewers.  */

    /**
     * Gets an array of usernames from the server and puts it in channelViewers
     * It is called automatically at request from the server, but can be called manually
     * @see channelViewers
     */
    async updateUsernames() {
        try {
            const data = await $http.get( 'https://api.bitwave.tv/v1/chat/channels' );
            if( data && data.success ) {
                this.channelViewers = data.data;
            }
        } catch ( e ) {
            $log.error( `Couldn't update usernames!` );
            console.error( e );
        }
    },

    onHydrate( data: Message[] ) { this.rcvMessageBulk( data ) },

    /**
     * Requests messages from the server (called hydration)
     * It is called automatically when reconnecting.
     * @see socketError()
     */
    async hydrate(): Promise<boolean> {
        try {
            const url: string = 'https://chat.bitwave.tv/v1/messages/'
                + ( !this.global && userProfile.page ? userProfile.page : '' );
            const data = await $http.get( url );
            if( !data.size ) return $log.warn( 'Hydration data was empty' ) === undefined && false;

            this.onHydrate( data.data );
            return true;
        } catch ( e ) {
            $log.error( `Couldn't get chat hydration data!` );
            console.error( e );
            return false;
        }
    },

    /**
     * This function is called when connecting to the server
     */
    socketConnect()  {},

    /**
     * This function is called when the server issues a reconnect.
     * It force hydrates chat to catch up.
     */
    async socketReconnect() {},

    /**
     * This function is called when there's a socket error.
     */
    socketError( message: string, error )  {},

    blocked( data ) {
        $log.info( 'TODO: handle blocked event', data );
    },

    pollstate( data ) {
        $log.info( 'TODO: handle pollstate event', data );
    },

    /**
     * Inits data and starts connection to server
     * @param room is a string for the channel you wish to connect to
     * @param credentials User credentials if falsy, gets a new troll token. If a string, it's taken as the JWT chat token
     * @param specificServer URI to a specific chat server
     */
    async init( room: string, credentials: string | Object, specificServer?: string ) {
        if( credentials && typeof credentials == 'string' ) {
            userProfile.token = credentials;
        } else {
            await initToken( credentials );
        }

        userProfile.page = room;

        const socketOptions = { transports: [ 'websocket' ] };
        socket = await socketio( specificServer || chatServer, socketOptions );

        // nicked from bitwave-tv/bitwave with care; <3
        const sockSetup = new Map([
            [ 'connect', async () => {
                socketConnect();
                await this.socketConnect.call( this );
            } ],
            [ 'reconnect',        async () => {
                await socketReconnect( this.hydrate );
                await this.socketReconnect.call( this );
            } ],
            [ 'error',            async (error: Object) => {
                await socketError( `Connection Failed`, error );
                await this.socketError.call( this, `Connection Failed`, error );
            } ],
            [ 'disconnect',       async (data: Object)  => await socketError( `Connection Lost`, data ) ],
            [ 'update usernames', async () => await this.updateUsernames() ],
            [ 'bulkmessage',      async data => await this.rcvMessageBulk( data ) ],
            [ 'alert',            async data => await this.alert( data ) ],
        ]);

        sockSetup.forEach( (cb, event) => {
            socket.on( event, cb );
        });
    },

    get room()  { return userProfile.page; }, /**< Current room */
    set room(r) {
        userProfile.page = r;
        $log.info( `Changed to room ${r}` );
    },

    get socket()  { return socket; }, /**< Deprecated, but allows access to underlying socket */
    set socket(s) {
        socket = s;
    },

    disconnect(): void {
        this.socket.off();
        this.socket.disconnect();
    },

    /**
     * Sends message with current config (this.userProfile)
     * @param msg Message to be sent. Can be an object: { message, channel, global, showBadge }, or just a string (in which case channel/global use current values)
     */
    sendMessage( msg: Message | string ): void {
        switch( typeof msg ) {
        case 'object':
            socket.emit( 'message', msg );
            break;
        case 'string':
            socket.emit(
                'message',
                {
                    message: msg,
                    channel: userProfile.page,
                    global: this.global,
                    showBadge: true,
                }
            );
            break;
        }
    },
};
