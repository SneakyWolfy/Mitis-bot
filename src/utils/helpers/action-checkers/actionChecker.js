// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const findMember = require('./findMember');
const App = require('../../../models/appModel');
const AppError = require('../../AppError');
const getHighestRole = require('.././roles/getHighestRole');
const parseMember = require('../../Parse/parseMember');

/**
 * @param {Discord.User} user The moderator using the command
 * @param {Discord.Guild} guild The guild the command was used
 */
module.exports = (permission, options) => async (user, guild) => {
	const botMember = await findMember(App.state.client.user, guild);
	if (!botMember.hasPermission(permission))
		throw new AppError(
			'Missing Permissions',
			`I require \`${permission}\` permission to perform that action.`,
		);

	const member = await parseMember(user.id, guild).catch(() => {});
	if (!member) {
		if (options.outsideGuild) return true;

		throw new AppError('Member Not Found', `That member is not in this server.`);
	}

	const botPermission = getHighestRole(botMember.roles.cache).rawPosition;
	const memberPermission = getHighestRole(member.roles.cache).rawPosition;

	if (memberPermission >= botPermission)
		throw new AppError(
			'Invalid Member',
			"That member's role position is greater or higher than mine!",
		);

	if (guild.ownerID === member.id)
		throw new AppError(
			'Invalid Member',
			'Cannot perform this action on the owner!',
		);

	return true;
};
