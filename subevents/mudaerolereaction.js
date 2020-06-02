module.exports.run = client => {
    let guild = client.guilds.cache.get("635532651029332000");
	let channel = guild.channels.cache.get("640165306404438026");
	channel.messages.fetch("657597328772956160").then(message => {
		message.react('639481086425956382').catch(console.error);
		let collector = message.createReactionCollector((reaction, user) => reaction.emoji.id === '639481086425956382' && user.id !== client.user.id);
		collector.on("collect", () => {
			message.reactions.cache.find((r) => r.emoji.id === '639481086425956382').users.fetch({limit: 10}).then(collection => {
				let user = guild.member(collection.find((u) => u.id !== client.user.id).id);
				let role = guild.roles.cache.get("640434406200180736");
				if (!user.roles.cache.has(role.id)) user.roles.add(role, "Agreed to Mudae rules").catch(console.error);
				else user.roles.remove(role, "Disagreed to Mudae rules").catch(console.error);
				message.reactions.cache.forEach((reaction) => reaction.users.remove(user.id).catch(console.error))
			})
		})
	}).catch(console.error)
};

module.exports.config = {
	name: "mudaerolereaction"
};