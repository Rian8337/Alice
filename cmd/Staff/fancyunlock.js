const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (message.guild.id !== '316545691545501706') {
        return message.channel.send("❎ **| I'm sorry, this command is only available in droid (International) Discord server!**");
    }
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const user = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch();
    if (!user) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**");
    }
    const reason = args.slice(1).join(" ");
    if (!reason) {
        return message.channel.send("❎ **| Please enter unlock reason!**");
    }

    const loungedb = alicedb.collection("loungelock");
    const channel = message.guild.channels.cache.get("667400988801368094");
    const query = {discordid: user.id};
    loungedb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this user is not locked from the channel!**");
        }
        // Only clear database entry without sending further message notifications if the lock has expired.
        const hasExpired = (res.expiration ?? Number.POSITIVE_INFINITY) < Date.now();
        if (hasExpired) {
            return message.channel.send("❎ **| I'm sorry, the user's lock has expired!**");
        }

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setFooter(`User ID: ${user.id}`, footer[index])
            .setColor(message.member.displayHexColor)
            .setDescription(`${user} has been unlocked from ${channel}.\nReason: ${reason}`);

        const managementChannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
        channel.permissionOverwrites.get(user.id).delete();

        loungedb.deleteOne(query, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            if (!hasExpired) {
                message.channel.send(`✅ **| User has been unlocked from ${channel}.**`);
                managementChannel.send({embed: embed});
            }
            console.log("Lounge ban data updated");
        });
    });
};

module.exports.config = {
    name: "fancyunlock",
    description: "Unlocks a user from lounge channel.",
    usage: "fancyunlock <user> <reason>",
    detail: "`user`: The user to unlock [UserResolvable (mention or user ID)]\n`reason`: Reason to unlock",
    permission: "Bot Creators"
};