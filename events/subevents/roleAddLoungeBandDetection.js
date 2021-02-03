const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (newMember, alicedb) => {
    if (newMember.guild.id != '316545691545501706' || newMember.roles == null) {
		return;
	}
	let role = newMember.roles.cache.find((r) => r.name === 'Lounge Pass');
	if (!role) return;
	alicedb.collection("loungelock").findOne({discordid: newMember.id}, (err, res) => {
		if (err) {
			console.log(err);
			console.log("Unable to retrieve lounge ban data");
		}
		if (!res) {
			return;
		}
		newMember.roles.remove(role, "Locked from lounge channel").catch(console.error);
		const footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let embed = new Discord.MessageEmbed()
			.setDescription(`${newMember} is locked from lounge channel!`)
			.setFooter(`User ID: ${newMember.id}`, footer[index])
			.setColor("#b58d3c");
		newMember.guild.channels.cache.find(c => c.name === config.management_channel).send({embed: embed});
	});
};

module.exports.config = {
	name: "roleAddLoungeBanDetection"
};