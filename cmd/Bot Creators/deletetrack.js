module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) return message.channel.send("❎ **| You don't have enough permission to use this.**");
	let uid = args[0];
	if (isNaN(parseInt(uid))) return message.channel.send("❎ **| I'm sorry, that uid is invalid!**");
	let trackdb = maindb.collection("tracking");
	let query = { uid: uid };
	trackdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, this uid is not currently being tracked!**");
		trackdb.deleteOne(query, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			message.channel.send(`✅ **| No longer tracking uid ${uid}.**`);
		})
	})
};

module.exports.config = {
	name: "deletetrack",
	description: "Deletes a uid from tracking list.",
	usage: "deletetrack <uid>",
	detail: "`uid`: Uid to delete [Integer]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};