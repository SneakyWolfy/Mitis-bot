const getLoggingChannel = require('./helpers/channels/getLoggingChannel');
const Discord = require('discord.js');

module.exports = async (content, channelName, guild) => {
	const outputChannel = await getLoggingChannel(channelName, guild);
	if (!outputChannel) return;

	if (content instanceof Discord.MessageEmbed)
		return await outputChannel.send(content);

	return await outputChannel.send(content, { allowedMentions: { users: [] } });
};
