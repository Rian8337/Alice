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
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    }

    const binddb = maindb.collection("userbind");
    const whitelistdb = maindb.collection("mapwhitelist");

    binddb.find({}, {projection: {_id: 0, uid: 1, discordid: 1, pp: 1, playc: 1, pptotal: 1}}).sort({pptotal: -1}).toArray(async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!");
        }

        let count = 0;
        console.log(`Scanning ${res.length} players`);
        for await (const player of res) {
            const ppList = player.pp;
            const newList = [];
            let i = 0;
            let playCount = player.playc;
            console.log(`Scanning uid ${player.uid}`);
            console.log(`Scanning ${ppList.length} plays`);
            for await (const ppEntry of ppList) {
                const mapinfo = await new osudroid.MapInfo().getInformation({hash: ppEntry.hash, file: false});
                ++i;
                await sleep(1);
                if (mapinfo.error) {
                    continue;
                }
                if (!mapinfo.title) {
                    continue;
                }
                if (!mapinfo.objects) {
                    continue;
                }
                ppEntry.title = mapinfo.fullTitle;
                if (osudroid.mods.modbitsFromString(ppEntry.mods) & osudroid.mods.osuMods.nc) {
                    ppEntry.isOldPlay = true;
                }
                if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED && mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                    const isWhitelist = await whitelistdb.findOne({hashid: mapinfo.hash});
                    if (!isWhitelist) {
                        continue;
                    }
                }
                newList.push(ppEntry);
            }
            if (newList.length === ppList.length) {
                continue;
            }
            newList.sort((a, b) => {return b.pp - a.pp;});

            let newTotal = 0;
            for (let i = 0; i < newList.length; ++i) {
                newTotal += newList[i].pp * Math.pow(0.95, i);
            }
            console.log(newTotal);
            await binddb.updateOne({discordid: player.discordid}, {$set: {pptotal: newTotal, playc: playCount, pp: newList}});
            ++count;
            console.log(`${count}/${res.length} players complete (${((count / res.length) * 100).toFixed(2)}%)`);
        }
        message.channel.send(`✅ **| ${message.author}, scan done!**`);
    });
};

module.exports.config = {
    name: "scandpp",
    description: "Scans player's dpp entries and updates the list if outdated.",
    usage: "scandpp",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};