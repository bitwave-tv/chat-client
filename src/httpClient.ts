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

const $post = ( url: string, path: string, data: any, cb: (...args: any[]) => void ): void => {
    if ( isNode ) {
        import( 'https' ).then( https => {
            import( 'querystring' ).then( querystring => {
                const _data: string = JSON.stringify(data);
                const options = {
                    hostname: url,
                    port: 443,
                    path: path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': _data.length
                    }
                }

                const req = https.request(options, res => {
                    res.on('data', cb);
                })

                req.on('error', cb)

                req.write(_data)
                req.end()
            });
        });
    } else {
        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if ( req.readyState === 4 && req.status === 200 ) {
                cb( JSON.parse( req.responseText ) );
            }
        };
        req.open('POST', url+path);

        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        req.send(JSON.stringify(data));
    }
}

export default {
    get: ( url: string ): Promise<any> => {
        return new Promise(resolve => {
            $get( url, response => resolve( response ) );
        });
    },
    post: ( url: string, path: string, data: Object ): Promise<any> => {
        return new Promise(resolve => {
            $post( url, path, data, response => resolve( response ) );
        });
    }
}
