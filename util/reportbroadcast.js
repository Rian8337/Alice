const Discord = require('discord.js');
const { Utils } = require('osu-droid');
const config = require('../config.json');

/**
 * @param {Discord.Client} client 
 */
module.exports.run = async client => {
    const guild = await client.guilds.fetch("316545691545501706");
    const embed = new Discord.MessageEmbed()
        .setAuthor("Broadcast", guild.iconURL({dynamic: true}))
        .setColor("#42a6ed")
        .setFooter("Alice Synthesis Thirty", Utils.getRandomArrayElement(config.avatar_list))
        .setDescription(`If you see a user violating the rules, misbehaving, or intentionally trying to be annoying, please report the user using \`${config.prefix}report\` command (more information is available using \`${config.prefix}help report\`).\n\nKeep in mind that only staff members can view reports, therefore your privacy is safe. We appreciate your contribution towards bringing a friendly environment!`);

    const excludedChannels = ["360716684174032896"];

    for await (const [, channel] of guild.channels.cache.entries()) {
        if (!(channel instanceof Discord.TextChannel) || channel.type !== "text" || excludedChannels.includes(channel.id)) {
            continue;
        }

        // Check if channel has active conversation; check based on messages per second
        const lastMessage = (await channel.messages.fetch({limit: 1}))?.first();
        if (!lastMessage) {
            continue;
        }
        // Check if last message is too old; current threshold is 5 minutes
        if (Date.now() - lastMessage.createdTimestamp > 300000) {
            continue;
        }

        const messages = (await channel.messages.fetch({limit: 100, before: lastMessage.id}))?.filter(v => !v.author.bot);
        if (!messages || messages.size < 10) {
            continue;
        }

        const messagesPerSecondRatio = messages.size / Math.abs((messages.first().createdTimestamp - messages.last().createdTimestamp) / 1000);
        if (messagesPerSecondRatio < 0.01) {
            continue;
        }

        channel.send(embed);
    }
};

module.exports.config = {
    name: "reportbroadcast"
};
