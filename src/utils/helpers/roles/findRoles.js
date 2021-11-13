const findRole = require('./findRole');

// eslint-disable-next-line no-unused-vars
const { Guild, Role } = require('discord.js');
/**
 *
 * @param {Array<String>} roleNames
 * @param {Guild} guild
 * @param {Function} errorCB
 * @returns {Promise<Array<Role>>}
 */
const findRoles = async (roleNames, guild, errorCB) => {
	const roles = roleNames.map(async roleName => {
		return await findRole(roleName, guild, errorCB);
	});

	return await Promise.all(roles);
};
module.exports = findRoles;
