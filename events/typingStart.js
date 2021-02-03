module.exports.run = (client, channel, user) => {
    // Typing indicator
	client.subevents.get("typingIndicator").run(client, channel, user);
};

module.exports.config = {
    name: "typingStart"
};
