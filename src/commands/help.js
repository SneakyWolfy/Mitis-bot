const Command = require('../utils/Command');
const RM = require('../utils/ResponseHandler');
const helpController = require('../controllers/helpController');

class Help extends Command {
	constructor() {
		super({
			description: 'Provides information about available commands',
			usage: '[Command]',
			aliases: ['info'],
			cooldown: 3,
			cooldownImmune: ['jmod'],
			flags: { ...RM.defaults },
		});
	}

	async action(args) {
		const embed =
			args.length === 0
				? helpController.getAllCommandInfo(args.message.guild)
				: helpController.infoCommand(args.args[0], args.message.guild);

		args.keep();
		return embed;
	}
}

module.exports = new Help();
