const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction
 * @param {string[]} subCommands
 * @param {Array<Discord.Channel|Discord.User|Discord.Role|string|number|boolean>} args
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, interaction, subCommands, args, maindb, alicedb) => {
    if (interaction.channel instanceof Discord.DMChannel) {
        return interaction.editReply("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!interaction.member.hasPermission("BAN_MEMBERS")) {
        return interaction.editReply("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const user = await interaction.guild.members.fetch(args[0]).catch();
    if (!user) {
        return interaction.editReply("❎ **| Hey, please specify the correct user to ban!**");
    }
    if (user.id === interaction.user.id) {
        return interaction.editReply("❎ **| Why would you ban yourself?**");
    }
    if (user.user.bot) {
        return interaction.editReply("❎ **| I'm sorry, you cannot ban bots!**");
    }
    if (interaction.member.roles.highest.comparePositionTo(user.roles.highest) < 0) {
        return interaction.editReply("❎ **| I'm sorry, you cannot ban this user!**");
    }
    const reason = args.slice(1).join(" ");
    if (!reason) {
        return interaction.editReply("❎ **| Hey, please enter your ban reason!**");
    }
    
    const channelDb = alicedb.collection("punishmentconfig");
    channelDb.findOne({guildID: interaction.guild.id}, (err, res) => {
        if (err) {
            console.log(err);
            return interaction.editReply("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return interaction.editReply("❎ **| I'm sorry, this server doesn't have a log channel configured!**");
        }
        const channel = interaction.guild.channels.resolve(res.logChannel);
        if (!channel) {
            return interaction.editReply(`❎ **| I'm sorry, please ask server managers to create a log channel first!**`);
        }
        if (!(channel instanceof Discord.TextChannel)) {
            return interaction.editReply("❎ **| Hey, log channel must be a text channel!**");
        }

        user.ban({reason: reason + ` (banned by ${interaction.user.username})`}).then(() => {
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);

            const embed = new Discord.MessageEmbed()
                .setAuthor(interaction.user.tag, interaction.user.avatarURL({dynamic: true}))
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date())
                .setColor(interaction.member.roles.color.hexColor)
                .setThumbnail(toban.avatarURL({dynamic: true}))
                .setTitle("Ban executed")
                .addField("Banned user: " + toban.username, "User ID: " + userid)
                .addField("=========================", "Reason:\n" + reason);

            // TODO: attachments
            if (message.attachments.size > 0) {
                const attachments = [];
                for (const [, attachment] of message.attachments.entries()) {
                    attachments.push(attachment.url);
                }
                channel.send({embed: embed, files: attachments});
            } else {   
                channel.send({embed: embed});
            }

            interaction.editReply("✅ **| Successfully banned user.**").then(() =>
                setTimeout(() => interaction.deleteReply(), 5000));
        }).catch(() => interaction.editReply("❎ **| I'm sorry, looks like the user is already banned or cannot be banned!**"));
    });
};

module.exports.config = {
    name: "ban",
    description: "Bans a user from the server.",
    usage: "ban <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning [String]",
    permission: "Ban Members"
};

/**
 * @type {Discord.ApplicationCommandData}
 */
module.exports.slashCommandData = {
    name: "ban",
    description: "Bans a user from the server. Only usable in servers.",
    defaultPermission: true,
    options: [
        {
            name: "user",
            description: "The user to ban. The user cannot have a role higher than your highest role.",
            type: "USER",
            required: true
        },
        {
            name: "reason",
            description: "The reason to ban the user.",
            type: "STRING",
            required: true
        }
    ]
};