const App = require('../models/appModel');
const AppError = require('../utils/AppError');
const getConfigRole = require('../utils/helpers/roles/getConfigRole');
const { defaultEmbed } = require('../utils/Provider/embed');
// eslint-disable-next-line no-unused-vars
const Command = require('../utils/Command');
const View = require('../utils/View');
const { getPrefix } = require('./configController');
const getUniqueValues = require('../utils/helpers/getUniqueValues');

exports.infoCommand = async (commandName, guild) => {
	const prefix = await getPrefix(guild.id);
	const { commands } = App.state.client;

	if (!commands.has(commandName))
		throw new AppError(
			'Invalid Command Name',
			`Could not find the command \`${commandName}\`.`,
		);

	/** @type {Command} */
	const command = commands.get(commandName);
	const embed = defaultEmbed();

	//formatted output
	embed.setTitle(command.name);
	embed.setDescription(command.description);
	embed.addField('Usage', command.getFullUsage(prefix), true);

	if (command.aliases.length > 0)
		embed.addField('Aliases', command.aliases.join(', '), true);

	if (command.reqPermissions.length > 0)
		embed.addField(
			'Required Permissions',
			command.reqPermissions.join(', '),
			true,
		);

	if (command.roleWhitelist.length > 0) {
		const roleList = [];
		for (const role of command.roleWhitelist) {
			const configRole = await getConfigRole(role, guild);
			roleList.push(configRole);
		}

		embed.addField('Required Roles', roleList, true);
	}

	//Sets up flag values
	const flagLength = Object.keys(command.flags).reduce(
		(a, flag) => (a.length > flag.length ? a : flag),
		0,
	).length;

	const flagValues = [];
	for (const [name, description] of Object.entries(command.flags)) {
		flagValues.push(`\`--${name.padEnd(flagLength, ' ')}\` - ${description}`);
	}

	if (flagValues.length > 0) embed.addField('Flags', flagValues);

	return embed;
};

/**
 *
 * @param {Object} options
 * @param {String} [options.prefix="!"]
 * @returns {MessageEmbed}
 */
exports.getAllCommandInfo = async guild => {
	const prefix = await getPrefix(guild.id);

	const commands = App.state.client.commands;
	const allUniqueCommands = getUniqueValues(commands).sort((a, b) =>
		a.name >= b.name ? 1 : -1,
	);

	const embed = defaultEmbed()
		.setTitle('All Available Commands')
		.setThumbnail(View.getGuildIcon(guild))
		.setDescription(
			`Find more information about each command using \`${commands
				.get('help')
				.getUsage(prefix)}\``,
		)
		.setFooter(`version ${require('../../package.json').version}`);

	const commandGroups = {};

	allUniqueCommands.forEach(cmd => {
		const category = cmd.category ?? 'Miscellaneous';
		const commandGroup = commandGroups[category] ?? [];
		commandGroup.push(cmd);
		commandGroups[category] = commandGroup;
	});

	for (const [name, group] of Object.entries(commandGroups)) {
		const longestCommand = group.reduce(
			(a, v) => (a.name.length > v.name.length ? a : v),
			group[0],
		);

		const value = group.map(command => {
			const commandName = `${prefix}${command.name}`.padEnd(
				longestCommand.name.length + prefix.length,
			);

			const usage =
				command.usage.length > 0 ? `\`${command.getPartialUsage(prefix)}\`` : ``;

			return `**\`${commandName}\`** ${usage}`;
		});
		embed.addField(name, value.join('\n'), false);
	}

	return embed;
};
