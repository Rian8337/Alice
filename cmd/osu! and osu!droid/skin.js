const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    let user = message.author.id;
    const skindb = alicedb.collection("playerskins");
    query = {discordid: user};
    if (args[0] === 'set') {
        const skinlink = args.slice(1).join(" ");
        if (!skinlink) {
            return message.channel.send("❎ **| Please enter skin link!**");
        }
        skindb.findOne(query, (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            if (!res) {
                const skinval = {
                    discordid: user,
                    skin: skinlink
                };
                skindb.insertOne(skinval, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    console.log("Skin added for " + user);
                    message.channel.send(`✅ **| ${message.author.username}'s skin has been set to ${skinlink}.**`);
                });
            } else {
                const updateval = {
                    $set: {
                        discordid: user,
                        skin: skinlink
                    }
                };
                skindb.updateOne(query, updateval, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    console.log("Skin updated for " + user);
                    message.channel.send(`✅ **| ${message.author.username}'s skin has been set to ${skinlink}.**`);
                });
            }
        });
    } else {
        if (args[0]) {
            user = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
        }
        query = {discordid: user};
        skindb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            if (res) {
                let name = await client.users.fetch(user);
                name = name.username;
                message.channel.send(`✅ **| ${name}'s skin: ${res.skin}.**\nFor a collection of skins, visit https://tsukushi.site/`);
            } else {
                if (args[0]) {
                    message.channel.send("❎ **| The user hasn't set their skin yet! He/she must use `a!skin set <skin link>` first.**\nFor a collection of skins, visit https://tsukushi.site/");
                } else {
                    message.channel.send("❎ **| You haven't set your skin yet! You must use `a!skin set <skin link>` first.**\nFor a collection of skins, visit https://tsukushi.site/");
                }
            }
        });
    }
};

module.exports.config = {
    name: "skin",
    description: "Sets a skin or retrieves a user's skin.",
    usage: "skin [user]\nskin set <skin link>",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};