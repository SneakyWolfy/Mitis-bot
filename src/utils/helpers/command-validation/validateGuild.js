const AppError = require("../../AppError");

const Command = require("../../Command");
/**
 *
 * @param {Command} permObj
 * @param {String} args
 * @returns {Boolean} True - throws error if fails to validate.
 */
const validateGuild = (permObj, channelType) => {
  if (permObj.guildOnly && channelType === "dm") {
    throw new AppError(
      "Guild only command",
      "This command cannot be used in DMs"
    );
  }
  return true;
};

module.exports = validateGuild;
