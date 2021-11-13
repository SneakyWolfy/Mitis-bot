const configModel = require('../../../models/configModel');
const parseRole = require('../../Parse/parseRole');

// eslint-disable-next-line no-unused-vars
const { Guild, Role } = require('discord.js');
/**
 *
 * @param {String} roleName
 * @param {Guild} guild
 * @returns {Promise<Role>}
 */
module.exports = async (roleName, guild) => {
	if (!guild) return roleName;

	const configData = await configModel.fetchConfig(guild.id);
	const configRole = configData.roles?.[roleName];
	if (!configRole) return false;

	return await parseRole(configRole, guild);
};
