const { GuildMember } = require('discord.js');

/**
 * @param {GuildMember} oldMember 
 * @param {GuildMember} newMember 
 */
 module.exports.run = (oldMember, newMember) => {
    if (oldMember.user.bot) {
		return;
	}
	const general = oldMember.guild.channels.cache.get("316545691545501706");
	if (!general || oldMember.roles.cache.find(r => r.name === "Member") || !newMember.roles.cache.find(r => r.name === "Member")) {
		return;
	}
	general.send(`Welcome to ${oldMember.guild.name}, <@${oldMember.id}>!`, {files: ["https://i.imgur.com/LLzteLz.jpg"]});
};

module.exports.config = {
    name: "introduction"
};
