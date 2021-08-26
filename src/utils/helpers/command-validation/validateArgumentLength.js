const AppError = require("../../AppError");
const Argument = require("../../Argument");
const { infoCommand } = require("../../../controllers/helpController");

const Command = require("../../Command");
/**
 *
 * @param {Command} permObj
 * @param {Argument} args
 * @returns {Promise<Boolean>} True - throws error if fails to validate.
 */
const validateArgumentLength = async (permObj, args) => {
  if (args.length >= permObj.reqArgs) return true;

  if (args.length === 0) {
    const embed = await infoCommand(args.commandName, args.message.guild);
    await args.message.channel.send(embed);
    return false;
  }

  if (args.length < permObj.reqArgs) {
    throw new AppError(
      `Missing Arguments in command!`,
      `\nExpected command usage: \`${permObj.aliasUsage(
        args.prefix,
        args.commandName
      )}\``
    );
  }
  return true;
};

module.exports = validateArgumentLength;
