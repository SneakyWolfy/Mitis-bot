const checkCooldownImmune = require("./isCooldownImmune");

const Command = require("../../Command/index");
const Argument = require("../../Argument");
const AppError = require("../../AppError");
/**
 *
 * @param {Command} permObj
 * @param {Argument} args
 */
const validateCooldown = async (permObj, args) => {
  const isMod = await checkCooldownImmune(permObj, args);
  const userId = args.message.author.id;

  if (!permObj.timestamps.has(userId) || isMod) return true; //User is immune

  const now = Date.now();
  const cooldownExpiry =
    permObj.timestamps.get(userId) + permObj.cooldown * 1000;

  if (now >= cooldownExpiry) return true;

  const waitTime = `${(cooldownExpiry - now) / 1000} Seconds`;
  throw new AppError(
    "Slow down!",
    `You have to wait another ${waitTime} until you can send this command again!`
  );
};

module.exports = validateCooldown;
