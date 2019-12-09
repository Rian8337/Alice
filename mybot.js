client.on("messageUpdate", (oldMessage, newMessage) => {
	if (oldMessage.author.bot) return;
	if (oldMessage.content == newMessage.content) return;
	let logchannel = oldMessage.guild.channels.find(c => c.name === config.log_channel);
	if (!logchannel) return;
	let link = `https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`;
	const embed = new Discord.RichEmbed()
		.setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL)
		.setFooter(`Author ID: ${oldMessage.author.id} | Message ID: ${oldMessage.id}`)
		.setTimestamp(new Date())
		.setColor("#00cb16")
		.setTitle("Message edited")
		.addField("Channel", `${oldMessage.channel} | [Go to message](${link})`)
		.addField("Old Message", oldMessage.content.substring(0, 1024))
		.addField("New Message", newMessage.content.substring(0, 1024));
	logchannel.send(embed)
});

client.on("messageDelete", message => {
	if (message.author.bot) return;
	let logchannel;
	if (message.guild.id == '316545691545501706') {
		if (message.attachments.size == 0) return;
		logchannel = message.guild.channels.find(c => c.name === 'dyno-log');
		if (!logchannel) return;
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL)
		});
		logchannel.send("Image attached", {files: attachments})
	}
	else {
		logchannel = message.guild.channels.find(c => c.name === config.log_channel);
		if (!logchannel) return;
		const embed = new Discord.RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
			.setTimestamp(new Date())
			.setColor("#cb8900")
			.setTitle("Message deleted")
			.addField("Channel", message.channel);

		if (message.content) embed.addField("Content", message.content.substring(0, 1024));
		logchannel.send(embed);

		if (message.attachments.size > 0) {
			let attachments = [];
			message.attachments.forEach(attachment => {
				attachments.push(attachment.proxyURL)
			});
			logchannel.send({files: attachments})
		}
	}
});

client.on("messageDeleteBulk", messages => {
	let message = messages.first();
	let logchannel = message.guild.channels.find(c => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.RichEmbed()
		.setTitle("Bulk delete performed")
		.setColor("#4354a3")
		.setTimestamp(new Date())
		.addField("Channel", message.channel)
		.addField("Amount of messages", messages.size);
	logchannel.send(embed)
});
