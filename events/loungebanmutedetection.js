module.exports.run = (message, alicedb) => {
    const embed = message.embeds[0];
    let muted = '';
    let mutetime = 0;
    for (const field of embed.fields) {
        if (field.name.startsWith("Length")) mutetime = parseInt(field.name.substring("Length: ".length));
        if (field.name.startsWith("Muted User: ")) muted = message.guild.members.cache.find(m => m.user.username === field.name.substring("Muted User: ".length))
        if (muted && mutetime) break
    }
    if (mutetime > 21600) {
        const loungedb = alicedb.collection("loungelock");
        loungedb.findOne({discordid: muted.id}, (err, res) => {
            if (err) {
                console.log(err);
                message.channel.send("❎ **| Unable to retrieve lounge lock data.**")
            }
            else if (!res) {
                loungedb.insertOne({discordid: muted.id}, err => {
                    if (err) {
                        console.log(err);
                        message.channel.send("❎ **| Unable to insert lounge lock data.**")
                    }
                    else message.channel.send("✅ **| Successfully locked user from lounge.**")
                })
            }
        })
    }
};

module.exports.config = {
    name: "loungebanmutedetection"
};