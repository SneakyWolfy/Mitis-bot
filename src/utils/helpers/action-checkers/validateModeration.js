const AppError = require('../../AppError');
const parseMember = require('../../Parse/parseMember');
const getHighestRole = require('../roles/getHighestRole');
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
/**
 * @param {Discord.User} moderator The moderator using the command
 * @param {Discord.User} recipient The recipient being moderated
 * @param {Discord.Guild} guild The guild the command was used
 */
exports.validateModeration = async (moderator, recipient, guild) => {
	if (moderator.id === recipient.id)
		throw new AppError('Stop That', 'Cannot use this command on yourself.');

	const recipientMember = await parseMember(recipient.id, guild).catch(() => {});
	if (!recipientMember) return;

	const moderatorMember = await parseMember(moderator.id, guild);

	const highestModRole = getHighestRole(moderatorMember.roles.cache);
	const highestRecipientRole = getHighestRole(recipientMember.roles.cache);

	if (highestModRole.rawPosition <= highestRecipientRole.rawPosition)
		throw new AppError(
			'Invalid Recipient',
			'Cannot use this command on a member with an equal or higher role position.',
		);

	return true;
};
