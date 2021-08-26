const { Message } = require("discord.js");
const Argument = require("../utils/Argument");
const App = require("../models/appModel");
const { handelError } = require("../controllers/errorController");
const { getPrefix } = require("./configController");
/**
 * @param {Message} message message sent in any channel
 * @description Handles all messages coming from all servers and interprets them as viable commands.
 */
const commandMessageHandler = async (message) => {
  const prefix = await getPrefix(message?.guild?.id);

  if (Argument.isValid(message, prefix)) return;

  const args = new Argument(message, prefix);
  const { commands } = App.state.client;

  if (!commands.has(args.commandName)) return;
  args.command = commands.get(args.commandName.toLowerCase());

  try {
    await args.command.execute(args);
  } catch (error) {
    await handelError(error, args.message.channel);
  }
};

module.exports = commandMessageHandler;
