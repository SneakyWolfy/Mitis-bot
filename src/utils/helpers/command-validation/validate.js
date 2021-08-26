const validateGuild = require("./validateGuild");
const validateArgumentLength = require("./validateArgumentLength");
const validatePermissions = require("./validatePermissions");
const validateCooldown = require("./validateCooldown");

const Command = require("../../Command/index");
const Argument = require("../../Argument");
/**
 *
 * @param {Command} permObj
 * @param {Argument} args
 */
const validate = async (permObj, args) => {
  let validated = true;

  validated &&= validateGuild(permObj, args.message.channel.type);
  validated &&= await validateArgumentLength(permObj, args);
  validated &&= await validatePermissions(permObj, args);
  validated &&= await validateCooldown(permObj, args);

  return validated;
};

module.exports = validate;
