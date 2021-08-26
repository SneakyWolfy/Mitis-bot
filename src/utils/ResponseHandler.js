const Discord = require("discord.js");
const Pagination = require("./Pagination");
const Argument = require("./Argument");

class ResponseHandler {
  get defaults() {
    return {
      dm: "Sends the dm to the user",
      silent: "Hides all command output",
      del: "Deletes user command message",
    };
  }

  /**
   *
   * @param {Pagination} pagination
   * @param {Discord.Message} message - The commands message object
   * @param {Array} args - The commands arguments
   * @param {Object} [flags] - Optional flags to be in use
   * @param {boolean} [flags.dm=false]
   * @param {boolean} [flags.silent=false]
   * @param {boolean} [flags.del=false]
   */
  async outputPagination(pagination, args, flags) {
    if (!pagination || !args) return;

    const useDM = flags.dm ?? false;
    const useSilent = flags.silent ?? false;
    const useDel = flags.del ?? false;

    if (args.flags.has("del") && useDel && args.message.deletable)
      await args.message.delete();

    if (args.flags.has("silent") && useSilent) return;
    if (args.flags.has("dm") && useDM)
      return await pagination.dm(args.message.author);

    await pagination.send(args.channel);
  }

  /**
   *
   * @param {String} content - The Message's content
   * @param {Argument} args - The commands arguments
   * @param {Object} [flags] - Optional flags to be in use
   * @param {boolean} [flags.dm=false]
   * @param {boolean} [flags.silent=false]
   * @param {boolean} [flags.del=false]
   */
  async output(content, args, flags = {}) {
    if (!content || !args.message || !args) return;

    const useDM = flags.dm ?? false;
    const useSilent = flags.silent ?? false;
    const useDel = flags.del ?? false;

    if (args.flags.has("del") && useDel && args.message.deletable)
      await args.message.delete();

    if (args.flags.has("silent") && useSilent) return;
    if (args.flags.has("dm") && useDM)
      return await this.sendUser(args.message.author, content);

    if (content instanceof Discord.MessageEmbed)
      return await args.message.channel.send(content);

    return await args.message.channel.send(content, {
      allowedMentions: { users: [] },
    });
  }

  async sendUser(user, message) {
    return await user.send(message).catch(() => {});
  }
}

module.exports = new ResponseHandler();
