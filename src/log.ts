
/**
 * Represents a logger
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
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
