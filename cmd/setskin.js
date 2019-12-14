module.exports.run = (client, message, args, maindb) => {
    let skinlink = args.join(" ");
    if (!skinlink) return message.channel.send("❎  **| Please enter skin link!**");

    let skindb = maindb.collection("skin");
    let query = {discordid: message.author.id};
    skindb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res[0]) {
            var skinval = {
                discordid: message.author.id,
                skin: skinlink
            };
            skindb.insertOne(skinval, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                console.log("Skin added for " + message.author.id);
                message.channel.send(`✅  **| ${message.author.username}'s skin has been set to ${skinlink}.**`)
            })
        } else {
            var updateval = {
                $set: {
                    discordid: message.author.id,
                    skin: skinlink
                }
            };
            skindb.updateOne(query, updateval, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                console.log("Skin updated for " + message.author.id);
                message.channel.send(`✅  **| ${message.author.username}'s skin has been set to ${skinlink}.**`)
            })
        }
    })
};

module.exports.help = {
    name: "setskin"
};
