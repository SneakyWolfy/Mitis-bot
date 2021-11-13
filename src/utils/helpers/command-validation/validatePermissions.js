const validateNativePermissions = require('./validateNativePermissions');
const {
	validateWhitelist,
	validateWhitelistHierarchy,
} = require('./validateWhitelist');
const validateBlacklist = require('./validateBlacklist');

// eslint-disable-next-line no-unused-vars
const Command = require('../../Command');
// eslint-disable-next-line no-unused-vars
const Argument = require('../../Argument');

/**
 *
 * @param {Command} permObj
 * @param {Argument} args
 * @returns {Promise<Boolean>}
 */
const validatePermissions = async (permObj, args) => {
	if (args.message.channel.type === 'dm') return true;
	const member = await args.message.guild.members.fetch(args.message.author.id);

	validateNativePermissions(permObj, member);

	permObj.roleHierarchy
		? await validateWhitelistHierarchy(member, permObj.roleWhitelist)
		: await validateWhitelist(member, permObj.roleWhitelist);

	await validateBlacklist(member, permObj.roleBlacklist);

	return true;
};

module.exports = validatePermissions;
