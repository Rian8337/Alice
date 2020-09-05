const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function retrieveList(res, i, cb) {
    if (!res[i]) return cb([], true);
    let list = [];
    list.push(res[i].uid);
    list.push(res[i].pp);
    list.push(res[i].discordid);
    cb(list);
}

async function recalcPlay(target, i, newtarget, whitelist, cb) {
    if (!target[i]) return cb(false, true);
    let mods = target[i].mods;
    const mapinfo = await new osudroid.MapInfo().getInformation({hash: target[i][0]});
    if (mapinfo.error) {
		console.log("API fetch error");
		return cb(false, true);
	}
    if (!mapinfo.title) {
        console.log("Map not found");
        return cb();
    }
    if (!mapinfo.objects) {
        console.log("0 objects found");
        return cb();
    }
    if (mapinfo.approved === 3 || mapinfo.approved <= 0) {
        let isWhitelist = await whitelist.findOne({hashid: target[i].hash});
        if (!isWhitelist) {
            console.log("Map is not ranked, approved, loved, or whitelisted");
            return cb();
        }
    }
    let acc_percent = target[i].accuracy;
	let combo = target[i].combo;
	let miss = target[i].miss;
	let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods});
	let npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: acc_percent,
        miss: miss,
        mode: osudroid.modes.droid
    });
	let real_pp = parseFloat(npp.toString().split(" ")[0]);
	console.log(`${target[i].pp} -> ${real_pp}`);
	newtarget.push({
		hash: target[i].hash,
		title: target[i].hash,
		pp: real_pp,
		combo: target[i].combo,
		accuracy: target[i].accuracy,
		miss: target[i].miss,
		scoreID: target[i].scoreID
	});
    cb();
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel || message.member.roles == null) return;
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    message.channel.send(`❗**| ${message.author}, are you sure you want to recalculate all players' dpp entry?**`).then(msg => {
        msg.react("✅").catch(console.error);
        let confirmation = false;
        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
        confirm.on("collect", () => {
            confirmation = true;
            msg.delete();
            message.channel.send("✅ **| Recalculating all players...**");
            let binddb = maindb.collection("userbind");
            let whitelist = maindb.collection("mapwhitelist");
            binddb.find({}, {projection: {_id: 0, discordid: 1, uid: 1, pp: 1, pptotal: 1}}).sort({pptotal: -1}).toArray((err, res) => {
                if (err) throw err;
                let i = 0;
                message.channel.send(`❗**| Current progress: ${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)**`).then(m => {
                    retrieveList(res, i, async function testList(list, stopSign = false) {
                        if (stopSign) {
                            m.edit(`❗**| Current progress: ${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)**`).catch(console.error);
                            return message.channel.send(`✅ **| ${message.author}, recalculation process complete!**`);
                        }
                        let uid = list[0];
                        let ppentry = list[1];
                        let discordid = list[2];
                        let newppentry = [];
                        let count = 0;
                        let attempt = 0;
                        console.log("Uid:", uid);
                        if (!ppentry) {
                            i++;
                            return retrieveList(res, i, testList)
                        }
                        await recalcPlay(ppentry, count, newppentry, whitelist, async function testPlay(error = false, stopFlag = false) {
                            attempt++;
                            if ((attempt === 3 && error) || !error) count++;
                            if (count < ppentry.length && !stopFlag) return await recalcPlay(ppentry, count, newppentry, whitelist, testPlay);
                            newppentry.sort((a, b) => {return b[2] - a[2];});
                            let totalpp = 0;
                            let weight = 1;
                            for (let x of newppentry) {
                                totalpp += x[2] * weight;
                                weight *= 0.95
                            }
                            let updatedata = {
                                $set: {
                                    pptotal: totalpp,
                                    pp: newppentry
                                }
                            };
                            binddb.updateOne({discordid: discordid}, updatedata, async err => {
                                if (err) {
                                    console.log("Error inserting data to database");
                                    console.log(err);
                                    if (!error) count--;
                                    testPlay;
                                    return;
                                }
                                console.log(totalpp);
                                console.log("Done");
                                i++;
                                console.log(`${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)`);
                                m.edit(`❗**| Current progress: ${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)**`).catch(console.error);
                                retrieveList(res, i, testList);
                            });
                        });
                    });
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