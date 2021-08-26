const Discord = require("discord.js");

module.exports = class MessageHandler {
  isExited = false;
  botMessage = null;

  constructor(data, message, options) {
    //values
    this._message = message;
    this._ownerID = options.owner ?? message.author.id;
    this._data = data;
    this._timeout = options.timeout ?? 60000;
    this._update = options.update ?? true;
    this._deleteMessage = options.deleteMessage ?? true;
    this._update = options.update ?? true;
    this._cancelKeyword = options.cancelKeyword ?? "exit";
    this._skipKeyword = options.skipKeyword ?? "skip";

    this._filter = (m) => this._ownerID === m.author.id;
    this._options = { time: this._timeout, max: 1, errors: ["time"] };

    this._title = options.title ?? "";

    this.embed = new Discord.MessageEmbed()
      .setTitle(this._title)
      .setFooter('*type "exit" to quit | "skip" to skip to next option*');
  }

  async prompt(message = "", format = (m) => m) {
    this.embed.setDescription(format(message));

    if (!this.botMessage) {
      //Sends First Message
      this.botMessage = await this._message.channel.send(this.embed);
    } else {
      //Sends Edits Message
      await this.botMessage.edit("", {
        embed: this.embed,
      });
    }

    return await this._message.channel.awaitMessages(
      this._filter,
      this._options
    );
  }

  async finish() {
    this.embed.setDescription("");
    this.embed.setTitle("Finished!");
    this.embed.setColor("#55ff55");
    await this.prompt();
  }

  async send(callback, format) {
    try {
      for (const [index, message] of this._data.entries()) {
        if (this.isExited) break;

        const response = await this.prompt(message, format);

        //Accesses the user's Message
        const resMessage = response.first();

        if (this.checkExit(resMessage)) break;
        if (await this.checkSkip(resMessage)) {
          await resMessage.delete();
          continue;
        }

        const configMessage = await callback(resMessage, message, index);

        if (configMessage && typeof configMessage === "string")
          await this._message.channel.send(configMessage);

        await resMessage.delete();
      }
      await this.finish();
    } catch (error) {
      this.onTimeout();
    }
  }

  onTimeout() {
    this.isExited = true;
  }

  async checkSkip(response) {
    return response.content.toLowerCase().trim() === this._skipKeyword;
  }

  checkExit(response) {
    return response.content.toLowerCase().trim() === this._cancelKeyword;
  }
};
