const Command = require('../utils/Command');
const RM = require('../utils/ResponseHandler');
const { defaultEmbed } = require('../utils/Provider/embed');

class Ping extends Command {
	constructor() {
		super({
			description: 'Responds with pong and latency information.',
			flags: { ...RM.defaults },
		});
	}

	async action(args) {
		const now = Date.now();
		return defaultEmbed().setTitle('Pong ♪').setDescription(`
Server Latency:  \`${args.message.createdTimestamp - now}ms\`
Processing Time: \`${now - args.timeConstructed}ms\`
`);
	}
}

module.exports = new Ping();
