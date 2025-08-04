


/**
 * @typedef {Object} Command
 * @property {string | string[]} command - Names or alias of the commands
 * @property {string} desc - Description of the command
 * @property {(params: CommandContext) => Promise<any>} operate - Fonction of the command
 * @property {string} [__source] 
 */

/**
 * @typedef {Object} CommandContext
 * @property {import("baileys").WASocket} Tayc - Instance Baileys
 * @property {SterialiseMessage} m - Receive message
 * @property {(text: string) => Promise<void>} reply - Fonction to reply message
 * @property {string} text - Texte message receive
 */
