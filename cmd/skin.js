module.exports.run = (client, message, args, alicedb) => {
    let user = message.author.id;
    let skindb = alicedb.collection("playerskins");
    let query = {discordid: user};
    if (args[0] == 'set') {
        let skinlink = args.slice(1).join(" ");
        if (!skinlink) return message.channel.send("❎ **| Please enter skin link!**");
        skindb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            if (!res[0]) {
                var skinval = {
                    discordid: user,
                    skin: skinlink
                };
                skindb.insertOne(skinval, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("Error: Empty database response. Please try again!")
                    }
                    console.log("Skin added for " + user);
                    message.channel.send(`✅ **| ${message.author.username}'s skin has been set to ${skinlink}.**`)
                })
            } else {
                var updateval = {
                    $set: {
                        discordid: user,
                        skin: skinlink
                    }
                };
                skindb.updateOne(query, updateval, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("Error: Empty database response. Please try again!")
                    }
                    console.log("Skin updated for " + user);
                    message.channel.send(`✅ **| ${message.author.username}'s skin has been set to ${skinlink}.**`)
                })
            }
        })
    }
    else {
        if (args[0]) user = args[0];
        user = user.replace("<@", "");
        user = user.replace(">", "");
        query = {discordid: user};
        skindb.find(query).toArray(async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            if (res[0]) {
                let name = await client.fetchUser(user);
                name = name.username;
                let skinlink = res[0].skin;
                message.channel.send(`✅ **| ${name}'s skin: ${skinlink}.**\nFor a collection of skins, visit https://tsukushi.site/`)
            }
            else {
                if (args[0]) message.channel.send("❎ **| The user hasn't set their skin yet! He/she must use `a!skin set <skin link>` first.**\nFor a collection of skins, visit https://tsukushi.site/");
                else message.channel.send("❎ **| You haven't set your skin yet! You must use `a!skin set <skin link>` first.**\nFor a collection of skins, visit https://tsukushi.site/")
            }
        })
    }
};

module.exports.help = {
    name: "skin"
};
