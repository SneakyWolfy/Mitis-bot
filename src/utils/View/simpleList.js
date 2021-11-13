const { formatDate } = require('./format');

const simpleList_heading = (document, action, verb = 'received') =>
	`**${action} ${verb} on ${formatDate(document.timestamp)}**`;

const simpleList_body = document =>
	`\`Reason:  \` ${
		document.reason.length === 0 ? 'No Reason provided' : document.reason
	}`;

const simpleList_footer = document => `\`Case ID: \` ${document._id}`;
const simpleList_damage = document => `\`Damage:  \` ${document.damage}`;

module.exports = (document, action, options = {}) => {
	const defaults = Object.assign(
		{
			verb: 'received',
			damage: false,
			audit: false,
		},
		options,
	);
	if (defaults.audit) defaults.verb = 'issued';

	const heading = simpleList_heading(document, action, defaults.verb);
	let body = simpleList_body(document);
	const footer = simpleList_footer(document);

	if (options.damage) body += `\n${simpleList_damage(document)}`;

	return `${heading}\n${body}\n${footer}\n`;
};
