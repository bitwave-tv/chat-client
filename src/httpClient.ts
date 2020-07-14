const isNode = typeof process === 'object';

const $get = ( url: string, cb: Function ): void => {
    if ( isNode ) {
        import( 'https' ).then( https  => {
            https.get( url, resp => {
                let data = '';

                // A chunk of data has been received.
                resp.on( 'data', ( chunk ) => {
                    data += chunk;
                } );

                // The whole response has been received.
                // Print out the result.
                resp.on( 'end', () => {
                    cb( JSON.parse( data ) );
                } );
            } );
        });
    } else {
        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if ( req.readyState === 4 && req.status === 200 ) {
                cb( JSON.parse( req.responseText ) );
            }
        };
        req.open( 'GET', url, true );
        req.send( null );
    }
}

export default {
    get: ( url: string ): Promise<any> => {
        return new Promise(resolve => {
            $get( url, response => resolve( response ) );
        });
    }
}
