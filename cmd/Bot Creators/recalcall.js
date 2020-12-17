const {Client, Message} = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 * seconds);
    });
}

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    }
    message.channel.send(`❗**| ${message.author}, are you sure you want to recalculate all players' dpp entry?**`).then(msg => {
        msg.react("✅").catch(console.error);
        let confirmation = false;
        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

        confirm.on("collect", () => {
            confirmation = true;
            msg.delete();
            message.channel.send("✅ **| Recalculating all players...**");
            const binddb = maindb.collection("userbind");
            const whitelist = maindb.collection("mapwhitelist");
            binddb.find({tempCalcDone: {$ne: true}}, {projection: {_id: 0, discordid: 1, uid: 1, pp: 1, pptotal: 1}}).sort({pptotal: -1}).toArray((err, entries) => {
                if (err) throw err;
                let updated = 0;
                message.channel.send(`❗**| Current progress: ${updated}/${entries.length} players recalculated (${(updated * 100 / entries.length).toFixed(2)}%)**`).then(async m => {
                    for await (const entry of entries) {
                        const discordid = entry.discordid;
                        const pp_entries = entry.pp ? entry.pp : [];
                        let index = -1;

                        console.log(`Recalculating ${pp_entries.length} entries from uid ${entry.uid}`);
                        for await (const pp_entry of pp_entries) {
                            ++index;
                            const {hash, mods, accuracy, combo, miss, scoreID, pp} = pp_entry;
                            const mapinfo = await osudroid.MapInfo.getInformation({hash: hash});

                            if (mapinfo.error) {
                                console.log("API fetch error");
                                continue;
                            }
                            if (!mapinfo.title) {
                                continue;
                            }
                            if (!mapinfo.objects) {
                                console.log("Map has no objects");
                                continue;
                            }
                            if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                                const isWhitelist = await whitelist.findOne({hashid: hash});
                                if (!isWhitelist) {
                                    console.log("Map is not ranked, approved, or whitelisted");
                                    continue;
                                }
                            }

                            const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods});
                            let realAcc = new osudroid.Accuracy({
                                percent: accuracy,
                                nobjects: mapinfo.objects
                            });
                            const replay = await new osudroid.ReplayAnalyzer({scoreID, map: star.droidStars}).analyze();
                            if (replay.fixedODR) {
                                await sleep(0.2);
                                const { data } = replay;
                                realAcc = new osudroid.Accuracy({
                                    n300: data.hit300,
                                    n100: data.hit100,
                                    n50: data.hit50,
                                    nmiss: miss
                                });
                            }
                            console.log(scoreID, realAcc);
                            const npp = new osudroid.PerformanceCalculator().calculate({
                                stars: star.droidStars,
                                combo: replay.data?.maxCombo ?? combo,
                                accPercent: realAcc,
                                miss: replay.data?.hit0 ?? miss,
                                mode: osudroid.modes.droid
                            });
                            const new_pp = parseFloat(npp.total.toFixed(2));

                            console.log(`${pp} => ${new_pp}`);
                            pp_entries[index].title = mapinfo.fullTitle;
                            pp_entries[index].pp = new_pp;
                            pp_entries[index].combo = replay.data?.maxCombo ?? combo;
                            pp_entries[index].mods = replay.data?.convertedMods ?? mods;
                            pp_entries[index].accuracy = parseFloat((realAcc.value(mapinfo.objects) * 100).toFixed(2));
                            pp_entries[index].miss = replay.data?.hit0 ?? miss;

                            console.log(`${index}/${pp_entries.length} recalculated (${(index * 100 / pp_entries.length).toFixed(2)}%)`);
                        }
                        console.log(`${index}/${pp_entries.length} recalculated (${(index * 100 / pp_entries.length).toFixed(2)}%)`);

                        pp_entries.sort((a, b) => {
                            return b.pp - a.pp;
                        });

                        if (pp_entries.length > 75) {
                            pp_entries.splice(75);
                        }

                        const new_pptotal = pp_entries.map(v => {return v.pp;}).reduce((acc, value, index) => acc + value * Math.pow(0.95, index));
                        const updateVal = {
                            $set: {
                                pptotal: new_pptotal,
                                pp: pp_entries,
                                tempCalcDone: true
                            }
                        };

                        await binddb.updateOne({discordid: discordid}, updateVal);
                        ++updated;
                        console.log(`${updated}/${entries.length} players recalculated (${(updated * 100 / entries.length).toFixed(2)}%)`);
                        m.edit(`❗**| Current progress: ${updated}/${entries.length} players recalculated (${(updated * 100 / entries.length).toFixed(2)}%)**`).catch(console.error);
                    }
                    console.log(`${updated}/${entries.length} players recalculated (${(updated * 100 / entries.length).toFixed(2)}%)`);
                    m.edit(`❗**| Current progress: ${updated}/${entries.length} players recalculated (${(updated * 100 / entries.length).toFixed(2)}%)**`).catch(console.error);
                    await binddb.updateMany({}, {$unset: {tempCalcDone: ""}});
                    message.channel.send(`✅ **| ${message.author}, recalculation process complete!**`);
                });
            });
        });

        confirm.on("end", () => {
            if (!confirmation) {
                msg.delete();
                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
            }
        });
    });
};

module.exports.config = {
    name: "recalcall",
    description: "Recalculates the entire userbind database.",
    usage: "recalcall",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};