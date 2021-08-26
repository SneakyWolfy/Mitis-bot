const Command = require("../utils/Command");
const config = require("../config.js");
const Discord = require("discord.js");
const App = require("../models/appModel.js");
const RM = require("../utils/ResponseHandler");
const ConfigModel = require("../models/configModel");
const Argument = require("../utils/Argument");
const helpController = require("../controllers/helpController");

class Help extends Command {
  constructor() {
    super({
      description: "Provides information about available commands",
      usage: "[Command]",
      aliases: ["info"],
      cooldown: 3,
      cooldownImmune: ["mod"],
      flags: { ...RM.defaults },
    });
  }

  override() {}

  /** @param {Argument} args */
  async action(args) {
    const embed =
      args.length === 0
        ? await helpController.getAllCommandInfo(args.message.guild)
        : await helpController.infoCommand(args.args[0], args.message.guild);

    return embed;
  }
}

module.exports = new Help();
