const App = require("../../models/appModel");
const AppError = require("../AppError");

module.exports = async (guildID) => {
  const guild = await App.state.client.guilds.fetch(guildID).catch((error) => {
    switch (error.message) {
      case "Unknown Guild":
        throw new AppError(`Member Not Found`, `That member does not exist.`);
      case "Missing Access":
        throw new AppError(
          `Missing Access`,
          `This bot does not have access to that guild`
        );
      default:
        throw new AppError(
          `Invalid Guild`,
          `"\`${guildID}\`" is not a user id or mention.`
        );
    }
  });

  return guild;
};
