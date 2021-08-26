const configController = require("../../../controllers/configController");
const App = require("../../../models/appModel");
const { Guild, Role } = require("discord.js");
const parseRole = require("../../Parse/parseRole");

/**
 *
 * @param {String} roleName
 * @param {Guild} guild
 * @returns {Promise<Role>}
 */
const getConfigRole = async (roleName, guild) => {
  if (!guild) return roleName;

  const configData = await configController.fetchConfig(guild.id);
  const configRole = configData.roles?.[roleName];
  if (!configRole) return false;

  return await parseRole(configRole, guild);
};

module.exports = getConfigRole;
