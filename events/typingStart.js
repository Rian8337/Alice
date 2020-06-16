module.exports.run = (client, channel, user) => {
    // Typing indicator
	client.subevents.get("typingIndicator").run(channel, user)
};

module.exports.config = {
    name: "typingStart"
};