const Command = require("../utils/Command");
const RM = require("../utils/ResponseHandler");
const Argument = require("../utils/Argument");
const configController = require("../controllers/configController");
const Parse = require("../utils/Parse");
const AppError = require("../utils/AppError");

class Config extends Command {
  constructor() {
    super({
      description: `Configure your guilds defaults.`,
      usage: "[Option] [Value]",
      flags: { ...RM.defaults },
      guildOnly: true,
    });
  }

  async override(args) {
    const configs = await configController.getAllFlat(args.guild.id);
    args.configOptions = configs.map((config) => config.name.toLowerCase());

    let parseRes;

    if (args.length === 0) {
      //? Display All
      args.type = "READ_MANY";
      return {};
    }

    if (args.length === 1) {
      //? Setup All
      parseRes = await Parse(args)
        .enum(["setup"])
        .execute({ abortOnError: true });
      if (parseRes) {
        args.type = "UPDATE_MANY";
        return { reqPermissions: ["ADMINISTRATOR"] };
      }

      //? Display One
      parseRes = await Parse(args).enum(args.configOptions).execute();
      if (parseRes) {
        args.type = "READ_ONE";
        args.params = parseRes;
        return {};
      }
    }

    if (args.length === 2) {
      //? Reset One
      parseRes = await Parse(args)
        .enum(["reset"])
        .execute({ abortOnError: true });
      if (parseRes) {
        args.type = "DELETE_ONE";
        return { reqPermissions: ["ADMINISTRATOR"] };
      }

      //? Reset All
      parseRes = await Parse(args)
        .enum(["reset"])
        .enum(["all"])
        .execute({ abortOnError: true });
      if (parseRes) {
        args.type = "DELETE_MANY";
        return { reqPermissions: ["ADMINISTRATOR"] };
      }
    }

    if (!parseRes) {
      //? Update One
      parseRes = await Parse(args).enum(args.configOptions).message().execute();
      if (parseRes) {
        args.type = "UPDATE_ONE";
        args.params = parseRes;
        return { reqPermissions: ["ADMINISTRATOR"] };
      }
    }

    return {};
  }

  /** @param {Argument} args */
  async action(args) {
    let output;
    const configs = await configController.getAllFlat(args.guild.id);
    let value;

    switch (args.type) {
      case "READ_ONE":
        value = configs.find(
          (config) => config.name.toLowerCase() === args.params[0]
        );

        output = await configController.renderOne(args.guild, value);
        break;

      case "READ_MANY":
        output = await configController.renderAll(args.guild);
        break;

      case "UPDATE_ONE":
        value = configs.find(
          (config) => config.name.toLowerCase() === args.params[0]
        );

        output = await configController.updateOne(
          args.guild,
          value,
          args.params[1]
        );
        break;

      case "UPDATE_MANY":
        throw new AppError(
          "Not implemented",
          "The `UPDATE_MANY` method is not implemented"
        );
        break;

      case "DELETE_ONE":
        throw new AppError(
          "Not implemented",
          "The `DELETE_ONE` method is not implemented"
        );
        break;

      case "DELETE_MANY":
        throw new AppError(
          "Not implemented",
          "The `DELETE_MANY` method is not implemented"
        );
        break;
    }

    return output;
  }
}

module.exports = new Config();
