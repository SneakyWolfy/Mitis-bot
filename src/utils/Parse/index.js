const parseChannel = require('./parseChannel');
const parseEnum = require('./parseEnum');
const parseMember = require('./parseMember');
const parseUser = require('./parseUser');
const parseMessage = require('./parseMessage');
const parseTime = require('./parseTime');
const parseString = require('./parseString');
const parseRole = require('./parseRole');
const parseNumber = require('./parseNumber');

class Parse {
	#outArgs = [];
	#inArgs;
	#message;
	#channel;
	#guild;
	#prefix;
	#command;

	#inputBuffer;
	/**
	 *
	 * @param {Argument} args
	 */
	constructor(args) {
		this.#message = args.message;
		this.#channel = args.channel;
		this.#guild = args.guild;
		this.#prefix = args.prefix;
		this.#command = args.command;
		this.#inArgs = [...args.args];
	}

	get #input() {
		this.#inputBuffer = this.#inArgs.shift();
		return this.#inputBuffer;
	}

	get #restInput() {
		this.#inputBuffer = this.#inArgs.splice(0, this.#inArgs.length);
		return this.#inputBuffer;
	}
	/**
	 * @param {Function} func
	 */
	set #output(func) {
		this.#outArgs.push(func);
	}

	#param(name, func, args, options) {
		this.#output = {
			func,
			args,
			name,
			input: this.#inputBuffer,
			...this.#applyOptions(options),
		};

		return this;
	}

	#applyOptions(options = {}) {
		if (!this.#isObject(options)) return { default: options, required: true };

		return Object.assign(
			{ required: true, default: undefined, useOverflow: false },
			options,
		);
	}

	member(options) {
		return this.#param(
			'Member',
			parseMember,
			[this.#input, this.#guild],
			options,
		);
	}

	enum(enums, options) {
		return this.#param(`[${enums}]`, parseEnum, [enums, this.#input], options);
	}

	/**
	 * @param {Object} numberOptions
	 * @param {Boolean} numberOptions.isInt
	 * @param {Number} numberOptions.min
	 * @param {Number} numberOptions.max
	 */
	number(numberOptions, options) {
		return this.#param(
			'Number',
			parseNumber,
			[this.#input, numberOptions],
			options,
		);
	}

	channel(options) {
		return this.#param(
			'Channel',
			parseChannel,
			[this.#input, this.#guild],
			options,
		);
	}

	message(options) {
		const name = options?.name ?? 'string';
		return this.#param(name, parseMessage, [this.#restInput], options);
	}

	string(options) {
		const name = options?.name ?? 'string';
		return this.#param(name, parseString, [this.#input], options);
	}

	role(options) {
		return this.#param('Role', parseRole, [this.#input, this.#guild], options);
	}

	user(options) {
		return this.#param('User', parseUser, [this.#input], options);
	}

	time(options) {
		return this.#param('Time', parseTime, [this.#input], options);
	}

	#generateErrorUsageString(i) {
		const name = `${this.#prefix}${this.#command.name}`;

		const params = this.#outArgs.reduce((output, value) => {
			return `${output} ${value.required ? '<' : '['}${value.name}${
				value.required ? '>' : ']'
			}`;
		}, '');

		const usage = `${name}${params}`;

		const errorName = `${this.#outArgs[i].required ? '<' : '['}${
			this.#outArgs[i].name
		}${this.#outArgs[i].required ? '>' : ']'}`;
		const errorIndex = params.indexOf(errorName);

		const leftSideSpace = errorIndex;
		const arrowAmount = errorName.length;
		const rightSideSpace = params.length - leftSideSpace - arrowAmount;

		const arrowString =
			' '.repeat(name.length) +
			' '.repeat(leftSideSpace) +
			'^'.repeat(arrowAmount) +
			' '.repeat(rightSideSpace);

		return `\`${usage}\`\n\`${arrowString}\`\n\n`;
	}

	#isObject(value) {
		return (
			value !== null &&
			value !== undefined &&
			typeof value === 'object' &&
			Object.getPrototypeOf(value)?.constructor?.name === 'Object'
		);
	}
	#isEmpty(value) {
		if (value instanceof Array) return value.length === 0;
		return !value;
	}

	/**
	 *
	 * @param {Object} options
	 * @param {Boolean} [options.ignoreErrors=false]
	 * @param {Boolean} [options.abortOnError=false]
	 * @returns {Promise<Array>}
	 */
	async execute(options = {}) {
		const ignoreErrors = options.ignoreErrors ?? false;
		const abortOnError = options.abortOnError ?? false;

		const output = [];
		let overflow = [];

		for (const [i, value] of Object.entries(this.#outArgs)) {
			try {
				if (value.default !== undefined && this.#isEmpty(value.input)) {
					output.push(value.default);
					overflow = [];
					continue;
				}

				if (!this.#isEmpty(overflow)) value.args[0].unshift(overflow);
				output.push(await value.func(...value.args));
				overflow = [];
			} catch (error) {
				if (abortOnError) return false;

				overflow = [];
				if (value.useOverflow) {
					overflow = value.input;
					output.push(value.default ?? null);
					continue;
				}

				if (ignoreErrors || !value.required) {
					output.push(this.default ?? null);
					continue;
				}

				if (error.isOperational)
					error.message = `${this.#generateErrorUsageString(i)}${error.message}`;

				throw error;
			}
		}

		return output;
	}
}

module.exports = args => new Parse(args);
