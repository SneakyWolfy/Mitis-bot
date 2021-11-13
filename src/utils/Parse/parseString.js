const AppError = require('../AppError');

module.exports = async string => {
	if (!string)
		throw new AppError(`Missing Argument`, `No message was provided.`);

	return string;
};
