const getConfigRole = require('./getConfigRole');

// eslint-disable-next-line no-unused-vars
const { Guild, Role } = require('discord.js');
/**
 *
 * @param {String} roleName
 * @param {Guild} guild
 * @param {Function} errorCB
 * @returns {Promise<Role>}
 */
const findRole = async (roleName, guild, errorCB) => {
	const configRole = await getConfigRole(roleName, guild);
	if (configRole && typeof configRole !== 'boolean') return configRole;

	const newRole = guild.roles.cache.find(
		guildRole => guildRole.name === roleName || guildRole.id === roleName,
	);

	if (newRole) return newRole;

	if (errorCB) await errorCB(roleName);
	return false;
};

module.exports = findRole;
