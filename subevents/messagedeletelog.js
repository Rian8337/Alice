const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = (message, messageLog) => {
    if (message.author.bot || message.channel instanceof Discord.DMChannel) return;
	let logchannel;
	if (message.guild.id == '316545691545501706') {
		if (message.attachments.size == 0) return;
		logchannel = message.guild.channels.cache.find((c) => c.name === 'dyno-log');
		if (!logchannel) return;
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL);
			if (attachments.length == message.attachments.size) messageLog.send("Image attached", {files: attachments})
		});
		return
	}
	logchannel = message.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
		.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
		.setTimestamp(new Date())
		.setColor("#cb8900")
		.setTitle("Message deleted")
		.addField("Channel", message.channel);

	if (message.content) embed.addField("Content", message.content.substring(0, 1024));
	logchannel.send({embed: embed});

	if (message.attachments.size > 0) {
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL);
			if (attachments.length == message.attachments.size) logchannel.send("Image attached", {files: attachments})
		})
	}
};

module.exports.config = {
    name: "messageDeleteLog"
};