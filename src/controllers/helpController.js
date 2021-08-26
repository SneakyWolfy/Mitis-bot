const App = require("../models/appModel");
const AppError = require("../utils/AppError");
const getConfigRole = require("../utils/helpers/roles/getConfigRole");
const { defaultEmbed } = require("../utils/Provider/embed");
const Command = require("../utils/Command");
const View = require("../utils/View");
const { getPrefix } = require("./configController");
const getUniqueValues = require("../utils/helpers/getUniqueValues");

exports.infoCommand = async (commandName, guild) => {
  const prefix = await getPrefix(guild.id);
  const { commands } = App.state.client;

  if (!commands.has(commandName))
    throw new AppError(
      "Invalid Command Name (400)",
      `Could not find the command \`${commandName}\`.`
    );

  /** @type {Command} */
  const command = commands.get(commandName);
  const embed = defaultEmbed();

  //formatted output
  embed.setTitle(command.name);
  embed.setDescription(command.description);
  embed.addField("Usage", command.getUsage(prefix), true);

  if (command.aliases.length > 0)
    embed.addField("Aliases", command.aliases.join(", "), true);

  if (command.reqPermissions.length > 0)
    embed.addField(
      "Required Permissions",
      command.reqPermissions.join(", "),
      true
    );

  if (command.roleWhitelist.length > 0) {
    const roleList = [];
    for (const role of command.roleWhitelist) {
      const configRole = await getConfigRole(role, guild);
      roleList.push(configRole);
    }

    embed.addField("Required Roles", roleList, true);
  }

  //Sets up flag values
  const flagLength = Object.keys(command.flags).reduce(
    (a, flag) => (a.length > flag.length ? a : flag),
    0
  ).length;

  const flagValues = [];
  for (const [name, description] of Object.entries(command.flags)) {
    flagValues.push(`\`--${name.padEnd(flagLength, " ")}\` - ${description}`);
  }

  if (flagValues.length > 0) embed.addField("Flags", flagValues);

  return embed;
};

/**
 *
 * @param {Object} options
 * @param {String} [options.prefix="!"]
 * @returns {MessageEmbed}
 */
exports.getAllCommandInfo = async (guild) => {
  const prefix = await getPrefix(guild.id);

  const commands = App.state.client.commands;
  const allUniqueCommands = getUniqueValues(commands).sort((a, b) =>
    a.name >= b.name ? 1 : -1
  );
  const longestCommand = allUniqueCommands.reduce(
    (a, v) => (a.name.length > v.name.length ? a : v),
    allUniqueCommands[0]
  );

  const embed = defaultEmbed();

  //formatted output
  embed.setTitle("All Available Commands");

  embed.setThumbnail(View.getGuildIcon(guild));

  embed.setDescription(
    allUniqueCommands.map((el) => {
      const command = `${prefix}${el.name}`.padEnd(
        longestCommand.name.length + prefix.length
      );

      const usage = el.usage.length > 0 ? `\`${el.usage}\`` : ``;

      return `**\`${command}\`** ${usage}`;
    })
  );

  // prettier-ignore
  embed.addField(
    "\u200b",
    `Find more information about each command using \`${commands.get('help').getUsage(prefix)}\``
  );

  embed.setFooter(`version ${require("../../package.json").version}`);

  return embed;
};
