let config = require('../config.json');

module.exports.run = (client, message, args) => {
	if (message.author.id != '386742340968120321' && !args[0]) return;
        message.author.lastMessage.delete().then(() => {
	let attachments = [];
	if (message.attachments.size > 0) {
		message.attachments.forEach(attachment => {
			attachments.push(attachment.proxyURL)
		})
	}
	let sayMessage = args.join(" ");
	if (attachments.length > 0) {
		if (sayMessage) message.channel.send(sayMessage, {files: attachments});
		else message.channel.send({files: attachments})
	}
	else message.channel.send(sayMessage)
        })
};

module.exports.config = {
	description: "Says a message with the bot.",
	usage: "None",
	detail: "None",
	permission: "Bot Owner"
};

module.exports.help = {
	name: "sayit"
};
