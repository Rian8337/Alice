const fs = require('fs');

module.exports.run = (oldMember, newMember) => {
    if (oldMember.user.bot) return;
	let general = oldMember.guild.channels.cache.get("316545691545501706");
	if (!general || oldMember.roles.cache.find((r) => r.name === "Member") || oldMember.roles.cache.size == newMember.roles.cache.size) return;
	fs.readFile("../welcome.txt", 'utf8', (err, data) => {
		if (err) return console.log(err);
		let welcomeMessage = `Welcome to ${oldMember.guild.name}, <@${oldMember.id}>!`;
		setTimeout(() => {
			oldMember.user.send(data).catch(console.error);
			general.send(welcomeMessage, {files: ["https://i.imgur.com/LLzteLz.jpg"]})
		}, 100)
	})
};

module.exports.config = {
    name: "introduction"
};