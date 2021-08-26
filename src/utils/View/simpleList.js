const { formatDate } = require("./format");

const simpleList_heading = (document, action) =>
  `**${action} received on ${formatDate(document.timestamp)}**`;

const simpleList_body = (document) =>
  `\`Reason:  \` ${
    document.reason.length === 0 ? "No Reason provided" : document.reason
  }`;

const simpleList_footer = (document) => `\`Case ID: \` ${document._id}`;
const simpleList_damage = (document) => `\`Damage:  \` ${document.damage}`;

module.exports = (document, action, options = {}) => {
  const heading = simpleList_heading(document, action);
  let body = simpleList_body(document);
  const footer = simpleList_footer(document);

  if (options.damage) body += `\n${simpleList_damage(document)}`;

  return `${heading}\n${body}\n${footer}\n`;
};
