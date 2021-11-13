const parseMessage = require('./parseMessage');
// eslint-disable-next-line no-unused-vars
const Command = require('../Command');
// eslint-disable-next-line no-unused-vars
const discord = require('discord.js');

class Argument {
	static isValid = require('./isValid');
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

		/** @type {discord.Collection<Object>} Command flags */
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

		/** @type {discord.User} */
		this.author = message.author;

		this.message = message;
	}

	keep() {
		this.flags.set('keep', '');
	}
}

module.exports = Argument;
