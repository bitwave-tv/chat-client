
/**
 * Represents a logger
 * @constructor
 * @param {string} prefix - logger prefix
 */

export default class {
  public readonly prefix: string;
  public doOutput: boolean = true;

  /** Creates new logger */
  constructor( prefix?: string, doOutput?: boolean ) {
    this.doOutput = doOutput;
    this.prefix = (prefix ?? '[bitwave.tv API]') + ' ';
  }

  /** Creates logger info */
  info( message: String, ...args ): void {
    this.doOutput && console.log( this.prefix + message, ...args );
  }

  /** Creates logger warn */
  warn( message: String, ...args ): void {
    this.doOutput && console.warn( this.prefix + '[WARN] ' + message, ...args );
  }

  /** Creates logger error */
  error( message: String, ...args ): void {
    this.doOutput && console.error( this.prefix + '[ERROR] ' + message, ...args );
  }
}
