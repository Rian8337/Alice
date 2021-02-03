const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require("../../config.json");

/**
 * Converts time from seconds to human-readable form.
 * @param {number} num Amount of time in seconds.
 * @returns {string} The human-readable form of time.
 */
function timeConvert(num) {
    let hours = Math.floor(num / 3600);
    let minutes = Math.floor((num - hours * 3600) / 60);
    let seconds = num - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":");
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!message.member.hasPermission("CREATE_INSTANT_INVITE")) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    let maxage = parseInt(args[0]);
    if (isNaN(maxage) || maxage < 0 || (maxage > 0 && maxage < 1)) {
        return message.channel.send("❎ **| Hey, please enter valid time (in seconds) until invite link expires!**");
    }

    let maxuses = parseInt(args[1]);
    if (isNaN(maxuses) || maxuses < 0) {
        return message.channel.send("❎ **| Hey, please enter maximum invite link usage!**");
    }
    const reason = args.slice(2).join(" ") || "Not specified";

    message.guild.systemChannel.createInvite({maxAge: maxage, maxUses: maxuses, reason: reason}).then(invite => {
        let time = timeConvert(maxage);
        if (maxage === 0) {
            time = 'Never';
        }
        if (maxuses === 0) {
            maxuses = 'Infinite';
        }

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.roles.color?.hexColor || "#000000")
            .setTitle("Invite link created")
            .addField("Created in", message.channel)
            .addField("Maximum usage", maxuses)
            .addField("Expiration time", time)
            .addField("Reason", reason)
            .addField("Invite link", invite.url);

        message.channel.send({embed: embed}).catch(console.error);
    });
};

module.exports.config = {
    name: "createinvite",
    description: "Creates an invite link to the server's system channel.",
    usage: "createinvite <duration> <usage>",
    detail: "`duration`: Invite link expiration in seconds, set to 0 for never expire [Integer]\n`usage`: Maximum usage of invite link, set to 0 for infinite [Integer]",
    permission: "Create Invite"
};