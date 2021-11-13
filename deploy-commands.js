require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');
const App = require('./src/models/appModel');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {
	CLIENT_ID: clientId,
	GUILD_ID: guildId,
	BOT_TOKEN: token,
} = process.env;

App.loadCommands();

const { commands } = App.state.client;

// const commands = [
// 	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
// 	new SlashCommandBuilder()
// 		.setName('server')
// 		.setDescription('Replies with server info!'),
// 	new SlashCommandBuilder()
// 		.setName('user')
// 		.setDescription('Replies with user info!'),
// ].map(command => command.toJSON());

// const rest = new REST({ version: '9' }).setToken(token);

// rest
// 	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);
