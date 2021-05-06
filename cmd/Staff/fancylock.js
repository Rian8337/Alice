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

    const duration = parseFloat(args[1]);
    if (isNaN(duration) || duration <= 0) {
        return message.channel.send("❎ **| Hey, please enter a valid lock duration!**");
    }

    const reason = args.slice(2).join(" ");
    if (!reason) {
        return message.channel.send("❎ **| Please enter lock reason!**");
    }

    const loungedb = alicedb.collection("loungelock");
    const channel = message.guild.channels.cache.get("667400988801368094");
    const query = {discordid: user.id};
    loungedb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        const role = message.member.roles.cache.find((r) => r.name === 'Lounge Pass');
        if (role) {
            user.roles.remove(role, "Locked from lounge").catch(console.error);
        }
        const newExpiration = Date.now() + duration * 1000;
        if (userres && (userres.expiration ?? Number.POSITIVE_INFINITY) < newExpiration) {
            return message.channel.send(`❎ **| I'm sorry, your new lock duration is shorter than the currently applied lock (which will ${(userres.expiration ?? Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY ? "not expire" : `expire at ${new Date(userres.expiration).toUTCString()}`}).**`);
        }
        message.channel.send(`✅ **| User has been locked from ${channel} for \`${reason}\`.**`);
        channel.updateOverwrite(user, {"VIEW_CHANNEL": false}, "Lounge ban").catch(console.error);

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setFooter(`User ID: ${user.id}`, footer[index])
            .setColor(message.member.displayHexColor)
            .setDescription(`${user} has been locked from <#667400988801368094>.\nReason: ${reason}`);

        const managementChannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
        managementChannel.send({embed: embed});
        query.expiration = newExpiration;

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
    usage: "fancylock <user> <duration> <reason>",
    detail: "`duration`: The duration to lock the user. For permanent lock, use `Infinity` [Decimal]\n`reason`: Reason to lock [String]\n`user`: The user to lock [UserResolvable (mention or user ID)]",
    permission: "Bot Creators"
};
