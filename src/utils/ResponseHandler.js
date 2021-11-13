const Discord = require('discord.js');
const configModel = require('../models/configModel');
const ms = require('ms');

class ResponseHandler {
	get defaults() {
		return {
			dm: 'Send the command response to your DM',
			silent: 'Hide the command response',
			delete: 'Immediately deletes your command message',
			keep: 'Prevents message from being automatically removed',
		};
	}

	/**
	 *
	 * @param {Pagination} pagination
	 * @param {Discord.Message} message - The commands message object
	 * @param {Argument} args - The commands arguments
	 * @param {Object} [flags] - Optional flags to be in use
	 * @param {boolean} [flags.dm=false]
	 * @param {boolean} [flags.silent=false]
	 * @param {boolean} [flags.delete=false]
	 */
	async outputPagination(pagination, args, flags) {
		if (!pagination || !args) return;

		const { useDM, useSilent, useDelete } = this.getFlagBooleans(args, flags);

		if (useDelete && args.message.deletable) await args.message.delete();
		if (useSilent) return;
		if (useDM) return await pagination.dm(args.message.author);

		await pagination.send(args.channel);
	}

	async sendResponse(content, channel) {
		if (content instanceof Discord.MessageEmbed)
			return await channel.send({ embeds: [content] });

		return await channel.send(content, {
			allowedMentions: { users: [] },
		});
	}

	getFlagBooleans(args, flags = {}) {
		return {
			useDelete: flags.dm && args.flags.has('delete'),
			useSilent: flags.silent && args.flags.has('silent'),
			useDM: flags.dm && args.flags.has('dm'),
			useKeep: flags.keep && args.flags.has('keep'),
		};
	}

	/**
	 *
	 * @param {String} content - The Message's content
	 * @param {Argument} args - The commands arguments
	 * @param {Object} [flags] - Optional flags to be in use
	 * @param {boolean} [flags.dm=false]
	 * @param {boolean} [flags.silent=false]
	 * @param {boolean} [flags.delete=false]
	 */
	async output(content, args, flags = {}) {
		if (!content || !args.message || !args) return;

		const { useDM, useSilent, useDelete, useKeep } = this.getFlagBooleans(
			args,
			flags,
		);

		if (useDM && args.message.deletable) await args.message.delete();
		if (useSilent) return;
		if (useDelete) return await this.sendUser(args.message.author, content);

		await this.sendAutoDelete(content, args.channel, useKeep);
	}

	async sendAutoDelete(content, channel, keep = false) {
		const response = await this.sendResponse(content, channel);
		const configData = await configModel.fetchConfig(channel.guild.id);

		const autoDeleteTime = ms(configData?.autodelete ?? 0);

		if (autoDeleteTime && !keep) {
			setTimeout(async () => {
				await response.delete().catch(() => {});
			}, autoDeleteTime);
		}
	}

	async send(content, channel) {
		if (!content) return;

		if (content instanceof Discord.MessageEmbed)
			return await channel.send(content);

		return await channel.send(content, {
			allowedMentions: { users: [] },
		});
	}

	async sendUser(user, message) {
		return await user.send(message).catch(() => {});
	}
}

module.exports = new ResponseHandler();
