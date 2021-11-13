const parseGuild = require('../utils/Parse/parseGuild');
const parseUser = require('../utils/Parse/parseUser');

exports.getSyncDataFromID = (model, fn) => async id => {
	try {
		//?get data
		const doc = await model.findById(id);

		//?parse user and guild
		const [user, guild] = await Promise.all([
			parseUser(doc.userID),
			parseGuild(doc.guildID),
		]);

		return await fn(user, guild);
	} catch (error) {
		return { notFound: true };
	}
};
