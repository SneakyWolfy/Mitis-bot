exports.simpleList = require("./simpleList");

// View Props
exports.lastEntry = require("./lastEntry");

exports.emptyField = "\u200b";

// Formats
const format = require("./format");

exports.formatDate = format.formatDate;
exports.formatFullDate = format.formatFullDate;

exports.getAvatar = (user) =>
  `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

exports.getGuildIcon = (guild) =>
  `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;

exports.expirationTime = require("./expirationTime");
