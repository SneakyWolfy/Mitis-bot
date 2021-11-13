const { successEmbed } = require('./Provider/embed');
const rh = require('./ResponseHandler');

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

// eslint-disable-next-line no-unused-vars
const Argument = require('./Argument');

module.exports = class MessageHandler {
	#isExited = false;
	#botMessage = null;
	#filter = m => this.options.owner.id === m.author.id;

	/**
	 *
	 * @param {Array[String]} data
	 * @param {Argument} args
	 * @param {Object} options
	 */
	constructor(data, args, options) {
		this.options = Object.assign(
			{
				owner: args.author,
				timeout: 60000,
				update: true,
				deleteMessage: true,
				cancelKeyword: 'q',
				skipKeyword: 's',
				title: '',
				footer: 'type "q" to quit | "s" to skip to next option',
			},
			options,
		);

		this.messageOptions = {
			max: 1,
			time: this.options.timeout,
			errors: ['time'],
		};

		this.ownerID = this.options.owner ?? args.author.id;
		this.message = args.message;
		this.data = data;

		this.embed = successEmbed()
			.setTitle(this.options.title)
			.setFooter(this.options.footer);
	}

	async #prompt(message = '', format = (e, m) => e.setDescription(m)) {
		const embed = await format(this.embed, message);

		await this.#sendEmbed(embed);

		return await this.message.channel.awaitMessages(
			this.#filter,
			this.messageOptions,
		);
	}

	async #sendEmbed(embed) {
		//? If this is the first message, creates a message.1
		if (!this.#botMessage)
			this.#botMessage = await this.message.channel.send(embed);
		//? If this a response, edit the old message.
		else await this.#botMessage.edit('', { embed });
	}

	async #finish() {
		const embed = successEmbed().setTitle('Finished!');
		await this.#sendEmbed(embed);

		setTimeout(async () => {
			await this.#botMessage.delete();
		}, 3000);
	}

	/**
	 * @param {function(Discord.Message, any, Number):String} callback - Response message, current value, index. Returns feedback
	 * @param {function(Discord.MessageEmbed, any):Discord.MessageEmbed} format - current embed, current value. Return the embed.
	 */
	async send(callback, format) {
		try {
			//? Iterates over all key value pairs
			for (const [index, message] of this.data.entries()) {
				//? Prevents new prompts from appearing if user has typed "exit"
				if (this.#isExited) break;

				//? Prompts the user with a message to respond to.
				//? The first response from the owner will be resoled
				const response = await this.#prompt(message, format);
				const resMessage = response.first();

				//? Exits the control if the user exits
				if (this.#checkExit(resMessage)) break;

				//? Prevents the callback from running if the user skips
				if (await this.#checkSkip(resMessage)) {
					await resMessage.delete();
					continue;
				}

				//? Executes the callback, if the callback returns a string, then it will send it in the current channel
				const callbackRes = await callback(resMessage, message, index);

				const sentMessage = await rh.send(callbackRes, this.message.channel);
				setTimeout(async () => {
					if (sentMessage) {
						await sentMessage.delete();
					}
				}, 3000);

				//? deletes the user's response message
				await resMessage.delete();
			}
			await this.#finish();
		} catch (error) {
			this.#onTimeout();
		}
	}

	#onTimeout() {
		this.#isExited = true;
	}

	async #checkSkip(response) {
		return response.content.toLowerCase().trim() === this.options.skipKeyword;
	}

	#checkExit(response) {
		return response.content.toLowerCase().trim() === this.options.cancelKeyword;
	}
};
