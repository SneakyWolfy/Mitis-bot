const Discord = require("discord.js");

module.exports = class Pagination {
  constructor(data, ownerID) {
    this._filter = (reaction, user) => {
      const isReaction =
        reaction.emoji.name === this._pageLeft ||
        reaction.emoji.name === this._pageRight;
      const isOwnerReaction = user.id === this._ownerID;

      return isReaction && isOwnerReaction;
    };

    this._ownerID = ownerID;
    this._data = data;
    this._warnFlag = false;
    this._page = 1;
    this._totalPages = data.length;
    this._pageLeft = "⬅️";
    this._pageRight = "➡️";
  }

  get currentPage() {
    return this._data[this._page - 1];
  }

  /**
   *
   * @param {Discord.User} user
   * @returns
   */
  async dm(user) {
    this.targetMessage = await user.send(this.currentPage);
    this.update();
    return this.targetMessage;
  }

  async send(channel) {
    this.targetMessage = await channel.send(this.currentPage);
    this.update();
    return this.targetMessage;
  }

  update() {
    this._react();
    this._setCollector();
  }

  _react() {
    if (this._page > 1) this.targetMessage.react(this._pageLeft);
    if (this._page < this._totalPages)
      this.targetMessage.react(this._pageRight);
  }

  _setCollector() {
    this.collector = this.targetMessage.createReactionCollector(this._filter, {
      time: 60000,
    });

    this.collector.on("collect", this._updatePage.bind(this));

    this.collector.on("end", async () => {
      try {
        await targetMessage.reactions.removeAll();
      } catch (error) {}
    });
  }

  async _clearEvent() {
    try {
      await this.collector.stop();
      if (this.targetMessage.channel.type === "dm") return;

      await this.targetMessage.reactions.removeAll();
    } catch (error) {
      if (!this.warnFlag) {
        this.warnFlag = true;
        if (this.targetMessage.channel.type === "dm") return;

        await this.targetMessage.channel.send(
          "I cannot remove reactions without `MANAGE_MESSAGES` permissions"
        );
      }
    }
  }

  async _editMessage() {
    await this.targetMessage.edit("", {
      embed: this.currentPage,
    });
  }

  async _updatePage(reaction, user) {
    try {
      //update page
      if (reaction.emoji.name === this._pageLeft) this._page--;
      if (reaction.emoji.name === this._pageRight) this._page++;

      //clear events
      await this._clearEvent();

      //render message
      await this._editMessage();

      //add new pagination
      this.update();
    } catch (error) {}
  }
};
