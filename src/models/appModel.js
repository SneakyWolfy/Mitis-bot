const Discord = require("discord.js");
const fs = require("fs");
const App = require("./appModel");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.config = new Discord.Collection();

const state = {
  client,
};
exports.state = state;

exports.getJSFiles = (relPath, dir = __dirname) => {
  return fs
    .readdirSync(`${dir}${relPath}`)
    .filter((file) => file.endsWith(".js"));
};

exports.addCommand = (relPath, file) => {
  const command = require(`${relPath}/${file}`);
  client.commands.set(command.name.toLowerCase(), command);
  command.aliases.forEach((alias) =>
    client.commands.set(alias.toLowerCase(), command)
  );
};

/**
 * @param {Discord.Snowflake} guildID
 * @param {Object} options
 * @param {Discord.TextChannel} options.channel - The default channel for when there's no key
 * @param {Boolean} options.require - Only log when there's a key
 * @param {String} options.key - The config option of the type of channel to fetch
 * @returns {Discord.TextChannel} The fetched channel
 */
exports.getChannelId = (guildID, options) => {
  const guildConfig = this.getConfig(guildID);
  const defaultOutput = guildConfig?.[`log_default`];
  const messageChannel = options.channel?.id ?? false;

  const defaultChannel = options.require
    ? false
    : messageChannel ?? defaultOutput ?? false;

  if (!options.key) return defaultChannel;

  const outputChannel = guildConfig?.[`log_${options.key}`] ?? defaultChannel;

  return outputChannel;
};

exports.log = async (content, guild, options = {}) => {
  const outputChannel = App.getChannelId(guild.id, options);
  if (!outputChannel) return;

  //some validation
  const channel = this.parseChannel(outputChannel, guild);

  if (!channel)
    throw new Error(`Couldn't resolve the channel ${outputChannel}`);

  if (content instanceof Discord.MessageEmbed)
    return await channel.send(content);

  return await channel.send(content, { allowedMentions: { users: [] } });
};
