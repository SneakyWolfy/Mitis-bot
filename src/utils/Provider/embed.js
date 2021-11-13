const discord = require('discord.js');

const color = {
	//HSV: 120°, 50%, 65%
	success: `#53a653`,

	//HSV: 40°, 80%, 80%
	warning: `#cc9629`,

	//HSV: 0°, 80%, 65%
	failure: `#a62121`,

	//HSV: 240°, 50%, 65%
	default: `#5353a6`,
};

const generateEmbed = hexColor => {
	/**
	 * @type {discord.MessageEmbed}
	 */
	const embed = new discord.MessageEmbed();
	embed.setColor(hexColor);
	return embed;
};

exports.defaultEmbed = () => generateEmbed(color.default);
exports.successEmbed = () => generateEmbed(color.success);
exports.warningEmbed = () => generateEmbed(color.warning);
exports.errorEmbed = () => generateEmbed(color.failure);
