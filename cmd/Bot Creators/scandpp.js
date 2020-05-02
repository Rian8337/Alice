const Discord = require('discord.js');
const osudroid = require('osu-droid');

function retrievePlayer(player_list, i, cb) {
    if (!player_list[i]) return cb(null, true);
    cb(player_list[i])
}

async function retrievePlay(play_list, i, cb) {
    if (!play_list[i]) return cb(null, null, true);
    let hash = play_list[i][0];

    const mapinfo = await new osudroid.MapInfo().get({hash: hash, file: false});
    cb(hash, mapinfo)
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let binddb = maindb.collection("userbind");
    let whitelistdb = maindb.collection("mapwhitelist");

    binddb.find({}, {projection: {_id: 0, uid: 1, discordid: 1, pp: 1, playc: 1, pptotal: 1}}).sort({pptotal: -1}).toArray((err, player_list) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        whitelistdb.find({}, {projection: {_id: 0, hashid: 1}}).toArray((err, whitelist_list) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            let i = 0;
            retrievePlayer(player_list, i, async function checkPlayer(player, stopSign = false) {
                if (stopSign) return await message.channel.send(`✅ **| ${message.author}, dpp entry scan complete!**`);
                console.log(i);
                console.log("Uid:", player.uid);
                let j = 0;
                let prev_pptotal = player.pptotal;
                let discordid = player.discordid;
                let play_list = player.pp;
                let playc = player.playc;
                await retrievePlay(play_list, j, function validatePlay(hash, mapinfo, stopFlag = false) {
                    if (stopFlag) {
                        console.log("Check done");
                        let pptotal = 0;
                        let weight = 1;
                        for (let i of play_list) {
                            pptotal += weight * i[2];
                            weight *= 0.95;
                        }
                        console.log(prev_pptotal + " -> " + pptotal);
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
                                setTimeout(async () => {
                                    await retrievePlay(play_list, j, validatePlay)
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
                        setTimeout(async () => {
                            await retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    if (!mapinfo.objects) {
                        console.log("Beatmap with 0 objects");
                        play_list.splice(j, 1);
                        --playc;
                        setTimeout(async () => {
                            await retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    if (mapinfo.approved !== 3 && mapinfo.approved > 0) {
                        ++j;
                        setTimeout(async () => {
                            await retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    let index = whitelist_list.findIndex(whitelist => whitelist.hashid === hash);
                    if (index === -1) {
                        console.log("Beatmap not found in whitelist database");
                        play_list.splice(j, 1);
                        --playc;
                        setTimeout(async () => {
                            await retrievePlay(play_list, j, validatePlay)
                        }, 50);
                        return
                    }
                    ++j;
                    setTimeout(async () => {
                        await retrievePlay(play_list, j, validatePlay)
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
