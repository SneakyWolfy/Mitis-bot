const App = require('./src/models/appModel.js');
const mongoose = require('mongoose');
const client = App.state.client;

const login = async () => {
	try {
		await client.login(`${process.env.BOT_TOKEN}`);
		console.log('Client Logged-in');
	} catch (error) {
		throw new Error(`Issue with logging in client: ${error}`);
	}
};

const loadDatabase = async () => {
	try {
		const DB = process.env.DATABASE.replace(
			'<PASSWORD>',

			// you can optionally just include the password in the mongo string
			process.env.DATABASE_PASSWORD,
		);

		await mongoose.connect(DB, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});
		console.log('Database Connected');
	} catch (error) {
		throw new Error(`Issue with loading database: ${error}`);
	}
};

const init = async () => {
	await Promise.all([loadDatabase(), login()]);
};
exports.init = init;
