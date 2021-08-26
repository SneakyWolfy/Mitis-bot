const { Channel, MessageEmbed } = require("discord.js");
const { errorEmbed, warningEmbed } = require("../utils/Provider/embed");

const sendErrorDev = async (err, channel) => {
  if (!err.isOperational) {
    console.log(err);
    return await sendError(
      err.message,
      "Application Error",
      channel,
      errorEmbed()
    );
  }
  return await sendError(
    err.message,
    err.title ?? "Error",
    channel,
    warningEmbed()
  );
};

const sendErrorProd = async (err, channel) => {
  if (!err.isOperational) {
    console.log(err);
    return await sendError(
      err.message, //Typically would be hidden from clients
      "Application Error",
      channel,
      errorEmbed()
    );
  }
  return await sendError(
    err.message,
    err.title ?? "Error",
    channel,
    warningEmbed()
  );
};

/**
 *
 * @param {String} message
 * @param {Channel} channel
 * @param {MessageEmbed} embed
 */
const sendError = async (message, title, channel, embed) => {
  try {
    embed.setTitle(title);
    embed.setDescription(message);
    if (channel) await channel.send(embed);
  } catch (error) {}
};

exports.handelError = (err, channel) => {
  try {
    switch (process.env.NODE_ENV) {
      case "development":
        return sendErrorDev(err, channel);

      case "production":
      default:
        return sendErrorProd(err, channel);
    }
  } catch (error) {}
};
