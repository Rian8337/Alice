const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = messages => {
    let message = messages.first();
	let logchannel = message.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setTitle("Bulk delete performed")
		.setColor("#4354a3")
		.setTimestamp(new Date())
		.addField("Channel", message.channel)
		.addField("Amount of messages", messages.size);
	logchannel.send({embed: embed})
};

module.exports.config = {
    name: "messagebulkdeletelog"
};