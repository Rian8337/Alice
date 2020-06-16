module.exports.run = client => {
    let guild = client.guilds.cache.get("316545691545501706");
	let channel = guild.channels.cache.get("669221772083724318");
	channel.messages.fetch("674626850164703232").then(message => {
		message.react("✅").catch(console.error);
		let collector = message.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && user.id !== client.user.id);
		collector.on("collect", () => {
			message.reactions.cache.find((r) => r.emoji.name === "✅").users.fetch({limit: 10}).then(collection => {
				let user = guild.member(collection.find((u) => u.id !== client.user.id).id);
				let role = guild.roles.cache.get("674918022116278282");
				if (!user.roles.cache.has(role.id)) user.roles.add(role, "Automatic role assignment").catch(console.error);
				else user.roles.remove(role, "Automatic role assignment").catch(console.error);
				message.reactions.cache.forEach((reaction) => reaction.users.remove(user.id).catch(console.error))
			})
		})
	}).catch(console.error)
};

module.exports.config = {
    name: "challengeRoleReaction"
};