const parseFlags = require('./parseFlags');

/**
 * @returns {Object}
 */
const parseMessage = (message, prefix) => {
	const { flags, commandStr } = parseFlags(message.content);

	const args = commandStr.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	return { args, commandName, flags, prefix };
};

module.exports = parseMessage;
