require('dotenv').config();

const server = require('./server.js');
const App = require('./src/models/appModel.js');
const client = App.state.client;
const commandMessageHandler = require('./src/handlers/commandMessageHandler');
const interactionHandler = require('./src/handlers/interactionHandler.js');

process.on('unhandledRejection', err => {
	console.log('Uncaught Rejection!');
	console.warn(err);
});

const restrictTo = async guildIdString => {
	try {
		const guildIds = guildIdString.split(',');
		const guilds = client.guilds.cache;

		const whitelistIdPromises = guildIds.map(async id => {
			return (await client.guilds.fetch(id)).id;
		});

		const resolvedIds = await Promise.all(whitelistIdPromises);

		const leftGuilds = await Promise.all(
			guilds
				.filter(guild => !resolvedIds.some(id => id === guild.id))
				.map(async guild => {
					await guild.leave();
					return guild.name;
				}),
		);

		if (!leftGuilds || leftGuilds.length === 0)
			return console.log(
				'This bot is currently operating in its specified guilds.',
			);

		console.log(
			`This bot has left (${leftGuilds.length}) guild(s) that did not match the whitelisted guilds.`,
		);
	} catch (error) {
		switch (error.message) {
			case 'Missing Access':
				return console.log(
					'Aborting guild filtering: This bot is currently not in one of the whitelisted servers. Please invite the bot to the server and then reset the bot.',
				);
			default:
				return console.log(
					`\nSomething went wrong with restricting guilds. Ensure the environment variable "RESTRICT_TO_GUILD" is in the format \nRESTRICT_TO_GUILD=id,id,id\nError Message: ${error.message}\n`,
				);
		}
	}
};

const finalize = async () => {
	if (process.env.RESTRICT_TO_GUILD && process.env.USE_WHITELIST === 'true')
		await restrictTo(process.env.RESTRICT_TO_GUILD);

	console.log(
		`Bot is ready, Currently listening to ${client.guilds.cache.reduce(
			a => a + 1,
			0,
		)} guild(s)`,
	);
};

const init = async () => {
	client.once('ready', finalize);
	await server.init();
	App.loadCommands();

	console.log('Commands Loaded');
	client.on('messageCreate', commandMessageHandler);
	client.on('messageCreate', interactionHandler);
};
init();
