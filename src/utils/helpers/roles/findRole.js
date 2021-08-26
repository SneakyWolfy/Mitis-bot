const { Guild, Role } = require("discord.js");
const getConfigRole = require("./getConfigRole");

/**
 *
 * @param {String} roleName
 * @param {Guild} guild
 * @param {Function} errorCB
 * @returns {Promise<Role>}
 */
const findRole = async (roleName, guild, errorCB) => {
  const configRole = await getConfigRole(roleName, guild);
  if (configRole && typeof configRole !== "boolean") return configRole;

  const newRole = guild.roles.cache.find(
    (guildRole) => guildRole.name === role || guildRole.id === role
  );

  if (newrole) return newRole;

  if (errorCB) errorCB(roleName);
  return false;
};

module.exports = findRole;
