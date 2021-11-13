//matches patterns <--flag = "value in string">, <--flag = value> or <--flag>
const flagRegex =
	/--\w+\s{0,}=\s{0,}(["'])(?:(?=(\\?))\2.)*?\1|--\w+\s{0,}=\s{0,}\S+|--\w+/g;

//matches any value between "" or '' not including the quotes
const betweenString = /(?<=([",'])).*?(?=\1)/;

//matches next group of non-spaced characters
const nextValue = /\S+/;

//matches for when any alpha character proceeds "--"
const hasFlag = /(?<=--)\w/;

const findFlag = /(?<=--)\w+/;

const discord = require('discord.js');
/**
 * @param {String} str
 * @returns {Object}
 */
const parseFlags = str => {
	const flags = new discord.Collection();
	const commandStr = str.replace(flagRegex, '');

	if (!hasFlag.test(str)) return { flags, commandStr };

	str.match(flagRegex).forEach(flagString => {
		let [flag, value] = flagString.split(/=/);

		flag = flag.match(findFlag)[0];
		value = value?.match(betweenString)?.[0] || value?.match(nextValue)?.[0];

		flags.set(flag, value || '');
	});

	return { flags, commandStr };
};

module.exports = parseFlags;
