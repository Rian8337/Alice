module.exports.run = (client, message, args) => {
        if (message.author.id != '386742340968120321') return;
	let sayMessage = args.join(" ");
	if (sayMessage.search("@everyone") != -1 || sayMessage.search("@here") != -1) {
		message.channel.send("**S**: No no, you dummy");
		return;
	}
	message.channel.send("**S**: " + sayMessage);
};

module.exports.help = {
	name: "say"
};
