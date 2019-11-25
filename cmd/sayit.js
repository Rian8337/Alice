module.exports.run = (client, message, args) => {
	if (message.author.id != '386742340968120321') return;
	if (message.attachments.size > 0) return;
	let sayMessage = args.join(" ");
	if (!sayMessage) return;
	message.author.lastMessage.delete().then (() => {
		message.channel.send(sayMessage)
	});
};

module.exports.help = {
	name: "sayit"
};
