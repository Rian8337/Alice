const { Client } = require('discord.js');

/**
 * @param {Client} client 
 */
module.exports.run = client => {
    const guild = client.guilds.cache.get("316545691545501706");
	const channel = guild.channels.cache.get("669221772083724318");
	const role = guild.roles.cache.get("674918022116278282");
	channel.messages.fetch("674626850164703232").then(message => {
		message.react("✅").catch(console.error);
		const collector = message.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && user.id !== client.user.id);
		collector.on("collect", async (reaction, user) => {
			const guildUser = await guild.members.fetch(user);
			if (guildUser.roles.cache.has(role.id)) {
				guildUser.roles.remove(role, "Automatic role assignment").catch(console.error);
			} else {
				guildUser.roles.add(role, "Automatic role assignment").catch(console.error);
			}
			message.reactions.cache.forEach(reaction => reaction.users.remove(user.id).catch(console.error));
		});
	}).catch(console.error);
};

module.exports.config = {
    name: "challengeRoleReaction"
};