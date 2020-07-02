import $http from './httpClient.js';
import $log  from './log.js';

//
// Despite my best attempts to stay standalone, slim (and nodejs-free),
// as socketio docs say:
//
//  - 'a WebSocket client will not be able to successfully connect to a
//     Socket.IO server'
//
// ...hence the import. :sadblob:
//
import socketio from 'socket.io-client';

const apiPrefix  = 'https://api.bitwave.tv/api/';
const chatServer = 'https://chat.bitwave.tv';


const getTrollToken = async () => {
    const data = await $http.get( apiPrefix + 'troll-token' );
    return data;
};

const initToken = async credentials => {
    //TODO: use credentials
    const data = await getTrollToken();
    return data.chatToken;
};

/* ========================================= */

let socket = null;
const socketConnect = () => {
    socket.emit( 'new user', userProfile );
    $log.info( `Connected to chat! (${userProfile.page})` );
};
const socketReconnect = async hydrate => {
    $log.info( "Socket issued 'reconnect'. Forcing hydration..." );
    await hydrate();
};
const socketError = message => {
    $log.error( `Socket error: ${message}` );
    // TODO: handle error
};

let userProfile = {
    recaptcha: null, // rawr XD
    page: 'global',  // room name
    token: null,
};

export default {

    get socket() { return socket; },
    set socket( s ) { socket = s; },

    rcvMessageBulk: ms => { for( const m of ms ) console.log( m ); },
    alert( message ) { $log.warn( `Recieved alert: ${message}` ); },

    channelViewers: [],
    async updateUsernames() {
        const data = await $http.get( 'https://api.bitwave.tv/v1/chat/channels' );
        if( data && data.success ) {
            this.channelViewers = data.data;
        }
    },

    // TODO: This is called when the connection gets wobbly
    hydrate() {
        const data = $http.get( 'https://chat.bitwave.tv/v1/messages' + this.room ? this.room : '' );
        if( !data.length ) return $log.warn( 'Hydration data was empty' );

        this.rcvMessageBulk( data );
        // Supresses warning about prev. abused return
        return undefined;
    },

    // Inits data and starts connection to server
    // 'room' is a string for the channel you wish to connect to
    // 'credentials', if falsy, gets a new troll token
    //   if a string, it's taken as the JWT chat token
    async init( room, credentials ) {
        if( credentials && typeof credentials == 'string' ) {
            userProfile.token = credentials;
        } else {
            userProfile.token = await initToken( credentials );
        }

        userProfile.page = room;

        const socketOptions = { transports: [ 'websocket' ] };
        this.socket = socketio( chatServer, socketOptions );

        // nicked from bitwave-tv/bitwave with care; <3
        const sockSetup = new Map([
            [ 'connect',   async () => await socketConnect( this.socket ) ],
            [ 'reconnect', async () => await socketReconnect( this.socket ) ],
            [ 'error', async error => await socketError( `Connection Failed`, error ) ],
            [ 'disconnect', async data  => await socketError( `Connection Lost`, data ) ],
            [ 'update usernames', async () => await this.updateUsernames() ],
            [ 'bulkmessage', async data => await this.rcvMessageBulk( data ) ],
            [ 'alert',       async data => await this.alert( data ) ],
        ]);

        for( const s of sockSetup.entries() ) {
            this.socket.on( s[0], s[1] );
        }

        // TODO: yikes
        // this.socket.on( 'pollstate', data => this.updatePoll( data ) );
    },

    get room()  { return userProfile.page; },
    set room(r) {
        userProfile.page = r;
        $log.info( `Changed to room ${r}` );
    },

    // Sends message with current config (this.userProfile)
    // 'msg' can be an object: { message, channel, global, showBadge }
    //   or just a string (in which case channel/global use current values)
    sendMessage( msg ) {
        switch( typeof msg ) {
        case 'object':
            this.socket.emit( 'message', msg );
            break;
        case 'string':
            this.socket.emit(
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
    },
};
