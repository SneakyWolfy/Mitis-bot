const configModel = require('../../../models/configModel');
const parseChannel = require('../../Parse/parseChannel');
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
/**
 *
 * @param {String} roleName
 * @param {Discord.Guild} guild
 * @returns {Promise<Discord.Role>}
 */
module.exports = async (loggingChannel, guild) => {
	if (!guild) return false;

	const configData = await configModel.fetchConfig(guild.id);
	const channelName = configData.logging?.[loggingChannel];
	if (!channelName) return false;

	return parseChannel(channelName, guild);
};
