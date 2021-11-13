const AppError = require('../AppError');

module.exports = async message => {
	if (!message)
		throw new AppError(`Missing Argument`, `No message was provided.`);

	return message.join(' ');
};
