class AppError extends Error {
	constructor(title, message) {
		super(message);

		this.title = title || 'Error';
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
