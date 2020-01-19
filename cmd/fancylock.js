let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only available in osu!droid (International) Discord server!**");
    if (message.author.id != '386742340968120321' && message.author.id != '132783516176875520') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**");
    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Please enter lock reason!**");

    let loungedb = alicedb.collection("loungelock");
    let query = {discordid: user.id};
    loungedb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (userres[0]) return message.channel.send("❎ **| I'm sorry, this user has already been locked from <#667400988801368094>!**");
        let role = message.member.roles.find(r => r.name === 'Lounge Pass');
        if (role) user.removeRole(role, "Locked from lounge").catch(console.error);
        message.channel.send("✅ **| User has been locked from <#667400988801368094>.**");

        var rolecheck;
        try {
            rolecheck = message.member.highestRole.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter(`User ID: ${user.id}`, footer[index])
            .setColor(rolecheck)
            .setDescription(`${user} has been locked from <#667400988801368094>.\nReason: ${reason}`)

        let channel = message.guild.channels.find(c => c.name === config.management_channel);
        channel.send({embed: embed});

        loungedb.insertOne(query, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            console.log("Lounge ban data updated")
        })
    })
};

module.exports.config = {
    description: "Locks a user from lounge channel.",
    usage: "fancylock <user> <reason>",
    detail: "`user`: The user to lock [UserResolvable (mention or user ID)]\n`reason`: Reason to lock",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
    name: "fancylock"
};
