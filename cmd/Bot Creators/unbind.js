module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to use this.**");

    let uid = parseInt(args[0]);
    if (isNaN(uid)) return message.channel.send("❎ **| I'm sorry, please specify a valid uid!**");
    uid = uid.toString();

    const binddb = maindb.collection("userbind");
    const query = {previous_bind: {$all: [uid]}};
    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, this uid has not been binded!**");
        let previous_bind = res.previous_bind;
        const index = previous_bind.findIndex(u => u === uid);
        previous_bind.splice(index, 1);
        const updateVal = {
            $set: {
                previous_bind: previous_bind
            }
        };
        if (res.uid === uid) updateVal.$set.uid = previous_bind[Math.floor(Math.random() * previous_bind.length)];
        binddb.updateOne({discordid: res.discordid}, updateVal, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            message.channel.send(`✅ **| Successfully unbinded uid ${uid}.**`)
        })
    })
};

module.exports.config = {
    name: "unbind",
    description: "Unbinds an osu!droid account.",
    usage: "unbind <uid>",
    detail: "`uid`: The uid to unbind [Integer]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};