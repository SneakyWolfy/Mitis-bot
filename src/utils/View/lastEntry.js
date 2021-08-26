const { formatDate } = require("./format");

module.exports = (document, message) => {
  const mostRecent = document.reduce(
    (mostRecent, el) => (mostRecent > el.timestamp ? mostRecent : el.timestamp),
    0
  );

  return mostRecent ? `${message}${formatDate(mostRecent)}` : "";
};
