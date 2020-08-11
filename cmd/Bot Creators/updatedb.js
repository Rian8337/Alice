const osudroid = require('osu-droid');
const request = require('request');
const droidapikey = process.env.DROID_API_KEY;
const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 1000 * seconds);
    });
}

function fetchLeaderboard(hash) {
    return new Promise(resolve => {
        const url = `http://ops.dgsrz.com/api/scoresearchv2?apiKey=${droidapikey}&hash=${hash}&page=0&order=score`;
        request(url, (err, response, data) => {
            if (err || !data) {
                console.log("No map found");
                return resolve(0);
            }
            const entries = [];
            const lines = data.split("<br>");
            for (const line of lines) entries.push(line.split(" "));
            entries.shift();
            resolve(entries);
        });
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
        return message.channel.send("❎ **| I'm sorry, you don't have enough permission to use this.**");
    }
    const binddb = maindb.collection("userbind");
    binddb.find({}, {projcetion: {_id: 0, discordid: 1, pp: 1, previous_bind: 1}}).toArray(async (err, entries) => {
        if (err) throw err;

        let count = 0;
        console.log(`Modifying ${entries.length} user entries`);
        for await (const entry of entries) {
            const discordid = entry.discordid;
            const pp_entries = entry.pp;
            const bind_pool = entry.previous_bind ? entry.previous_bind : [entry.uid];
            const new_pp = [];

            let entry_count = 0;
            console.log(`Updating ${pp_entries.length} pp entries from uid ${entry.uid}`);
            for await (const pp_entry of pp_entries) {
                await sleep(2);
                let mods = '';
                let title = pp_entry[1];
                if (title.includes("+")) {
                    let mapsplit = pp_entry[1].split("+");
                    title = mapsplit[0];
                    mods = mapsplit[mapsplit.length - 1];
                    if (mods.includes("]")) {
                        title = pp_entry[1];
                        mods = '';
                    }
                }
                const pp_object = {
                    hash: pp_entry[0],
                    title: title,
                    pp: parseFloat(pp_entry[2]),
                    mods: mods.trim(),
                    combo: 0,
                    accuracy: 0,
                    miss: 0,
                    scoreID: 0
                };
                let score_id = 0;
                if (pp_entry.length > 2) {
                    pp_object.combo = parseInt(pp_entry[3]);
                    pp_object.accuracy = parseFloat(pp_entry[4]);
                    pp_object.miss = parseInt(pp_entry[5]);
                }
                // search score ID from bind pool
                for await (const binded_uid of bind_pool) {
                    const score = await new osudroid.Score({uid: binded_uid, hash: pp_object.hash}).getFromHash();
                    if (pp_entry.length <= 2) {
                        if (osudroid.mods.modbits_from_string(score.mods) !== osudroid.mods.modbits_from_string(pp_object.mods)) {
                            continue;
                        }
                        pp_object.combo = score.combo;
                        pp_object.accuracy = score.accuracy;
                        pp_object.miss = score.miss;
                    }
                    else if (
                        score.combo !== pp_object.combo ||
                        Math.abs(score.accuracy - pp_object.accuracy) >= 0.1 ||
                        score.miss !== pp_object.miss ||
                        osudroid.mods.modbits_from_string(score.mods) !== osudroid.mods.modbits_from_string(pp_object.mods)
                    ) {
                        continue;
                    }
                    score_id = score.score_id;
                    break;
                }

                // if no score ID is found, scrape top 100
                if (!score_id) {
                    const score_entries = await fetchLeaderboard(pp_object.hash);

                    for (const score_entry of score_entries) {
                        const acc_percent = parseFloat(score_entry[7]) / 1000;
                        const combo = parseInt(score_entry[4]);
                        const miss = parseInt(score_entry[8]);
                        const mods = osudroid.mods.droid_to_PC(entry[6]);
                        if (
                            combo !== pp_object.combo ||
                            Math.abs(acc_percent - pp_object.accuracy) >= 0.1 ||
                            miss !== pp_object.miss ||
                            osudroid.mods.modbits_from_string(mods) !== osudroid.mods.modbits_from_string(pp_object.mods)
                        ) {
                            continue;
                        }
                        score_id = parseInt(score_entry[0]);
                        break;
                    }
                }

                ++entry_count;
                // if still no score ID, skip (delete) score from pp entry
                if (!score_id) {
                    console.log("Score not found, deleting");
                    console.log(`${entry_count}/${pp_entries.length} pp entries updated (${(entry_count * 100 / pp_entries.length).toFixed(2)}%)`);
                    continue;
                }

                pp_object.scoreID = score_id;
                new_pp.push(pp_object);
                console.log(`${entry_count}/${pp_entries.length} pp entries updated (${(entry_count * 100 / pp_entries.length).toFixed(2)}%)`);
            }

            await binddb.updateOne({discordid: discordid}, {$set: {pp: new_pp, previous_bind: bind_pool}});
            await sleep(1);
            ++count;
            console.log(`${count}/${entries.length} updated (${(count * 100 / entries.length).toFixed(2)}%)`);
        }
        message.channel.send("✅ **| Database update done!**");
    });
};

module.exports.config = {
    name: "updatedb",
    description: "Updates pp database.",
    usage: "updatedb",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};