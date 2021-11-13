const getRoles = require('../roles/getRoles');
const findRoles = require('../roles/findRoles');

module.exports = (callback, roleNotFoundCB) => async (member, roleList) => {
	//check if role list is empty
	if (roleList.length === 0) return true;

	//get relevant data
	const memberRoles = getRoles(member.roles.cache);

	//check if roles exist. if they do, return them
	const roles = await findRoles(roleList, member.guild, roleNotFoundCB);

	callback(roles, memberRoles);
};
