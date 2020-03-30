const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');

function retrievePlayer(player_list, i, cb) {
    if (!player_list[i]) return cb(null, true);
    cb(player_list[i])
}

function retrievePlay(play_list, i, cb) {
    if (!play_list[i]) return cb(null, null, true);
    let hash = play_list[i][0];
    console.log(hash);

    new osudroid.MapInfo().get({hash: hash, file: false}, mapinfo => {
        cb(hash, mapinfo)
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let binddb = maindb.collection("userbind");
    let whitelistdb = maindb.collection("mapwhitelist");

    let uid = args[0];
    if (!uid) return;
    binddb.find({uid: uid}).toArray((err, player_list) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        whitelistdb.find({}).toArray((err, whitelist_list) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            let i = 0;
            retrievePlayer(player_list, i, function checkPlayer(player, stopSign = false) {
                if (stopSign) return message.channel.send(`✅ **| ${message.author}, dpp entry scan complete!**`);
                console.log(i);
                console.log("Uid:", player.uid);
                let j = 0;
                let discordid = player.discordid;
                let play_list = player.pp;
                let playc = player.playc;
                retrievePlay(play_list, j, function validatePlay(hash, mapinfo, stopFlag = false) {
                    if (stopFlag) {
                        console.log("Check done");
                        let pptotal = 0;
                        let weight = 1;
                        for (let i in play_list) {
                            pptotal += weight * play_list[i][2];
                            weight *= 0.95;
                        }
                        let updateVal = {
                            $set: {
                                pp: play_list,
                                pptotal: pptotal,
                                playc: playc
                            }
                        };
                        binddb.updateOne({discordid: discordid}, updateVal, err => {
                            if (err) {
                                console.log(err);
                                setTimeout(() => {
                                    retrievePlay(play_list, j, validatePlay)
                                }, 50);
                                return
                            }
                            ++i;
                            retrievePlayer(player_list, i, checkPlayer)
                        });
                        return;
                    }
                    console.log(j);
                    if (!mapinfo.title) {
                        console.log("Beatmap not found");
                        play_list.splice(j, 1);
                        --playc;
                        setTimeout(() => {
                            retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    if (!mapinfo.objects) {
                        console.log("Beatmap with 0 objects");
                        play_list.splice(j, 1);
                        --playc;
                        setTimeout(() => {
                            retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    if (mapinfo.approved !== 3 && mapinfo.approved > 0) {
                        ++j;
                        setTimeout(() => {
                            retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    let index = whitelist_list.findIndex(whitelist => whitelist.hashid === hash);
                    if (index === -1) {
                        console.log("Beatmap not found in whitelist database");
                        play_list.splice(j, 1);
                        --playc;
                        setTimeout(() => {
                            retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    ++j;
                    setTimeout(() => {
                        retrievePlay(play_list, j, validatePlay)
                    }, 50)
                })
            })
        })
    })
};

module.exports.config = {
    name: "scandpp",
    description: "Scans player's dpp entries and updates the list if outdated.",
    usage: "scandpp",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
