export default {
    prefix: '[bitwave.tv API] ',

    info( message, ...args ) {
        console.log( this.prefix + message, ...args );
    },

    warn( message, ...args ) {
        console.warn( this.prefix + '[WARN] ' + message, ...args );
    },

    error( message, ...args ) {
        console.error( this.prefix + '[ERROR] ' + message, ...args );
    },
};
