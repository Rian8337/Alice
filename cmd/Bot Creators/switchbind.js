const { Client, Message } = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
    if (message.channel.type !== "text") {
        return;
    }
    const uid = parseInt(args[0]);
    if (isNaN(uid)) {
        return message.channel.send("❎ **| Hey, please mention a valid uid!**");
    }

    const user = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch();
    if (!user) {
        return message.channel.send("❎ **| Hey, please mention a valid user!**");
    }

    const binddb = maindb.collection("userbind");
    const query = {previous_bind: {$all: [uid]}};

    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this uid is not binded to anyone!**");
        }
        if (res.discordid === user.id) {
            return message.channel.send("❎ **| Hey, you can't switch the bind to the same Discord account!**");
        }

        const previousBind = res.previous_bind;

        if (previousBind.length > 0) {
            const index = previousBind.findIndex(v => v === uid);
            const removedUid = previousBind.splice(index, 1);

            const updateVal = {
                $set: {
                    previous_bind: previousBind
                }
            };

            if (removedUid === res.uid) {
                updateVal.$set.uid = Math.floor(Math.random() * previousBind.length);
            }

            binddb.updateOne(query, updateVal, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                binddb.updateOne({discordid: user.id}, {$addToSet: {previous_bind: uid}}, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send("✅ **| Successfully switched bind.**");
                });
            });
        } else {
            const updateVal = {
                $set: {
                    discordid: user.id
                }
            };
    
            binddb.updateOne(query, updateVal, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                message.channel.send("✅ **| Successfully switched bind.**");
            });
        }        
    });
};

module.exports.config = {
    name: "switchbind",
    description: "Switches osu!droid account bind from one Discord account to another.",
    usage: "switchbind <uid> <user>",
    detail: "`uid`: The uid to switch [Integer]\n`user`: The user to switch the bind to [UserResolvable (mention or user ID)]",
    permission: "Bot Creators"
};