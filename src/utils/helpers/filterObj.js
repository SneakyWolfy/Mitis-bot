module.exports = (obj, predicate) => {
	const newObj = {};
	let i = 0;

	for (const [k, v] of Object.entries(obj)) {
		if (!predicate(k, v, i++, obj)) continue;
		newObj[k] = v;
	}

	return newObj;
};
