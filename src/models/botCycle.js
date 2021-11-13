const mongoose = require('mongoose');

const botCycleSchema = new mongoose.Schema({
	cycleID: {
		type: String,
		unique: true,
	},
	lastScan: {
		type: Number,
		default: Date.now,
	},
	scanInterval: {
		type: Number,
		required: true,

		// Two Days
		default: 172800000,
	},
});

const BotCycle = mongoose.model('BotCycle', botCycleSchema);

exports.getCureCycle = async () => {
	const cycle = await BotCycle.findOne({ cycleID: 'cure' });
	if (cycle) return cycle;

	return await BotCycle.create({ cycleID: 'cure' });
};
exports.BotCycle = BotCycle;
