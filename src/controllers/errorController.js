const { errorEmbed, warningEmbed } = require('../utils/Provider/embed');
const ResponseHandler = require('../utils/ResponseHandler');

const sendErrorDev = async (err, channel) => {
	if (!err.isOperational) {
		console.log(err);
		return await sendError(
			err.message,
			'Application Error',
			channel,
			errorEmbed(),
		);
	}
	return await sendError(
		err.message,
		err.title ?? 'Error',
		channel,
		warningEmbed(),
	);
};

const sendErrorProd = async (err, channel) => {
	if (!err.isOperational) {
		console.log(err);
		return await sendError(
			err.message,
			'Application Error',
			channel,
			errorEmbed(),
		);
	}
	return await sendError(
		err.message,
		err.title ?? 'Error',
		channel,
		warningEmbed(),
	);
};

/**
 *
 * @param {String} message
 * @param {Channel} channel
 * @param {MessageEmbed} embed
 */
const sendError = async (message, title, channel, embed) => {
	if (!channel) return;
	embed.setTitle(title);
	embed.setDescription(message);

	await ResponseHandler.sendAutoDelete(embed, channel);
};

exports.handelError = (err, channel) => {
	switch (process.env.NODE_ENV) {
		case 'development':
			return sendErrorDev(err, channel);

		case 'production':
		default:
			return sendErrorProd(err, channel);
	}
};
