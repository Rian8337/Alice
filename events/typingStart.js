module.exports.run = (channel, user) => {
    // Typing indicator
	client.subevents.get("typingindicator").run(channel, user)
};

module.exports.config = {
    name: "typingStart"
};