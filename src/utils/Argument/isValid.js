const discord = require("discord.js");

/**
 *
 * @param {discord.Message} message
 * @returns {Promise<Boolean>}
 */
const isValid = (message, prefix) => {
  const guild = message?.guild;

  if (!guild?.available || message.channel.type === "dm") {
    return !message.content.startsWith(prefix) || message.author.bot;
  }

  return !message.content.startsWith(prefix) || message.author.bot;
};

module.exports = isValid;
