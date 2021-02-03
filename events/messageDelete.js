module.exports.run = (client, message, messageLog) => {
    // Message delete logging
	client.subevents.get("messageDeleteLog").run(message, messageLog);
};

module.exports.config = {
    name: "messageDelete"
};