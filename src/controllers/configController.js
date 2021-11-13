const defaultConfig = require('../config');
const {
	Config,
	fetchConfig,
	metaData,
	resetConfigState,
} = require('../models/configModel');
const { successEmbed, defaultEmbed } = require('../utils/Provider/embed');
const View = require('../utils/View');
const AppError = require('../utils/AppError');
const filterObj = require('../utils/helpers/filterObj');
const MessageHandler = require('../utils/MessageHandler');

exports.fetchConfig = fetchConfig;

exports.getPrefix = async guildID => {
	if (!guildID) return defaultConfig.prefix;

	const config = await this.fetchConfig(guildID);
	return config.prefix;
};

exports.getAll = async guildID => {
	const out = [];
	const config = await this.fetchConfig(guildID);
	const filter = k => k !== '_id';

	out.push({
		name: 'Roles',
		value: filterObj(config.roles.toJSON(), filter),
	});
	out.push({
		name: 'Miscellaneous',
		value: {
			prefix: await this.getPrefix(guildID),
			appeal: config.appeal,
			autodelete: config.autodelete,
			talkchannel: config.talkchannel,
		},
	});
	return out;
};

exports.getAllFlat = async guildID => {
	const out = [];
	const configs = await this.getAll(guildID);

	for (const config of configs) {
		if (!(config.value instanceof Object)) {
			out.push({ name: config.name, value: config.value, parent: null });
			continue;
		}

		Object.entries(config.value).forEach(([name, value]) =>
			out.push({ name, value, parent: config.name }),
		);
	}
	return out;
};

exports.deleteAll = async guild => {
	await Config.deleteOne({ guildID: guild.id });

	await resetConfigState(guild.id);

	return successEmbed()
		.setTitle('Success')
		.setDescription('The Config has been fully reset!')
		.addField(
			View.emptyField,
			'The prefix has been set to `!`\nUse `!config setup` to setup your new config.',
		)
		.setThumbnail(View.getGuildIcon(guild));
};

exports.renderAll = async guild => {
	const embed = successEmbed()
		.setTitle(`Config for ${guild.name}`)
		.setThumbnail(View.getGuildIcon(guild));

	const configs = await this.getAll(guild.id);

	for (const config of configs) {
		const configName = config.name;
		let configValue = '';

		if (config.value instanceof Object) {
			const values = Object.entries(config.value);
			const longestName = values.reduce(
				(a, [name]) => (a > name.length ? a : name.length),
				0,
			);
			const formatName = name =>
				(name[0].toUpperCase() + name.substring(1)).padStart(longestName, ' ');

			const formatValue = value => `${value ?? '*Not Set*'}`;

			configValue = values.reduce(
				(out, [name, value]) =>
					`${out}\n\`${formatName(name)} \` ${formatValue(value)}`,
				'',
			);
		} else {
			configValue = config.value ?? '*Not Set*';
		}
		embed.addField(configName, configValue, false);
	}

	return embed;
};

exports.getOne = async (guild, value) => {
	const config = await this.fetchConfig(guild.id);

	let configValue = '';
	const configName = value.name;
	const configMeta = metaData?.[configName.toLowerCase()];

	if (value.parent && value.parent !== 'Miscellaneous') {
		configValue = config[value.parent.toLowerCase()]?.[value.name.toLowerCase()];
	} else {
		configValue = config[value.name.toLowerCase()];
	}

	return {
		value: configValue,
		name: configName,
		meta: configMeta,
		parent: value.parent,
	};
};

exports.deleteOne = async (guild, value) => {
	const config = await this.fetchConfig(guild.id);
	const configMeta = metaData?.[value.name.toLowerCase()];

	if (value.parent && value.parent !== 'Miscellaneous') {
		config[value.parent.toLowerCase()][value.name.toLowerCase()] = null;
	} else {
		config[value.name.toLowerCase()] = null;
	}

	await config.save();
	await resetConfigState(guild.id);

	return successEmbed()
		.setTitle('Success')
		.setDescription(`\`${configMeta.name}\` has been successfully reset.`);
};

exports.renderOne = async (guild, value) => {
	const config = await this.getOne(guild, value);
	const defaultValue = config?.meta?.default;

	const embed = defaultEmbed()
		.setTitle(`${config.meta.name}`)
		.setThumbnail(View.getGuildIcon(guild))
		.setDescription(config?.meta?.description ?? '')
		.addField(
			'Current value',
			config.value || config?.meta?.default || 'Not set',
			true,
		)
		.setFooter(
			`Change ${config.name} with ${await this.getPrefix(guild.id)}config ${
				config.name
			} <value>`,
		);

	if (defaultValue && defaultValue !== config.value)
		embed.addField('Default value', defaultValue, true);

	return embed;
};

exports.setup = async args => {
	const configs = await this.getAllFlat(args.guild.id);
	const unsetConfigs = configs.filter(config => !config.value);
	const messageHandler = new MessageHandler(unsetConfigs, args);

	const handler = async (message, value) => {
		try {
			return await this.updateOne(args.guild, value, message.content);
		} catch (error) {
			return error;
		}
	};

	const formatter = (embed, value) => {
		const meta = metaData[value.name];

		return embed.setTitle(`Set ${meta?.name ?? value.name}?`).setDescription(
			`${meta?.description ?? ''}
        
        **Expects:** \`${meta?.type ?? value.name}\`
        **Current Value:** \`${value.value ?? 'Not Set'}\`
        ${meta?.default ? `**Default Value:** \`${meta.default}\`` : ''}`,
		);
	};

	messageHandler.send(handler, formatter);
};

const findParent = (originalConfig, config) => {
	if (!originalConfig.parent || originalConfig.parent === 'Miscellaneous')
		return config;

	return config[originalConfig.parent.toLowerCase()];
};

exports.updateOne = async (guild, original, value) => {
	const originalConfig = await this.getOne(guild, original);
	const config = await this.fetchConfig(guild.id);
	const data = findParent(originalConfig, config);
	const key = originalConfig.name.toLowerCase();

	data[key] = value;

	await config.save({ validateBeforeSave: true }).catch(error => {
		throw new AppError('Invalid Data', `${error.message}`);
	});

	return successEmbed()
		.setTitle('Config Updated')
		.setDescription(`${originalConfig.name} has been set to \`${data[key]}\``);
};
