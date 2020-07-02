"use strict";

const $get = ( url, callback ) => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if ( req.readyState === 4 && req.status === 200 ) {
            callback( JSON.parse( req.responseText ) );
        }
    };
    req.open( "GET", url, true );
    req.send( null );
};

export default {
    async get( url ) {
        return new Promise(resolve => {
            $get( url, response => resolve( response ) );
        });
    },
};
