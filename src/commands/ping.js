const Command = require("../utils/Command");
const RM = require("../utils/ResponseHandler");
const Argument = require("../utils/Argument");

class Ping extends Command {
  constructor() {
    super({
      description: `send back "Pong with the bot-latency." to the channel the message was sent in`,
      flags: { ...RM.defaults },
    });
  }

  /** @param {Argument} args */
  async action(args) {
    const now = Date.now();
    return `Pong ♪
Ping to server: ${args.message.createdTimestamp - now}ms
Processing time: ${now - args.timeConstructed}ms
    `;
  }
}

module.exports = new Ping();
