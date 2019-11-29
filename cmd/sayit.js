module.exports.run = (client, message, args) => {
	if (message.author.id != '386742340968120321') return;
	let attachments = [];
	if (message.attachments.size > 0) {
		message.attachments.forEach(attachment => {
			attachments.push(attachment.proxyURL)
		})
	}
	let sayMessage = args.join(" ");
	message.author.lastMessage.delete().then (() => {});
	if (attachments.length > 0) {
		if (sayMessage) message.channel.send(sayMessage, {files: attachments});
		else message.channel.send({files: attachments})
	}
	else message.channel.send(sayMessage)
};

module.exports.help = {
	name: "sayit"
};
