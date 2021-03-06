const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }
    const guild = await client.guilds.fetch("316545691545501706");
    const insertVal = {
        guildID: guild.id,
        emojiStats: []
    };

    for await (const [, channel] of guild.channels.cache.entries()) {
        if (!(channel instanceof Discord.TextChannel)) {
            continue;
        }

        console.log("Checking #" + channel.name);
        // Get last message of the channel
        let lastMessage = (await channel.messages.fetch({limit: 1}))?.first();
        if (!lastMessage) {
            continue;
        }

        while (true) {
            const messages = await channel.messages.fetch({before: lastMessage.id, limit: 100});
            if (messages.size === 0) {
                break;
            }

            for (const [, msg] of messages.entries()) {
                const emojiMessages = msg.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) ?? [];

                for (const emojiMessage of emojiMessages) {
                    const a = emojiMessage.split(":");
                    const emojiID = a[a.length - 1].replace(">", "");
                    const emojiIndex = insertVal.emojiStats.findIndex(v => v.id === emojiID);
                    if (emojiIndex !== -1) {
                        ++insertVal.emojiStats[emojiIndex].count;
                    } else {
                        const actualEmoji = guild.emojis.resolve(emojiID);
                        if (!actualEmoji) {
                            continue;
                        }
                        insertVal.emojiStats.push({
                            id: actualEmoji.id,
                            count: 1
                        });
                    }
                }
            }

            lastMessage = messages.last();
        }
    }

    await alicedb.collection("emojistatistics").insertOne(insertVal);
    console.log("Done");
};

module.exports.config = {
    name: "fetchemoji",
    description: "Temporary command to fetch emojis for statistics purposes.",
    usage: "None",
    detail: "None",
    permission: "Bot Creators"
};