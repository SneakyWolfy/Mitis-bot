const { GuildMember } = require("discord.js");
const AppError = require("../../AppError");

const Command = require("../../Command");
/**
 *
 * @param {Command} permObj
 * @param {GuildMember} member
 * @returns {Boolean} True - throws error if fails to validate.
 */
const validateNativePermissions = (permObj, member) => {
  const isPermitted = member.hasPermission(permObj.reqPermissions, {
    checkAdmin: permObj.adminOverride,
    checkOwner: permObj.ownerOverride,
  });

  if (!isPermitted) {
    const missingPerms = permObj.reqPermissions
      .filter((perm) => !member.permissions.toArray().includes(perm))
      .join(", ");

    throw new AppError(
      "Unauthorized",
      `You don't have the required permission to use this command: \`${missingPerms}\`!`
    );
  }
  return true;
};

module.exports = validateNativePermissions;
