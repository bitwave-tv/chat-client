import $http from './httpClient';
import logger  from './log';

const $log = new logger( '[bitwave.tv API]' );


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

/**
 * Uses @p credentials to get a token from the server.
 * Note: currently ignores credentials and gets a troll token.
 *
 * @return JWT token as string
 */
const initToken = async credentials => {
    //TODO: use credentials
    const data = await getTrollToken();
    return data.chatToken;
};

/* ========================================= */

let socket = null;

/**
 * This function is called when connecting to the server
 */
const socketConnect = () => {
    socket.emit( 'new user', userProfile );
    $log.info( `Connected to chat! (${userProfile.page})` );
};

/**
 * This function is called when the server issues a reconnect.
 * It force hydrates chat to catch up.
 */
const socketReconnect = async hydrate => {
    $log.info( "Socket issued 'reconnect'. Forcing hydration..." );
    await hydrate();
};

/**
 * This function is called when there's a socket error.
 */
const socketError = ( message, error ) => {
    $log.error( `Socket error: ${message}`, error );
    // TODO: handle error
};

let userProfile = {
    recaptcha: null, // rawr XD
    page: 'global',  // room name
    token: null,
};

export default {

    global: true, /**< Global chat mode flag */

    /**
     * Callback function that receives messages (in bulk)
     * @param ms Message object array
     */
    rcvMessageBulk: ms => { for( const m of ms ) console.log( m ); },

    /**
     * Callback function that receives paid chat alert objects
     * @param message Alert object
     */
    alert( message ) { $log.warn( `Recieved alert: ${message}` ); },

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

    /**
     * Requests messages from the server (called hydration)
     * It is called automatically when reconnecting.
     * @see socketError()
     */
    async hydrate() {
        try {
            const data = await $http.get( 'https://chat.bitwave.tv/v1/messages' + userProfile.page ? userProfile.page : '' );
            if( !data.length ) return $log.warn( 'Hydration data was empty' );

            this.rcvMessageBulk( data );
            // Supresses warning about prev. abused return
            return undefined;
        } catch ( e ) {
            $log.error( `Couldn't get chat hydration data!` );
            console.error( e );
            return undefined;
        }
    },

    /**
     * Inits data and starts connection to server
     * @param room is a string for the channel you wish to connect to
     * @param credentials User credentialsif falsy, gets a new troll token. If a string, it's taken as the JWT chat token
     */
    async init( room, credentials ) {
        if( credentials && typeof credentials == 'string' ) {
            userProfile.token = credentials;
        } else {
            userProfile.token = await initToken( credentials );
        }

        userProfile.page = room;

        const socketOptions = { transports: [ 'websocket' ] };
        socket = await socketio( chatServer, socketOptions );

        // nicked from bitwave-tv/bitwave with care; <3
        const sockSetup = new Map([
            [ 'connect',          async () => await socketConnect() ],
            [ 'reconnect',        async () => await socketReconnect( this.hydrate ) ],
            [ 'error',            async error => await socketError( `Connection Failed`, error ) ],
            [ 'disconnect',       async data  => await socketError( `Connection Lost`, data ) ],
            [ 'update usernames', async () => await this.updateUsernames() ],
            [ 'bulkmessage',      async data => await this.rcvMessageBulk( data ) ],
            [ 'alert',            async data => await this.alert( data ) ],
        ]);

        sockSetup.forEach( (event, cb) => {
          socket.on( event, cb );

          // TODO: yikes
          // socket.on( 'pollstate', data => this.updatePoll( data ) );
        });
    },

    get room()  { return userProfile.page; }, /**< Current room */
    set room(r) {
        userProfile.page = r;
        $log.info( `Changed to room ${r}` );
    },

    /**
     * Sends message with current config (this.userProfile)
     * @param msg Message to be sent. Can be an object: { message, channel, global, showBadge }, or just a string (in which case channel/global use current values)
     */
    sendMessage( msg ) {
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
