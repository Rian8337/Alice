const config = require('../../config.json');
const {Client, Message, MessageEmbed} = require('discord.js');

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    if (message.guild?.id !== "316545691545501706") {
        return message.channel.send("❎ **| I'm sorry, this command is only available in the international server!**");
    }

    message.delete().catch(console.error);

    const toreport = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(() => {});
    if (!toreport) {
        return message.channel.send("❎ **| Hey, please enter a valid user to report!**");
    }
    if (toreport.hasPermission("ADMINISTRATOR")) {
        return message.channel.send("❎ **| I'm sorry, you cannot report this user!**");
    }
    if (toreport.id === message.author.id) {
        return message.channel.send("❎ **| Hey, you cannot report yourself!**");
    }

    const reason_index = message.content.split(/\s/g).slice(0, 2).join(" ").length + 1;
    const reason = message.content.substring(reason_index);
    if (!reason) {
        return message.channel.send("❎ **| Hey, please enter your reason for reporting!**");
    }

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const report_embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor(message.member.roles.color?.hexColor || "#000000")
        .setThumbnail(toreport.user.avatarURL({dynamic: true}))
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setDescription(`**Offender**: ${toreport} (${toreport.id})\n**Channel**: ${message.channel}\n**Reason**: ${reason}`);

    if (message.attachments.size > 0) {
        const attachments = [];
        for (const [, attachment] of message.attachments.entries()) {
            const url = attachment.url;
            const length = url.length;
            if (
                url.indexOf("png", length - 3) === -1 &&
                url.indexOf("jpg", length - 3) === -1 &&
                url.indexOf("jpeg", length - 4) === -1
            ) {
                return message.channel.send("❎ **| Hey, please provide a valid screenshot!**");
            }
            attachments.push(attachment);
            if (attachments.length === 3) {
                break;
            }
        }
        report_embed.attachFiles(attachments);
    }

    const server_channel = message.guild.channels.cache.find(c => c.name === config.report_channel);
    server_channel.send("", {embed: report_embed});

    const reply_embed = new MessageEmbed()
        .setAuthor("Report Summary")
        .setColor("#527ea3")
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setDescription(`**Offender**: ${toreport} (${toreport.id})\n**Channel**: ${message.channel}\n**Reason**: ${reason}\n\nRemember to save your evidence in case it is needed.`);

    message.author.send({embed: reply_embed})
        .catch(() =>
            message.channel.send(`❗**| ${message.author}, your DM is locked, therefore you will not receive your report's summary!**`)
                .then(m => m.delete({timeout: 5000}))
        );
};

module.exports.config = {
    name: "report",
    description: "Reports a user for breaking rules. As of now, this is only available in international server.\n\nYou can attach up to 3 screenshots as proof if needed.",
    usage: "report <user> <reason>",
    detail: "`user`: The user to report [UserResolvable (mention or user ID)]\n`reason`: Reason for reporting [String]",
    permission: "None"
};