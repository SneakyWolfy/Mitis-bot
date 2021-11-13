// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { handelError } = require('../controllers/errorController');
const { fetchConfig } = require('../models/configModel');
/**
 * @param {Discord.Message} message message sent in any channel
 * @description Handles all messages coming from all servers and interprets them as viable commands.
 */
const interactionHandler = async message => {
	const config = await fetchConfig(message.guild.id);

	if (message.author.bot) return;
	if (config.talkchannel !== `<#${message.channel.id}>`) return;

	try {
		await interaction(message);
	} catch (error) {
		await handelError(error, message.channel);
	}
};

const promptUser = (message, filter) => async prompt => {
	await message.reply(prompt);
	const collected = await message.channel.awaitMessages({
		filter,
		max: 1,
		time: 10000,
	});

	return collected.first().content;
};

const bookRoom = async message => {
	const roomTicket = {
		roomNumber: 0,
		roomService: false,
		duration: 0,
		messages: {
			roomNumber:
				'Choose a room (# between 1 - 300)\nElegir una habitación (# entre 1 - 300)',
			invalidRoom:
				'Your input is invalid or NaN. Please try again.\nSu entrada no es inválida o NaN. Por favor vuelve a intentarlo. ',
			get roomService() {
				return `Great! I've booked room ${roomTicket.roomNumber} for you. Would you like room service along with that?`;
			},
			get stayLength() {
				return `Alright I've arranged ${
					roomTicket.roomService ? '' : 'no '
				}room service for you. How long would you like to stay? [#1 - 30 in days]`;
			},
			get confirmation() {
				return `Alright, you have room ${roomTicket.roomNumber} for ${
					roomTicket.duration
				} days with ${
					roomTicket.roomService === true ? 'room service' : 'no room service'
				}. Is this correct?`;
			},
		},
	};

	const filter = m => m.author.id === message.author.id;
	const prompter = promptUser(message, filter);

	try {
		//? Book Room Number
		const roomNumber = await prompter(roomTicket.messages.roomNumber);

		if (!Number(roomNumber))
			return await message.reply(roomTicket.messages.invalidRoom);

		roomTicket.roomNumber = Number(roomNumber);

		//? Book Room Service
		const roomService = await prompter(roomTicket.messages.roomService);
		roomTicket.roomService = roomService.toLowerCase() === 'yes' ? true : false;

		//? Book Room Length
		const stayLength = await prompter(roomTicket.messages.stayLength);
		roomTicket.duration = Number(stayLength);

		//? Confirm Room
		const confirmation = await prompter(roomTicket.messages.confirmation);

		confirmation.toLowerCase() === 'yes'
			? message.reply('Booking Completed!')
			: message.reply('Please book again with the correct information.');
	} catch (error) {
		await message
			.reply('Contract has expired! Please try again.')
			.catch(() => {});
	}
};

/**
 *
 * @param {Discord.Message} message
 */
const interaction = async message => {
	if (message.content === '+bookRoom') bookRoom(message);
};
module.exports = interactionHandler;
