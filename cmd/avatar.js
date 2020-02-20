const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = async (client, message, args) => {
    let user = message.author;
    let rolecheck;
    try {
        rolecheck = message.member.highestRole.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
    let embed = new Discord.RichEmbed()
        .setColor(rolecheck)
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", footer[index]);

    if (args[0]) {
        user = await client.fetchUser(args[0] || message.mentions.users.first().id);
        if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**");
    }
    embed.setDescription(`**${user.tag}**`).setImage(user.avatarURL);

    await message.channel.send({embed: embed})
};

module.exports.config = {
    name: "avatar",
    description: "Retrieves a user's avatar.",
    usage: "avatar [user]",
    detail: "`user`: UserResolvable (mention or user ID)",
    permission: "None"
};
