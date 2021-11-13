// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
/**
 * @param {Discord.User} recipient The recipient being moderated
 * @param {Discord.Guild} guild The guild the command was used
 * @returns {Promise<Discord.GuildMember>} The guild member found in the server.
 */
module.exports = async (user, guild) => {
	const guildMembers = await guild.members.fetch();
	return guildMembers.find(member => {
		return member.user.id === user.id;
	});
};
