const Discord = require('discord.js');
const osudroid = require('osu-droid');
const {Db} = require('mongodb');

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 * seconds);
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const bindDb = maindb.collection("userbind");
    const whitelistDb = maindb.collection("mapwhitelist");
    const blacklistDb = maindb.collection("mapblacklist");

    const blacklists = await blacklistDb.find({}, {projection: {_id: 0, beatmapID: 1}}).toArray();

    let skipMultiplier = 0;
    let count = 0;
    while (true) {
        const players = await bindDb.find({}, {projection: {_id: 0, uid: 1, discordid: 1, pp: 1, playc: 1, pptotal: 1}}).sort({pptotal: -1}).skip(skipMultiplier * 50).limit(50).toArray();
        ++skipMultiplier;

        if (players.length === 0) {
            break;
        }

        for await (const player of players) {
            const ppList = player.pp;
            const newList = [];
            let i = 0;
            console.log(`Scanning uid ${player.uid}`);
            console.log(`Scanning ${ppList.length} plays`);
            for await (const ppEntry of ppList) {
                const mapinfo = await osudroid.MapInfo.getInformation({hash: ppEntry.hash, file: false});
                await sleep(0.2);
                console.log(++i);
                if (!mapinfo.title) {
                    continue;
                }
                if (!mapinfo.objects) {
                    continue;
                }
                if (blacklists.find(v => v.beatmapID === mapinfo.beatmapID)) {
                    continue;
                }
                
                if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                    const isWhitelist = await whitelistDb.findOne({hashid: mapinfo.hash});
                    if (!isWhitelist) {
                        continue;
                    }
                }
                newList.push(ppEntry);
            }
            if (newList.length === ppList.length) {
                continue;
            }
            newList.sort((a, b) => {
                return b.pp - a.pp;
            });

            const newTotal = newList.map(v => {return v.pp;}).reduce((acc, value, index) => acc + value * Math.pow(0.95, index));
            console.log(newTotal);
            await bindDb.updateOne({discordid: player.discordid}, {$set: {pptotal: newTotal, pp: newList}});
            ++count;
            console.log(`${count} players recalculated`);
        }
    }
    message.channel.send(`✅ **| ${message.author}, scan done!**`);
};

module.exports.config = {
    name: "scandpp",
    description: "Scans players' dpp entries and updates the list if outdated.",
    usage: "scandpp",
    detail: "None",
    permission: "Bot Creators"
};