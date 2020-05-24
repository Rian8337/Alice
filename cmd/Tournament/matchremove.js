module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
    const id = args[0];
    if (!id) return message.channel.send("❎ **| Hey, please enter a match ID!**");

    const matchdb = maindb.collection("matchinfo");
    matchdb.findOne({matchid: id}, (err, res) => {
        if (err) {
            console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, there is no match with given match ID!**");
        matchdb.deleteOne({matchid: id}, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            message.channel.send(`✅ **| Successfully removed match \`${id}\`.**`)
        })
    })
};

module.exports.config = {
    name: "matchremove",
	description: "Removes a match.",
	usage: "matchremove <match ID>",
	detail: "`match ID`: The match's ID [String]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
}