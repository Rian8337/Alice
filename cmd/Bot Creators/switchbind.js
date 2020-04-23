module.exports.run = (client, message, args, maindb) => {
    if (message.author.id !== '386742340968120321' && message.author.id !== '132783516176875520') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    const uid = parseInt(args[0]);
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, please mention a valid uid!**");

    const user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
    if (!user) return message.channel.send("❎ **| Hey, please mention a valid user!**");

    const binddb = maindb.collection("userbind");
    const query = {uid: uid.toString()};
    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, this uid is not binded to anyone!**");
        if (res.discordid === user.id) return message.channel.send("❎ **| Hey, you can't switch the bind to the same Discord account!**");

        let updateVal = {
            $set: {
                discordid: user.id
            }
        };

        binddb.updateOne(query, updateVal, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            message.channel.send("✅ **| Successfully switched bind.**")
        })
    })
};

module.exports.config = {
    name: "switchbind",
    description: "Switches osu!droid account bind from one Discord account to another.",
    usage: "switchbind <uid> <user>",
    detail: "`uid`: The uid to switch [Integer]\n`user`: The user to switch the bind to [UserResolvable (mention or user ID)]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};