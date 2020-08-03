const config = require('../../config.json');
const {Client, Message, MessageEmbed} = require('discord.js');

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
    if (message.channel.type !== "text") return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!args[0]) return;

    message.delete().catch(console.error);

    let toreport = message.guild.member(message.mentions.users.first() || message.guild.members.resolve(args[0]));
    if (!toreport) return message.channel.send("❎ **| Hey, please enter a valid user to report!**");
    //if (toreport.hasPermission("ADMINISTRATOR", {checkOwner: true})) return message.channel.send("❎ **| I'm sorry, you cannot report this user!**");
    if (toreport.id === message.author.id) return message.channel.send("❎ **| Hey, you cannot report yourself!**");

    const reason_index = message.content.split(/\s/g).slice(0, 2).join(" ").length + 1;
    let reason = message.content.substring(reason_index);
    if (!reason) return message.channel.send("❎ **| Hey, please enter your reason for reporting!**");

    let rolecheck = '#000000';
    if (message.member.roles.color) rolecheck = message.member.roles.color.hexColor;

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const report_embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor(rolecheck)
        .setThumbnail(toreport.user.avatarURL({dynamic: true}))
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setDescription(`**Offender**: ${toreport} (${toreport.id})\n**Channel**: ${message.channel}\n**Reason**: ${reason}`);

    let server_channel = message.guild.channels.cache.find(c => c.name === config.report_channel);
    server_channel.send("", {embed: report_embed});
    // <@&369108742077284353> <@&595667274707370024>
    const reply_embed = new MessageEmbed()
        .setAuthor("Report Summary")
        .setColor("#527ea3")
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setDescription(`**Offender**: ${toreport} (${toreport.id})\n**Channel**: ${message.channel}\n**Reason**: ${reason}\n\nRemember to save your evidence in case it is needed.`);

    message.author.send({embed: reply_embed})
        .catch(() => message.channel.send(`❗**| ${message.author}, your DM is locked, therefore you will not receive your report's summary!**`)
        .then(m => m.delete({timeout: 5000})));
};

module.exports.config = {
    name: "report",
    description: "Reports a user for breaking rules.",
    usage: "report <user> <reason>",
    detail: "`user`: The user to report [UserResolvable (mention or user ID)]\n`reason`: Reason for reporting [String]",
    permission: "None"
};