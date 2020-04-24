const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');

function retrieveWhitelist(whitelist_entries, i, cb) {
    if (!whitelist_entries[i]) return cb(null, true);
    cb(whitelist_entries[i])
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    let whitelistdb = maindb.collection("mapwhitelist");

    whitelistdb.find({}).toArray((err, whitelist_list) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        let i = 0;
        retrieveWhitelist(whitelist_list, i, async function whitelistCheck(whitelist, stopSign = false) {
            if (stopSign) return message.channel.send(`✅ **| ${message.author}, dpp entry scan complete!**`);
            console.log(i);
            let beatmap_id = whitelist.mapid;
            let hash = whitelist.hashid;
            const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap_id, file: false});
            if (!mapinfo.title) {
                console.log("Whitelist entry not available");
                whitelistdb.deleteOne({mapid: beatmap_id}, err => {
                    if (err) {
                        console.log(err);
                        setTimeout(async () => {
                            retrieveWhitelist(whitelist_list, i, await whitelistCheck)
                        }, 50);
                        return
                    }
                    ++i;
                    setTimeout(async () => {
                        retrieveWhitelist(whitelist_list, i, await whitelistCheck)
                    }, 50)
                })
            }
            if (hash && mapinfo.hash === hash) {
                ++i;
                setTimeout(async () => {
                    retrieveWhitelist(whitelist_list, i, await whitelistCheck)
                }, 50);
                return
            }
            console.log("Whitelist entry outdated");
            let updateVal = {
                $set: {
                    hashid: mapinfo.hash
                }
            };
            whitelistdb.updateOne({mapid: beatmap_id}, updateVal, err => {
                if (err) {
                    console.log(err);
                    setTimeout(async () => {
                        retrieveWhitelist(whitelist_list, i, await whitelistCheck)
                    }, 50);
                    return
                }
                ++i;
                setTimeout(async () => {
                    retrieveWhitelist(whitelist_list, i, await whitelistCheck)
                }, 50)
            })
        })
    })
};

module.exports.config = {
    name: "scanwhitelist",
    description: "Scans whitelist entries and updates the entry if it's outdated.",
    usage: "scanwhitelist",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};