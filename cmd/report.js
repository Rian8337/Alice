var Discord = require("discord.js");
var config = require("../config.json");
var cd = new Set();

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) {
        message.channel.send("This command is not allowed in DMs");
        return;
    }
    if (!args[0]) return;
    if (message.member.roles.find("name", "report-ban")) {
        message.author.lastMessage.delete();
        message.reply("you were banned from submitting reports!").then (message => {
            message.delete(5000)
        });
        return;
    }
    let channel = message.guild.channels.find(c => c.name === config.report_channel);
    if (!channel) {
        message.reply(`please create #${config.report_channel} first!`);
        return;
    }
    let user = message.author.id;
    if (message.member.roles.find("name", "Helper") || message.member.roles.find("name", "Moderator")) cd.delete(user);
    if (cd.has(user)) {
        message.reply("you are still on cooldown!").then(message => {
            message.delete(5000)
        });
        return;
    }
    let toreport = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!toreport) return;
    let reason = args.slice(1).join(" ");
    if (!reason) {
        message.reply("please add a reason.");
        return;
    }

    message.author.lastMessage.delete();

    let reportembed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(message.member.highestRole.hexColor)
        .setTimestamp(new Date())
        .setFooter("React to this message upon completing report based on decision given")
        .addField("Reported user: " + toreport.user.username, "Reported in: " + message.channel)
        .addField("Reason: ", reason);

    channel.send(reportembed);

    let replyembed = new Discord.RichEmbed()
        .setTitle("Report statistics")
        .setColor("#527ea3")
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
        .addField("Reported user: " + toreport.user.username, "Reported in: " + message.channel)
        .addField("Reason: " + reason, "Make sure you have evidence ready!\nAbuse of this command will make you unable to submit reports.");

    try {
        await message.author.send(replyembed);
    } catch (e) {
        message.reply("your DM is locked, so you didn't receive a copy of your report. Sorry!").then (message => {
            message.delete(5000)
        })
    }

    let cooldown = config.member_cooldown;
    if (!message.member.roles.find("name", "Helper") && !message.member.roles.find("name", "Moderator")) {
        cd.add(user);
        setTimeout(() => {
            cd.delete(user)
        }, cooldown * 1000)
    }
};

module.exports.help = {
    name: "report"
};