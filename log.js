export default {
    prefix: '[bitwave.tv bot] ',

    info( message ) {
        console.log( this.prefix + message );
    },

    warn( message ) {
        console.warn( this.prefix + '[WARN] ' + message );
    },

    error( message ) {
        console.error( this.prefix + '[ERROR] ' + message );
    },
};
