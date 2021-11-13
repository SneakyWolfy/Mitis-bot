const getManyConfigRole = require('../roles/getManyConfigRole');
const getRoles = require('../roles/getRoles');
const getHighestRole = require('../roles/getHighestRole');
const getLowestRole = require('../roles/getLowestRole');

// eslint-disable-next-line no-unused-vars
const Command = require('../../Command/index');
// eslint-disable-next-line no-unused-vars
const Argument = require('../../Argument');
/**
 *
 * @param {Command} permObj
 * @param {Argument} args
 */
const isCooldownImmune = async (permObj, args) => {
	try {
		if (permObj.cooldownImmune === 0) return false;

		const keyedRoles = await getManyConfigRole(
			args.message.guild,
			permObj.cooldownImmune,
		);
		if (!keyedRoles) return false;

		const member = args.message.guild.member(args.message.author);
		const memberRoles = getRoles(member.roles.cache);

		const highestUserRole = getHighestRole(memberRoles);
		const lowestKeyedRole = getLowestRole(keyedRoles);

		if (highestUserRole.rawPosition < lowestKeyedRole.rawPosition) return false;

		return true;
	} catch (error) {
		return false;
	}
};

module.exports = isCooldownImmune;
