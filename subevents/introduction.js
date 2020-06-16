const fs = require('fs');

module.exports.run = (oldMember, newMember) => {
    if (oldMember.user.bot) return;
	let general = oldMember.guild.channels.cache.get("316545691545501706");
	if (!general || oldMember.roles.cache.find((r) => r.name === "Member") || oldMember.roles.cache.size == newMember.roles.cache.size) return;
	general.send(`Welcome to ${oldMember.guild.name}, <@${oldMember.id}>!`, {files: ["https://i.imgur.com/LLzteLz.jpg"]})
};

module.exports.config = {
    name: "introduction"
};
