const Discord = require('discord.js');
const fs = require('fs');

const flags = Discord.Intents.FLAGS;
const appIntents = [flags.GUILDS, flags.GUILD_MESSAGES];

const client = new Discord.Client({ intents: appIntents });

client.commands = new Discord.Collection();
client.bans = new Discord.Collection();
client.mutes = new Discord.Collection();

client.config = new Discord.Collection();
client.timeouts = new Discord.Collection();
client.intervals = new Discord.Collection();

const state = {
	client,
};
exports.state = state;

exports.getJSFiles = (relPath, dir = __dirname) => {
	return fs.readdirSync(`${dir}${relPath}`).filter(file => file.endsWith('.js'));
};

exports.loadCommands = () => {
	try {
		const commandFiles = this.getJSFiles('/../commands');
		commandFiles.forEach(file => this.addCommand('../commands', file));
	} catch (error) {
		console.error(error);
		console.error(`Issue with Reading and loading commands: ${error}`);
	}
};

exports.addCommand = (relPath, file) => {
	const command = require(`${relPath}/${file}`);
	client.commands.set(command.name.toLowerCase(), command);
	command.aliases.forEach(alias =>
		client.commands.set(alias.toLowerCase(), command),
	);
};
