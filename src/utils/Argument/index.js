const discord = require("discord.js");
const parseMessage = require("./parseMessage");
const Command = require("../Command");

class Argument {
  static isValid = require("./isValid");
  timeConstructed = Date.now();

  /** @param {discord.Message} message */
  constructor(message, prefix) {
    const { args, commandName, flags } = parseMessage(message, prefix);

    /**
     * @type {Array<String>} list of user arguments
     * @alias args
     */
    this.args = this.arguments = args;

    /** @type {String} command name*/
    this.commandName = commandName;

    /** @type {Array<Object>} Command flags */
    this.flags = flags;

    /** @type {Array<Object>} Command prefix when used */
    this.prefix = prefix;

    /** @type {Number} Number of arguments */
    this.length = this.args.length;

    /** @type {Command} */
    this.command;

    /** @type {discord.TextChannel} */
    this.channel = message.channel;

    /** @type {discord.Guild} */
    this.guild = message.guild;

    this.message = message;
  }
}

module.exports = Argument;
