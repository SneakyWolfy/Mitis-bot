const getLowestRole = roles => {
	return roles.reduce(
		(a, v) => (v.rawPosition < a.rawPosition ? v : a),
		roles[0],
	);
};

module.exports = getLowestRole;
