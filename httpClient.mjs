"use strict";

let $get = () => console.error("httpClient get is broken :trout:");
if(typeof process === 'object') {
    import('https').then( https => {
        $get = ( url, callback ) => {
            https.get( url, resp => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    callback( JSON.parse(data) );
                });
            });
        };
    });
} else {
    $get = ( url, callback ) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if ( req.readyState === 4 && req.status === 200 ) {
                callback( JSON.parse( req.responseText ) );
            }
        };
        req.open( "GET", url, true );
        req.send( null );
    };
}

export default {
    async get( url ) {
        return new Promise(resolve => {
            $get( url, response => resolve( response ) );
        });
    },
};
