const ms = require('ms');
const AppError = require('../AppError');

module.exports = time => {
	if (!time)
		throw new AppError('Missing Argument', 'A time value was not provided.');

	if (Number.isFinite(+time)) {
		const value = +time * 1000;

		if (!Number.isInteger(value))
			throw new AppError('Invalid Time Input', 'Time values must an integer.');

		if (value < 0)
			throw new AppError('Invalid Time Input', 'Time values must be positive.');

		return value;
	}

	const value = ms(time);

	if (value === undefined)
		throw new AppError(
			'Invalid Time Input',
			'Time cannot be parsed into a number.',
		);

	if (Number.isNaN(value))
		throw new AppError('Invalid Time Input', 'Time values must an integer.');

	if (value < 0)
		throw new AppError('Invalid Time Input', 'Time values must be positive.');

	return value;
};
