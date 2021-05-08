const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!message.member.hasPermission("KICK_MEMBERS")) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const tokick = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
    if (!tokick) {
        return message.channel.send("❎ **| I can't find the user. Can you make sure you have entered a correct one?**");
    }

    if (message.member.roles.highest.comparePositionTo(tokick.roles.highest) <= 0) {
        return message.channel.send("❎ **| I'm sorry, this user cannot be kicked since your role is lower than or equal to the user's highest role!**");
    }

    if (message.member.roles.highest.comparePositionTo(message.guild.members.resolve(client.user).roles.highest) <= 0) {
        return message.channel.send("❎ **| I'm sorry, I cannot kick the user since my highest role is lower than or equal to the user's highest role!**");
    }

    const reason = args.slice(1).join(" ") || "Not specified.";

    message.channel.send(`❗**| ${message.author}, are you sure you want to kick the user?**`).then(msg => {
        msg.react("✅").catch(console.error);
        let confirmation = false;
        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

        confirm.on("collect", () => {
            confirmation = true;
            msg.delete();
            tokick.kick(reason).then(() => {
                const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                    .setColor(message.member.roles.color.hexColor)
                    .setTimestamp(new Date())
                    .setTitle("Kick executed")
                    .addField("Kicked user: " + tokick.user.username, "User ID: " + tokick.id)
                    .addField("=========================", "Reason:\n" + reason);

                message.channel.send({embed: embed});
            });
        });

        confirm.on("end", () => {
            if (!confirmation) {
                msg.delete();
                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
            }
        });
    });
};

module.exports.config = {
    name: "kick",
    description: "Kicks a user.",
    usage: "kick <user> [reason]",
    detail: "`user`: The user to kick [UserResolvable (mention or user ID)]\n`reason`: Reason for kicking [String]",
    permission: "Kick Members"
};