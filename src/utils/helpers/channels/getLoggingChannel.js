const getConfigChannel = require('./getConfigChannel');

module.exports = async (channelName, guild) => {
	//? Log to channel
	const channel = await getConfigChannel(channelName, guild);
	if (channel) return channel;

	//? Preventing audit logs from mixing with default logs
	if (channelName === 'audit') return false;

	//? Log to default if channel doesn't exist
	const defaultChannel = await getConfigChannel('default', guild);
	if (defaultChannel) return defaultChannel;

	//? return false if default doesn't exist
	return false;
};
