/**
 * Represents a logger
 * @constructor
 * @param {string} prefix - logger prefix
 */
export default class {
    readonly prefix: string;
    doOutput: boolean;
    /** Creates new logger */
    constructor(prefix?: string, doOutput?: boolean);
    /** Creates logger info */
    info(message: String, ...args: any[]): void;
    /** Creates logger warn */
    warn(message: String, ...args: any[]): void;
    /** Creates logger error */
    error(message: String, ...args: any[]): void;
}
