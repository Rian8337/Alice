const { Client, TextChannel } = require('discord.js');
const { Db } = require('mongodb');

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * @param {Client} client 
 * @param {Db} alicedb
 * @param {number} timeLimit 
 */
module.exports.run = async (client, alicedb, timeLimit) => {
    const guild = await client.guilds.fetch("316545691545501706");

    const channelDb = alicedb.collection("channeldata");
    const channelEntries = [];

    const filteredCategories = ['360714803691388928', '415559968062963712', '360715303149240321', '360715871187894273', '360715992621514752'];
    const filteredChannels = ['326152555392532481', '361785436982476800', '316863464888991745', '549109230284701718', '468042874202750976', '430002296160649229', '430939277720027136', '757137265351721001', '757135236659413033', '757136393142010027', '757137031162888223', '757137127652982846'];
    for await (const [channelID, channel] of guild.channels.cache.entries()) {
        if (filteredCategories.includes(channel.parentID)) {
            continue;
        }

        if (filteredChannels.includes(channelID)) {
            continue;
        }

        if (!(channel instanceof TextChannel)) {
            continue;
        }

        const messageManager = channel.messages;
        const lastMessage = await messageManager.fetch({limit: 1});
        let lastMessageID = lastMessage.first()?.id;
        if (!lastMessageID) {
            continue;
        }

        const fetchCount = 100;
        let messages = await messageManager.fetch({limit: fetchCount, before: lastMessageID});
        await sleep(0.5);
        let count = 0;

        while (true) {
            for (const [, message] of messages.entries()) {
                if (message.createdTimestamp < timeLimit) {
                    break;
                }

                if (message.author.bot) {
                    count -= 2;
                } else {
                    ++count;
                }
            }

            if (count % fetchCount) {
                break;
            }

            lastMessageID = messages.last()?.id;
            if (!lastMessageID) {
                break;
            }
            messages = await messageManager.fetch({limit: fetchCount, before: lastMessageID});
            await sleep(0.5);
        }

        channelEntries.push([channelID, Math.max(0, count)]);
    }

    channelDb.updateOne({timestamp: timeLimit}, {$set: {channels: channelEntries}}, {upsert: true}, err => {
        if (err) {
            return console.log(err);
        }
        console.log("Successfully updated channel analytics");
    });
};

module.exports.config = {
    name: "messageanalytics"
};