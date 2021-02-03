const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * 
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
        return message.channel.send("❎ **| I'm sorry, this command is only available in osu!droid (International) Discord server!**");
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
        return message.channel.send("❎ **| Please enter lock reason!**");
    }

    const loungedb = alicedb.collection("loungelock");
    const query = {discordid: user.id};
    loungedb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (userres) {
            return message.channel.send("❎ **| I'm sorry, this user has already been locked from <#667400988801368094>!**");
        }
        const role = message.member.roles.cache.find((r) => r.name === 'Lounge Pass');
        if (role) {
            user.roles.remove(role, "Locked from lounge").catch(console.error);
        }
        message.channel.send("✅ **| User has been locked from <#667400988801368094>.**");
        message.guild.channels.cache.get("667400988801368094").updateOverwrite(user, {"VIEW_CHANNEL": false}, "Lounge ban").catch(console.error);

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setFooter(`User ID: ${user.id}`, footer[index])
            .setColor(message.member.roles.color.hexColor)
            .setDescription(`${user} has been locked from <#667400988801368094>.\nReason: ${reason}`);

        let channel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
        channel.send({embed: embed});

        loungedb.insertOne(query, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            console.log("Lounge ban data updated");
        });
    });
};

module.exports.config = {
    name: "fancylock",
    description: "Locks a user from lounge channel.",
    usage: "fancylock <user> <reason>",
    detail: "`user`: The user to lock [UserResolvable (mention or user ID)]\n`reason`: Reason to lock",
    permission: "Bot Creators"
};
