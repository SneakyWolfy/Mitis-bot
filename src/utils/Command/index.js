const Discord = require("discord.js");
const ResponseHandler = require("../ResponseHandler");

const Argument = require("../Argument");
const validate = require("../helpers/command-validation/validate");
const errorController = require("../../controllers/errorController");

/**
 * @abstract
 */
const Command = class {
  /**
   * @param {Object} options - Properties of the command
   * @param {String} [options.description=''] - Information about the command
   * @param {String} [options.usage=''] - The Command's Structure "[user] [time]"
   * @param {Number} [options.reqArgs=0] - The minimum number of required arguments
   * @param {Boolean} [options.guildOnly=false] - Whether or not the command requires a server to run
   * @param {Number} [options.cooldown=3] - The down time per user of the command (seconds)
   * @param {Array<Discord.PermissionString>} [options.reqPermissions=[]] - Required permissions to use the command
   * @param {Array<Discord.UserResolvable>} [options.userWhitelist=[]] - A list of users who are immune to command permission checks
   * @param {Array<Discord.RoleResolvable>} [options.roleWhitelist=[]] - A list of required role to run the command
   * @param {Array<Discord.RoleResolvable>} [options.roleBlacklist=[]] - A list roles that are blacklisted from using the command
   * @param {Boolean} [options.roleHierarchy=false] - Allows users to run the command if the have any role above the required role
   * @param {Boolean} [options.adminOverride=true] - Determines if admins will always be allowed to use the command regardless of permissions or overrides
   * @param {Boolean} [options.ownerOverride=true] - Determines if the owner will always be allowed to use the command regardless of permissions or overrides
   * @param {Array} [options.aliases=[]] - Various names for the same command
   * @param {Object} [options.flags={}] - Available flags for each command
   * @param {Object} [options.cooldownImmune=[]] - Base role for users that will ignore cooldown
   */
  constructor(options = {}) {
    this.name = options.name ?? this.__proto__.constructor.name;

    /**
     * @type {String} Information about the command
     */
    this.description = options.description ?? "";

    /** @type {String} The Command's Structure "[user] [time]" */
    this.usage = options.usage ?? "";

    /** @type {Number} The minimum number of required arguments */
    this.reqArgs = options.reqArgs ?? 0;

    /** @type {Boolean} Whether or not the command requires a server to run */
    this.guildOnly = options.guildOnly ?? false;

    /** @type {Number} The down time per user of the command (seconds) */
    this.cooldown = options.cooldown ?? 2;

    /** @type {Object} Base role for users that will ignore cooldown */
    this.cooldownImmune = options.cooldownImmune ?? [];

    /** @type {Array<Discord.PermissionString>} Required permissions to use the command */
    this.reqPermissions = options.reqPermissions ?? [];

    /** @type {Array<Discord.UserResolvable>} A list of users who are immune to command permission checks */
    this.userWhitelist = options.userWhitelist ?? [];

    /** @type {Array<Discord.RoleResolvable>} A list of required role to run the command */
    this.roleWhitelist = options.roleWhitelist ?? [];

    /** @type {Array<Discord.RoleResolvable>} A list roles that are blacklisted from using the command */
    this.roleBlacklist = options.roleBlacklist ?? [];

    /** @type {Boolean} Allows users to run the command if the have any role above the required role */
    this.roleHierarchy = options.roleHierarchy ?? true;

    /** @type {Boolean} Determines if admins will always be allowed to use the command regardless of permissions or overrides */
    this.adminOverride = options.adminOverride ?? true;

    /** @type {Boolean} Determines if the owner will always be allowed to use the command regardless of permissions or overrides */
    this.ownerOverride = options.ownerOverride ?? true;

    /** @type {Array} Various names for the same command */
    this.aliases = options.aliases ?? [];

    /** @type {Object} Available flags for each command */
    this.flags = options.flags ?? {};

    /** @type {Discord.Collection} Internal timings used for member cooldown */
    this.timestamps = new Discord.Collection();
  }

  //Public interface
  /**
   *
   * @param {Argument} args
   * @returns
   */
  aliasUsage(prefix, commandName) {
    return `${prefix}${commandName} ${this.usage}`;
  }

  getUsage(prefix) {
    return `${prefix}${this.name} ${this.usage}`;
  }

  error(reason, channel) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("Error");
    embed.setColor("#ffff00");
    embed.setDescription(reason);
    channel.send(embed);
    return false;
  }

  addUserMark(id) {
    this.timestamps.set(id, Date.now());
  }
  removeUserMark(id) {
    this.timestamps.delete(id);
  }

  async override(args) {
    return {};
  }

  async execute(args) {
    try {
      //Overrides permissions depending on the number of arguments
      const perms = Object.assign(this, (await this.override(args)) ?? {});

      //Checks if user is authenticated and request is valid
      if (!(await validate(perms, args))) return;

      //Used for cooldown
      this.addUserMark(args.message.id);

      //Returned values are rendered
      const content = await this.action(args);
      await ResponseHandler.output(content, args, this.flags);
    } catch (error) {
      this.removeUserMark(args.message.author.id);
      errorController.handelError(error, args.message.channel);
    }
  }
};

module.exports = Command;
