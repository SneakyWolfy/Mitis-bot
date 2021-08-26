const AppError = require("../AppError");

module.exports = async (userID, guild) => {
  if (!userID)
    throw new AppError(
      `Missing Argument`,
      `A user id or mention was not provided.`
    );

  if (userID.startsWith("<@") && userID.endsWith(">")) {
    userID = userID.slice(2, -1);

    if (userID.startsWith("!")) {
      userID = userID.slice(1);
    }
  }

  const member = await guild.members.fetch(userID).catch((error) => {
    if (error.message === "Unknown Member") {
      throw new AppError(
        `Member Not Found`,
        `That member is not found in ${guild.name ?? "This server"}`
      );
    }
    throw new AppError(
      `Invalid Member`,
      `"\`${userID}\`" is not a user id or mention.`
    );
  });

  return member;
};
