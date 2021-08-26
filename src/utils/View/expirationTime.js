const ms = require("ms");

module.exports = (doc) => {
  if (!doc.endDate) return "Indefinite";

  const now = Date.now();
  if (now > doc.endDate) return "Expired";

  return ms(doc.endDate - now, { long: true });
};
