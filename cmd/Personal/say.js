module.exports.run = (client, message, args) => {
	if (message.author.id != "386742340968120321") return;
	let sayMessage = args.join(" ");
	if (sayMessage.search("@everyone") != -1 || sayMessage.search("@here") != -1) {
		message.channel.send("No no, you dummy");
		return;
	}
	message.channel.send(sayMessage);
};

module.exports.config = {
	name: "say",
	description: "Says a message with the bot.",
	usage: "say <...>",
	detail: "`...`: Message to say [String]",
	permission: "Bot Owner"
};
