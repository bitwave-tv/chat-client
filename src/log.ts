
/**
 * Represents a logger
 * @constructor
 * @param {string} prefix - logger prefix
 */

export default class {
  public prefix: string;

  /** Creates new logger */
  constructor( prefix?: string ) {
    this.prefix = prefix ?? '[bitwave.tv API]';
  }

  /** Creates logger info */
  info( message, ...args ) {
    console.log( this.prefix + message, ...args );
  }

  /** Creates logger warn */
  warn( message, ...args ) {
    console.warn( this.prefix + '[WARN] ' + message, ...args );
  }

  /** Creates logger error */
  error( message, ...args ) {
    console.error( this.prefix + '[ERROR] ' + message, ...args );
  }
}
