const Discord = require("discord.js");
const config = require("../../config.json");
const cd = new Set();

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!args[0]) return;
    if (message.member.roles.cache.find((r) => r.name === 'report-ban')) {
        message.author.lastMessage.delete().catch(console.error);
        return message.channel.send(`❎ **| ${message.author}, you were banned from submitting reports!**`).then(message => {
            message.delete({timeout: 5000})
        });
    }
    let channel = message.guild.channels.cache.find((c) => c.name === config.report_channel);
    if (!channel) return message.channel.send(`❎ **| ${message.author}, please create #${config.report_channel} first!**`);
    let user = message.author.id;
    if (message.member.roles.cache.find((r) => r.name === 'Helper') || message.member.roles.cache.find((r) => r.name === 'Moderator')) cd.delete(user);
    if (cd.has(user)) return message.channel.send(`❎ **| ${message.author}, you are still in cooldown! Please wait before submitting another report!**`).then(message => message.delete({timeout: 5000}));

    let toreport = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    if (!toreport) return message.channel.send(`❎ **| ${message.author}, please enter a valud user!**`);
    if (toreport.hasPermission("ADMINISTRATOR")) return message.channel.send(`❎ **| ${message.author}, you cannot report this user!**`);
    if (toreport.id == message.author.id) return message.channel.send(`❎ **| ${message.author}, you cannot report yourself!**`);
    let reason = args.slice(1).join(" ");
    if (!reason) return message.reply(`❎ **| ${message.author}, please enter a reason!**`);

    message.author.lastMessage.delete().catch(console.error);

    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let reportembed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor(rolecheck)
        .setTimestamp(new Date())
        .setFooter("React to this message upon completing report based on decision given")
        .addField("Reported user: " + toreport.user.username, `Reported in: ${message.channel}`)
        .addField("Reason: ", reason);

    channel.send("<@&369108742077284353> <@&595667274707370024>", {embed: reportembed});
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);

    let replyembed = new Discord.MessageEmbed()
        .setTitle("Report statistics")
        .setColor("#527ea3")
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index])
        .addField("Reported user: " + toreport.user.username, `Reported in: ${message.channel}`)
        .addField("Reason: " + reason, "Make sure you have evidence ready!\nAbuse of this command will make you unable to submit reports.");

    try {
        message.author.send({embed: replyembed})
    } catch (e) {
        message.channel.send(`❎ **| ${message.author}, your DM is locked, so you didn't receive a copy of your report. Sorry!**`).then(message => {
            message.delete({timeout: 5000})
        })
    }

    let cooldown = config.member_cooldown;
    if (!message.member.roles.cache.find((r) => r.name === 'Helper') && !message.member.roles.cache.find((r) => r.name === 'Moderator')) {
        cd.add(user);
        setTimeout(() => {
            cd.delete(user)
        }, cooldown * 1000)
    }
};

module.exports.config = {
    name: "report",
    description: "Reports a user for breaking rules.\n\nBeware! This will ping all moderators and helpers across the server! Abuse of command can result in mute or inability to submit further reports.",
    usage: "report <user> <reason>",
    detail: "`user`: The user to report [UserResolvable (mention or user ID)]\n`reason`: Reason for reporting [String]",
    permission: "None"
};
