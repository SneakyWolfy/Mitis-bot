const { findOne } = require('../models/memberModel');
const AppError = require('../utils/AppError');
const parseGuild = require('../utils/Parse/parseGuild');
const parseUser = require('../utils/Parse/parseUser');
const { defaultEmbed, successEmbed } = require('../utils/Provider/embed');
const { formatDate, getAvatar } = require('../utils/View');

/** @param {mongoose.Model} model */
exports.getMany = model => async (userID, guildID) =>
	await model.find({ userID, guildID });

exports.renderMany =
	(model, callback) =>
	async (user, guild, syncData = {}, doc) => {
		const pageLength = 5;

		doc = doc ?? (await this.getMany(model)(user.id, guild.id));
		doc.reverse();

		const totalPages = Math.max(Math.ceil(doc.length / pageLength), 1);

		const data = [];

		let page = 1;
		while (page <= totalPages) {
			const pageFilter = (_, index) =>
				index < page * pageLength && index >= (page - 1) * pageLength;

			const docData = doc.filter(pageFilter);

			const embed = defaultEmbed()
				.setFooter(`Displaying page ${page} of ${totalPages}`)
				.setThumbnail(getAvatar(user));

			data.push(callback({ embed, data: docData, doc, user, syncData }));
			page++;
		}

		return data;
	};

/** @param {mongoose.Model} model */
exports.getOne = model => async (id, err) =>
	await model.findById(id).catch(err);

exports.getLast = model => async (userID, guildID) => {
	const docs = await this.getMany(model)(userID, guildID);
	if (docs.length === 0) return;

	return docs.reduce((lastDoc, doc) =>
		lastDoc.timestamp > doc.timestamp ? lastDoc : doc,
	);
};

exports.renderOne = (model, callback) => async id => {
	const doc = await this.getOne(model)(id, () => {
		throw new AppError('Invalid ID', 'The provided id is invalid');
	});

	if (!doc)
		throw new AppError(
			'Document Not Found',
			'The requested document does not exist.',
		);

	const [user, moderator, guild] = await Promise.all([
		parseUser(doc.userID),
		parseUser(doc.modID),
		parseGuild(doc.guildID),
	]);

	const embed = defaultEmbed()
		.setThumbnail(getAvatar(user))
		.setDescription(`**Reason**: ${doc.reason}`)
		.addField('Guild', guild.name, true)
		.addField('Moderator', moderator, true)
		.setFooter(`Case ${id}\n${formatDate(doc.timestamp)}`);

	return callback(embed, { user, moderator, guild, doc, id });
};

exports.postOne =
	(
		model,
		errMessageTitle = 'Post Error',
		errMessage = 'Cannot have multiple active documents.',
	) =>
	async data => {
		const userDoc = await findOne(data.userID, data.guildID);
		const modDoc = await findOne(data.modID, data.guildID);

		data.userRef = userDoc._id;
		data.modRef = modDoc._id;

		if (
			await model.exists({
				userID: data.userID,
				guildID: data.guildID,
				active: true,
			})
		)
			throw new AppError(errMessageTitle, errMessage);

		//create a new model
		return await model.create(data);
	};

exports.deactivateLast =
	(
		model,
		errMessageTitle = 'Patch Error',
		errMessage = 'This already has an active document',
	) =>
	async (userID, guildID) => {
		const lastActive = await model.findOne({
			userID,
			guildID,
			active: true,
		});
		if (!lastActive) throw new AppError(errMessageTitle, errMessage);

		//Unmute User
		lastActive.active = false;
		await lastActive.save();

		return lastActive;
	};

exports.deleteOne =
	(model, cb, post = () => {}) =>
	async (userID, guildID, id) => {
		const doc = id
			? await this.getOne(model)(id)
			: await this.getLast(model)(userID, guildID);

		const avatar = getAvatar(await parseUser(userID));
		const embed = cb(doc, successEmbed().setThumbnail(avatar));

		await doc.delete();
		post(userID, guildID, id);

		return embed;
	};

exports.deleteMany =
	(model, post = () => {}) =>
	async (userID, guildID, mod) => {
		const docs = await model.deleteMany({ userID, guildID });
		post(userID, guildID, mod);

		return docs.deletedCount;
	};
