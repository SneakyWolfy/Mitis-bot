const AppError = require('../../AppError');

// eslint-disable-next-line no-unused-vars
const Command = require('../../Command');
// eslint-disable-next-line no-unused-vars
const { GuildMember } = require('discord.js');
/**
 *
 * @param {Command} permObj
 * @param {GuildMember} member
 * @returns {Boolean} True - throws error if fails to validate.
 */
const validateNativePermissions = (permObj, member) => {
	const isPermitted = member.permissions.has(permObj.reqPermissions, {
		checkAdmin: permObj.adminOverride,
		checkOwner: permObj.ownerOverride,
	});

	if (!isPermitted) {
		const missingPerms = permObj.reqPermissions
			.filter(perm => !member.permissions.toArray().includes(perm))
			.join(', ');

		throw new AppError(
			'Unauthorized',
			`You don't have the required permission to use this command: \`${missingPerms}\`!`,
		);
	}
	return true;
};

module.exports = validateNativePermissions;
