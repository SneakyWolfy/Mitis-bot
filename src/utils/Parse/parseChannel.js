const AppError = require('../AppError');

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

/**
 *
 * @param {Discord.Snowflake} channelID
 * @param {Discord.Guild} guild
 * @returns
 */
module.exports = (channelID, guild) => {
	if (!channelID)
		return new AppError(
			'Missing Argument',
			'A channel id or mention was not provided.',
		);

	if (channelID.startsWith('<#') && channelID.endsWith('>'))
		channelID = channelID.slice(2, -1);

	const channel = guild.channels.cache.get(channelID);

	if (!channel)
		throw new AppError(
			`Invalid Channel`,
			`"\`${channelID}\`" is not an id, mention, or found in this server.`,
		);
	return channel;
};
