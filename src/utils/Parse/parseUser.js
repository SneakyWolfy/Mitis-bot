const App = require("../../models/appModel");
const AppError = require("../AppError");

module.exports = async (_userID) => {
  let userID = _userID;
  if (!userID) return;

  if (userID.startsWith("<@") && userID.endsWith(">")) {
    userID = userID.slice(2, -1);

    if (userID.startsWith("!")) {
      userID = userID.slice(1);
    }
  }

  const user = await App.state.client.users.fetch(userID).catch((error) => {
    switch (error.message) {
      case "Unknown User":
        throw new AppError(`Member Not Found`, `That member does not exist.`);
      default:
        throw new AppError(
          `Invalid User`,
          `"\`${userID}\`" is not a user id or mention.`
        );
    }
  });
  return user;
};
