module.exports.run = (client, member, alicedb) => {
    alicedb.collection("loungelock").findOne({discordid: member.id}, (err, res) => {
		if (err) {
			console.log(err);
			console.log("Unable to retrieve lounge ban data");
		}
		if (!res) {
			return;
		}
		const channel = client.channels.cache.get('667400988801368094');
		channel.updateOverwrite(member.user, {"VIEW_CHANNEL": false}, 'Lounge ban').catch(console.error);
	});
};

module.exports.config = {
    name: "newMemberLoungeBan"
};