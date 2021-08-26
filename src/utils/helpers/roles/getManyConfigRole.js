const getConfigRole = require("./getConfigRole");
const { Guild, Role } = require("discord.js");

/**
 *
 * @param {Guild} guild
 * @param {Array<String>} roleList
 * @returns {Promise<Array<Role>>} List of config roles
 */
const getAllKeyedRoles = async (guild, roleList) => {
  const rolePromises = roleList.map(async (roleName) => {
    const role = await getConfigRole(roleName, guild);

    return role;
  });

  const roleArr = await Promise.all(rolePromises);

  return roleArr.filter((role) => typeof role !== "boolean");
};

module.exports = getAllKeyedRoles;
