const Discord = require('discord.js');
const { Db } = require('mongodb');
const { Utils } = require('osu-droid');
const config = require('../../config.json');

/**
 * @param {Discord.GuildMember} newMember 
 * @param {Db} alicedb 
 */
module.exports.run = (newMember, alicedb) => {
    if (newMember.guild.id !== '316545691545501706') {
		return;
	}
	const role = newMember.roles.cache.find((r) => r.name === 'Lounge Pass');
	if (!role) {
		return;
	}
	alicedb.collection("loungelock").findOne({discordid: newMember.id}, (err, res) => {
		if (err) {
			console.log(err);
			console.log("Unable to retrieve lounge ban data");
		}
		if (!res) {
			return;
		}
		if ((res.expiration ?? Number.POSITIVE_INFINITY) < Date.now()) {
			// Delete lock permission if the lock is already expired
			newMember.guild.channels.cache.get("667400988801368094").permissionOverwrites.get(newMember.id).delete();
			return;
		}
		const { expiration } = res;
		newMember.roles.remove(role, `Locked from lounge channel for \`${res.reason ?? "not specified"}\``).catch(console.error);
		const embed = new Discord.MessageEmbed()
			.setDescription(`${newMember} is locked from lounge channel!\nReason: ${res.reason ?? "Not specified"}.\n\nThis lock will ${(expiration ?? Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY ? "not expire" : `expire at ${new Date(expiration).toUTCString()}`}.`)
			.setFooter(`User ID: ${newMember.id}`, Utils.getRandomArrayElement(config.avatar_list))
			.setColor("#b58d3c");
		newMember.guild.channels.cache.find(c => c.name === config.management_channel).send({embed: embed});
	});
};

module.exports.config = {
	name: "roleAddLoungeBanDetection"
};