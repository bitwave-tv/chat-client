import * as https from 'https';

const $get = ( url: string, cb ): void => {

  https.get( url, resp => {
    let data = '';

    // A chunk of data has been received.
    resp.on( 'data', ( chunk ) => {
      data += chunk;
    } );

    // The whole response has been received. Print out the result.
    resp.on( 'end', () => {
      cb( JSON.parse( data ) );
    } );
  } );
}

export default {
  get: ( url: string ): Promise<any> => {
    return new Promise(resolve => {
      $get( url, response => resolve( response ) );
    });
  }
}
