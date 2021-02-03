module.exports.run = (channel, user) => {
    if (channel.id !== '683633835753472032' || user.id !== '386742340968120321') {
		return;
	}
	let general = client.channels.cache.get('316545691545501706');
	general.startTyping().catch(console.error);
	setTimeout(() => {
		general.stopTyping(true);
	}, 5000);
};

module.exports.config = {
    name: "typingIndicator"
};