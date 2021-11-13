const { formatDate } = require('./format');

module.exports = (document, message) => {
	const mostRecent = document.reduce(
		(acc, el) => (acc > el.timestamp ? acc : el.timestamp),
		0,
	);

	return mostRecent ? `${message}${formatDate(mostRecent)}` : '';
};
