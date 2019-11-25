module.exports.run = (client, message, args) => {
	let sayMessage = args.join(" ");
	if (sayMessage.search("@everyone") != -1 || sayMessage.search("@here") != -1) {
		message.channel.send("No no, you dummy");
		return;
	}
	message.channel.send(sayMessage);
};

module.exports.help = {
	name: "say"
};