const { state } = require('../models/appModel');

const lt = require('long-timeout');
const AppError = require('./AppError');

exports.addTimeout = (id, time, fn) => {
	if (state.client.timeouts.get(id))
		throw new AppError(
			'Invalid Timeout',
			'A timeout with that id already exists.',
		);

	const timeout = lt.setTimeout(() => {
		fn();
		this.removeTimeout(id);
	}, time);
	state.client.timeouts.set(id, timeout);
};

exports.createDebounce = (
	id,
	time = 1000 * 10,
	errorMessage = ['Invalid Timeout', 'You must wait a bit'],
) => {
	if (state.client.timeouts.get(id))
		throw new AppError(errorMessage[0], errorMessage[1]);

	const timeout = lt.setTimeout(() => this.removeTimeout(id), time);
	state.client.timeouts.set(id, timeout);
};

exports.removeTimeout = id => {
	const timeout = state.client.timeouts?.get?.(id);

	lt.clearTimeout(timeout);
	state.client.timeouts?.delete?.(id);
};

exports.addInterval = (id, time, fn) => {
	if (state.client.intervals.get(id))
		throw new AppError(
			'Invalid Interval',
			'A interval with that id already exists.',
		);

	const interval = lt.setInterval(fn, time);
	state.client.intervals.set(id, interval);
};

exports.removeInterval = id => {
	const interval = state.client.intervals?.get?.(id);

	lt.clearInterval(interval);
	state.client.intervals?.delete?.(id);
};
