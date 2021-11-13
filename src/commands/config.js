const Command = require('../utils/Command');
const RM = require('../utils/ResponseHandler');
const configController = require('../controllers/configController');
const configModel = require('../models/configModel');
const Parse = require('../utils/Parse');
const AppError = require('../utils/AppError');

class Config extends Command {
	constructor() {
		super({
			description: 'Configure your guilds defaults.',
			usage: [
				'[Option] [Value]',
				'[Option]',
				'',
				'Setup',
				'Delete Value',
				'Reset All',
			],
			flags: { ...RM.defaults },
			guildOnly: true,
		});
	}

	async override(args) {
		const configs = await configController.getAllFlat(args.guild.id);
		args.configOptions = configs.map(config => config.name.toLowerCase());

		let parseRes;

		if (args.length === 0) {
			//? Display All
			args.type = 'READ_MANY';
			args.keep();
			return {};
		}

		if (args.length === 1) {
			//? Setup All
			parseRes = await Parse(args).enum(['setup']).execute({ abortOnError: true });
			if (parseRes) {
				args.type = 'UPDATE_MANY';
				return { reqPermissions: ['ADMINISTRATOR'] };
			}

			//? Display One
			parseRes = await Parse(args).enum(args.configOptions).execute();
			if (parseRes) {
				args.type = 'READ_ONE';
				args.keep();
				args.params = parseRes;
				return {};
			}
		}

		if (args.length === 2) {
			//? Reset All
			parseRes = await Parse(args)
				.enum(['reset', 'delete'])
				.enum(['all'])
				.execute({ abortOnError: true });
			if (parseRes) {
				args.type = 'DELETE_MANY';
				return { reqPermissions: ['ADMINISTRATOR'] };
			}

			//? Reset One
			parseRes = await Parse(args)
				.enum(['reset', 'delete'])
				.string()
				.execute({ abortOnError: true });
			if (parseRes) {
				args.type = 'DELETE_ONE';
				args.params = parseRes;
				return { reqPermissions: ['ADMINISTRATOR'] };
			}
		}

		if (!parseRes) {
			//? Update One
			parseRes = await Parse(args).enum(args.configOptions).message().execute();
			if (parseRes) {
				args.type = 'UPDATE_ONE';
				args.params = parseRes;
				return { reqPermissions: ['ADMINISTRATOR'] };
			}
		}

		return {};
	}

	async action(args) {
		let output;
		const configs = await configController.getAllFlat(args.guild.id);
		let value;

		switch (args.type) {
			case 'READ_ONE':
				value = configs.find(
					config => config.name.toLowerCase() === args.params[0],
				);

				output = await configController.renderOne(args.guild, value);
				break;

			case 'READ_MANY':
				output = await configController.renderAll(args.guild);
				break;

			case 'UPDATE_ONE':
				value = configs.find(
					config => config.name.toLowerCase() === args.params[0],
				);

				output = await configController.updateOne(
					args.guild,
					value,
					args.params[1],
				);
				break;

			case 'UPDATE_MANY':
				configController.setup(args);
				break;

			case 'DELETE_ONE':
				value = configs.find(
					config => config.name.toLowerCase() === args.params[1],
				);

				if (!value)
					throw new AppError(
						'Invalid Argument',
						`${args.params[1]} is not a valid config option.`,
					);

				output = await configController.deleteOne(args.guild, value);
				break;

			case 'DELETE_MANY':
				output = await configController.deleteAll(args.guild);
				break;
		}

		await configModel.resetConfigState(args.guild.id);
		return output;
	}
}

module.exports = new Config();
