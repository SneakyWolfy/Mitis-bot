const AppError = require('../AppError');

module.exports = async (roleID, guild) => {
	if (!roleID) throw new AppError('Missing Argument', 'No role was provided.');

	if (roleID.startsWith('<@') && roleID.endsWith('>')) {
		roleID = roleID.slice(2, -1);

		if (roleID.startsWith('&')) {
			roleID = roleID.slice(1);
		}
	}

	let role = await guild.roles.fetch(roleID);
	if (!role)
		role = guild.roles.cache.find(cachedRole => cachedRole.name === roleID);

	if (!role)
		throw new AppError('Unknown Role', 'That role does not exist in this guild.');

	return role;
};
