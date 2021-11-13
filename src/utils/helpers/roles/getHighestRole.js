const getHighestRole = roles => {
	return roles.reduce((a, v) => (v.position > a.position ? v : a), roles[0]);
};

module.exports = getHighestRole;
