module.exports.run = (client, messages) => {
    // bulk message delete logging
	client.subevents.get("messageBulkDeleteLog").run(messages);
};

module.exports.config = {
    name: "messageDeleteBulk"
};
