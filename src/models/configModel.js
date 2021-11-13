const mongoose = require('mongoose');
const defaultConfig = require('../config');
const parseRole = require('../utils/Parse/parseRole');
const parseGuild = require('../utils/Parse/parseGuild');
const parseChannel = require('../utils/Parse/parseChannel');
const { state } = require('./appModel');
const parseTime = require('../utils/Parse/parseTime');
const ms = require('ms');
const AppError = require('../utils/AppError');

const roleType = { type: String, default: null, validate: roleValidator };
const roleSchema = new mongoose.Schema({
	muted: roleType,
	mod: roleType,
	admin: roleType,
});

const configSchema = new mongoose.Schema({
	guildID: {
		type: String,
		required: [true, 'A guild id must be provided'],
		unique: [true, 'A guild id must be unique'],
	},
	prefix: {
		type: String,
		default: defaultConfig.prefix,
		set: v => (v === undefined || v === null ? defaultConfig.prefix : v),
		validate: prefixValidator,
	},
	roles: {
		type: roleSchema,
		default: () => ({}),
	},
	autodelete: {
		type: Number,
		validate: timeValidatorWithinMinute,
		set: v =>
			v === undefined || v === null
				? ms(defaultConfig.autoDeleteTime)
				: parseTime(v),
		get: v => {
			return ms(v, { long: true });
		},
		default: defaultConfig.autoDeleteTime,
	},
	talkchannel: {
		type: String,
		validate: channelMiscValidator,
	},
});

configSchema.index({ guildID: 1 });

configSchema.post('save', async function (doc) {
	const guildID = doc.guildID;
	const stateConfig = state.client.config;

	stateConfig?.set(guildID, doc);
});

exports.metaData = {
	prefix: {
		name: 'Prefix',
		type: 'character',
		description: "The guild's prefix",
		default: defaultConfig.prefix,
	},
	smod: {
		name: 'Senior Moderator Role',
		type: '@role',
		description: 'Senior Moderator',
	},
	mod: {
		name: 'Moderator Role',
		type: '@role',
		description: 'Moderator',
	},
	jmod: {
		name: 'Junior Moderator Role',
		type: '@role',
		description: 'Junior Moderator',
	},
	muted: {
		name: 'Muted Role',
		type: '@role',
		description: 'The Muted Role',
	},
	mute: {
		name: 'Mute Logs',
		type: '#channel',
		description: 'The channel where each mute is recorded to.',
	},
	ban: {
		name: 'Ban Logs',
		type: '#channel',
		description: 'The channel where each ban is recorded to.',
	},
	damage: {
		name: 'Damage Logs',
		type: '#channel',
		description: 'The channel where each damage is recorded to.',
	},
	audit: {
		name: 'Audit Logs',
		type: '#channel',
		description: 'The channel where each audit is recorded to.',
	},
	talkchannel: {
		name: 'Talk Channel',
		type: '#channel',
		description: 'The channel where you can interact with the bot',
	},
	default: {
		name: 'Default Logs',
		type: '#channel',
		description:
			'The default channel a log will be sent to if a specific one does not exist.',
	},
	appeal: {
		name: 'Appeal Message',
		type: 'Message',
		description:
			"A customizable message that will be sent to a user's DMs if they get banned.",
	},
	autodelete: {
		name: 'Auto Delete Response',
		type: 'Time',
		description:
			'The amount of time until a command will automatically delete itself.\n\nTime values must be between 0-60 seconds.\nSet time value to 0 to disable this feature.',
		default: defaultConfig.autoDeleteTime,
	},
};

exports.fetchConfig = async guildID => {
	const stateConfig = state.client.config;
	const guildConfig = stateConfig.get(guildID);

	if (guildConfig) return guildConfig;

	const config = await Config.findOne({ guildID });
	if (config) return config;

	const newConfig = Config.create({ guildID });
	stateConfig.set(guildID, newConfig);

	return newConfig;
};

exports.resetConfigState = async guildID => {
	const stateConfig = state.client.config;
	const config = await Config.findOne({ guildID });

	if (config) {
		stateConfig.set(guildID, config);
		return config;
	}

	const newConfig = Config.create({ guildID });
	stateConfig.set(guildID, newConfig);

	return newConfig;
};

const Config = mongoose.model('Config', configSchema);
exports.Config = Config;

function prefixValidator(val) {
	if (val.length > 3)
		throw new AppError(
			'Invalid Prefix',
			'Prefix too long. Keep it 3 characters or lower.',
		);

	if (val.length === 0)
		throw new AppError('Invalid Prefix', `No prefix provided!`);

	return val;
}
async function roleValidator(val) {
	if (val === null) return true;

	const guild = await parseGuild(this.parent().guildID);
	const role = await parseRole(val, guild);

	return Boolean(role);
}

async function channelMiscValidator(val) {
	if (val === null) return true;

	const guild = await parseGuild(this.guildID);
	const channel = await parseChannel(val, guild);

	return Boolean(channel);
}

async function timeValidatorWithinMinute(val) {
	if (!Number.isInteger(val))
		throw new AppError('Validation Error', 'Time value must be a whole number.');
	if (val < 0)
		throw new AppError(
			'Validation Error',
			'Time value must be greater or equal to zero.',
		);
	if (val > ms('1m'))
		throw new AppError(
			'Validation Error',
			'Time value must be less than or equal to one minute.',
		);

	return true;
}
