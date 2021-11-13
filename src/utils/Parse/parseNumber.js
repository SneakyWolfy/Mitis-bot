const AppError = require('../AppError');

/**
 * @param {Number} number
 * @param {Object} options
 * @param {Boolean} options.isInt
 * @param {Number} options.min Inclusive
 * @param {Number} options.max Inclusive
 */
module.exports = (number, options) => {
	options = Object.assign(
		{
			isInt: false,
			min: false,
			max: false,
		},
		options,
	);

	if (!number)
		throw new AppError('Missing Argument', 'A number value was not provided.');

	if (!Number.isFinite(+number))
		throw new AppError(
			'Invalid Number',
			`Number values must be finite, got "${number}"`,
		);

	if (Number.isNaN(+number))
		throw new AppError('Invalid Number', `Value was not a number`);

	if (!Number.isInteger(+number) && options.isInt)
		throw new AppError('Invalid Number', `Expected an integer, got "${number}"`);

	if (Number.isFinite(options.min) && +number < +options.min)
		throw new AppError(
			'Invalid Number',
			`Value must be greater than "${options.min}", got "${number}"`,
		);

	if (Number.isFinite(options.max) && +number > +options.max)
		throw new AppError(
			'Invalid Number',
			`Value must be less than "${options.min}", got "${number}"`,
		);

	return +number;
};
