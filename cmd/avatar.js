const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = async (client, message, args) => {
    let user = message.author;
    let rolecheck;
    try {
        rolecheck = message.member.roles.highest.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setColor(rolecheck)
        .setFooter("Alice Synthesis Thirty", footer[index]);

    if (args[0]) {
        user = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
        user = await client.users.fetch(args[0]);
        if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**")
    }
    embed.setDescription(`**${user.tag}**`).setImage(user.avatarURL({dynamic: true}));

    await message.channel.send({embed: embed})
};

module.exports.config = {
    name: "avatar",
    description: "Retrieves a user's avatar.",
    usage: "avatar [user]",
    detail: "`user`: UserResolvable (mention or user ID)",
    permission: "None"
};
