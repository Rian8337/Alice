module.exports.run = (oldMessage, newMessage) => {
    // Message update logging
	client.subevents.get("messageupdatelog").run(oldMessage, newMessage)
};

module.exports.config = {
    name: "messageUpdate"
};