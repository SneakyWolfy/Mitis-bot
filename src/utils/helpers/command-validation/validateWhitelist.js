const factoryRoleValidation = require('./_factoryRoleValidation');
const getHighestRole = require('../roles/getHighestRole');
const getLowestRole = require('../roles/getLowestRole');
const AppError = require('../../AppError');
const { getPrefix } = require('../../../controllers/configController');

const validateWhitelistHierarchy = (whitelistedRoles, memberRoles) => {
	const highestUserRole = getHighestRole(memberRoles);
	const lowestWhitelistedRole = getLowestRole(whitelistedRoles);

	if (highestUserRole.rawPosition >= lowestWhitelistedRole.rawPosition)
		return true;

	throw new AppError(
		'Unauthorized',
		`You must be ${lowestWhitelistedRole} or higher to use this command!`,
	);
};

const validateWhitelist = (whitelistedRoles, memberRoles) => {
	const containsRole = whitelistedRoles.reduce(
		(flag, whitelisted) =>
			memberRoles.some(role => role.id === whitelisted.id) ? true : flag,
		false,
	);

	if (containsRole) return true;

	// prettier-ignore
	throw new AppError('Unauthorized', `You do not have one of the following roles: \`${whitelistedRoles.join(', ')}\``);
};

const roleNotFound = async roleName => {
	throw new AppError(
		'Unknown Required Role',
		`\`${roleName}\` is a required role to use this command, but is not found on this server.\nUse \`${await getPrefix()}config ${roleName} <role>\` to set one up!`,
	);
};

exports.validateWhitelist = factoryRoleValidation(
	validateWhitelist,
	roleNotFound,
);
exports.validateWhitelistHierarchy = factoryRoleValidation(
	validateWhitelistHierarchy,
	roleNotFound,
);
