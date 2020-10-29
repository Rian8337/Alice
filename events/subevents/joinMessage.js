const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.GuildMember} member 
 */
module.exports.run = member => {
    const channel = member.guild.channels.cache.get("360716684174032896");
	if (!channel) {
		return;
	}
	let joinMessage = `Welcome to ${member.guild.name}'s ${channel}.\nTo verify yourself as someone who plays osu!droid or interested in the game and open the rest of the server, you can follow *any* of the following methods:\n\n- post your osu!droid screenshot (main menu if you are an online player or recent result (score) if you are an offline player). If you've just created an osu!droid account, please submit a score to the account before verifying\n\n- post your osu! profile (screenshot or link to profile) and reason why you join this server\n\nafter that, you can ping <@&369108742077284353> and/or <@&595667274707370024> and wait for one to come to verify you.\n\n**Do note that you have 1 week to verify, otherwise you will be automatically kicked.**`;

	let time_difference = Math.floor((Date.now() - member.user.createdTimestamp) / 1000);
	let string = '\n\n**Account created ';

	if (time_difference < 604800) {
		const day = Math.floor(time_difference / 86400);
		time_difference -= day * 86400;
		if (day) string += `${day} ${day === 1 ? "day" : "days"}`;

		const hour = Math.floor(time_difference / 3600);
		time_difference -= hour * 3600;
		if (hour) {
			if (day) string += ', ';
			string += `${hour} ${hour === 1 ? "hour": " hours"}`;
		}

		const minute = Math.floor(time_difference / 60);
		time_difference -= minute * 60;
		if (minute) {
			if (day + hour) string += ', ';
			string += `${minute} ${minute === 1 ? "minute" : "minutes"}`;
		}

		if (time_difference) {
			if (day + hour + minute) string += ', ';
			string += `${time_difference} ${time_difference === 1 ? "second" : "seconds"}`;
		}

		string += ' ago**';
		joinMessage += string;
	}
	
	const footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	const embed = new Discord.MessageEmbed()
		.setColor('#ffdd00')
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setDescription(joinMessage);

	channel.send(`${member}`, {embed: embed});
};

module.exports.config = {
    name: "joinMessage"
};
