const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (oldMessage, newMessage) => {
    if (oldMessage.author.bot || oldMessage.channel instanceof Discord.DMChannel) return;
	if (oldMessage.content == newMessage.content) return;
	let logchannel = oldMessage.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL({dynamic: true}))
		.setFooter(`Author ID: ${oldMessage.author.id} | Message ID: ${oldMessage.id}`)
		.setTimestamp(new Date())
		.setColor("#00cb16")
		.setTitle("Message edited")
		.addField("Channel", `${oldMessage.channel} | [Go to message](${oldMessage.url})`)
		.addField("Old Message", oldMessage.content.substring(0, 1024))
		.addField("New Message", newMessage.content.substring(0, 1024));
	logchannel.send({embed: embed})
};

module.exports.config = {
    name: "messageUpdateLog"
};