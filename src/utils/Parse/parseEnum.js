const AppError = require("../AppError");

module.exports = (enums, value) => {
  if (!value)
    throw new AppError(
      "Missing Argument",
      `\`${enums.join(", ")}\` is expected.`
    );

  const en = enums.find((en) => en.toLowerCase() === value.toLowerCase());

  if (!en)
    throw new AppError(
      "Invalid Argument",
      `\`${enums.join(", ")}\` is expected.`
    );

  return en;
};
