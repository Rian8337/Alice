module.exports.run = (client, oldMessage, newMessage) => {
    // Message update logging
	client.subevents.get("messageUpdateLog").run(oldMessage, newMessage)
};

module.exports.config = {
    name: "messageUpdate"
};