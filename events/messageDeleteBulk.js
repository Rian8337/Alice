module.exports.run = (client, messages) => {
    // bulk message delete logging
	client.subevents.get("bulkdeletelog").run(messages)
};

module.exports.config = {
    name: "messageDeleteBulk"
};