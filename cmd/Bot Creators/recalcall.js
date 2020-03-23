const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');

function retrieveList(res, i, cb) {
    if (!res[i]) return cb([], true);
    let list = [];
    list.push(res[i].uid);
    list.push(res[i].pp);
    list.push(res[i].discordid);
    cb(list)
}

function recalcPlay(target, i, newtarget, whitelist, cb) {
    if (!target[i]) return cb(false, true);
    let mods = "";
    if (target[i][1].includes('+'))  {
        let mapstring = target[i][1].split('+');
        mods = mapstring[mapstring.length-1];
        if (mods.includes("]")) mods = ''
    }

    let guessing_mode = true;
    let whitelistQuery = {hashid: target[i][0]};

    whitelist.findOne(whitelistQuery, (err, wlres) => {
        let query = {hash: target[i][0]};
        if (err) {
            console.log("Whitelist find error");
            return cb(true)
        }
        if (wlres) query = {beatmap_id: wlres.mapid};
        new osudroid.MapInfo().get(query, mapinfo => {
            if (!mapinfo.title) {
                console.log("Map not found");
                return cb()
            }
            if (!mapinfo.objects) {
                console.log("0 objects found");
                return cb()
            }
            let acc_percent = 100;
            if (target[i][4]) {
                acc_percent = parseFloat(target[i][4]);
                guessing_mode = false;
            }
            let combo = target[i][3] ? parseInt(target[i][3]) : mapinfo.max_combo;
            let miss = target[i][5] ? parseInt(target[i][5]) : 0;
            let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mods});
            let npp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: combo,
                acc_percent: acc_percent,
                miss: miss,
                mode: "droid"
            });
            let pp = parseFloat(npp.toString().split(" ")[0]);
            let real_pp = guessing_mode ? parseFloat(target[i][2]).toFixed(2) : pp;
            console.log(`${target[i][2]} -> ${real_pp}`);
            newtarget.push(guessing_mode ? [target[i][0], target[i][1], real_pp] : [target[i][0], target[i][1], real_pp, target[i][3], target[i][4], target[i][5]]);
            cb()
        })
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel || message.member.roles == null) return;
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
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
                    retrieveList(res, i, function testList(list, stopSign = false) {
                        if (stopSign) {
                            m.edit(`❗**| Current progress: ${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)**`).catch(console.error);
                            return message.channel.send(`✅ **| ${message.author}, recalculation process complete!**`);
                        }
                        let uid = list[0];
                        let ppentry = list[1];
                        let discordid = list[2];
                        let newppentry = [];
                        let count = 0;
                        console.log("Uid:", uid);
                        if (!ppentry) {
                            i++;
                            return retrieveList(res, i, testList)
                        }
                        recalcPlay(ppentry, count, newppentry, whitelist, function testPlay(error = false, stopFlag = false) {
                            if (!error) count++;
                            if (count < ppentry.length && !stopFlag) return recalcPlay(ppentry, count, newppentry, whitelist, testPlay);
                            newppentry.sort((a, b) => {return b[2] - a[2]});
                            let totalpp = 0;
                            let weight = 1;
                            for (let x in newppentry) {
                                totalpp += newppentry[x][2] * weight;
                                weight *= 0.95
                            }
                            let updatedata = {
                                $set: {
                                    pptotal: totalpp,
                                    pp: newppentry
                                }
                            };
                            binddb.updateOne({discordid: discordid}, updatedata, err => {
                                if (err) {
                                    console.log("Error inserting data to database");
                                    console.log(err);
                                    if (!error) count--;
                                    return testPlay
                                }
                                console.log(totalpp);
                                console.log("Done");
                                i++;
                                console.log(`${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)`);
                                m.edit(`❗**| Current progress: ${i}/${res.length} players recalculated (${(i * 100 / res.length).toFixed(2)}%)**`).catch(console.error);
                                retrieveList(res, i, testList)
                            })
                        })
                    })
                })
            })
        });
        confirm.on("end", () => {
            if (!confirmation) {
                msg.delete();
                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
            }
        })
    })
};

module.exports.config = {
    name: "recalcall",
    description: "Recalculates the entire userbind database.",
    usage: "recalcall",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
