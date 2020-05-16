const Discord = require('discord.js');
const osudroid = require('osu-droid');

function retrieveWhitelist(whitelist_entries, i, cb) {
    if (!whitelist_entries[i]) return cb(null, true);
    cb(whitelist_entries[i])
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    let whitelistdb = maindb.collection("mapwhitelist");

    whitelistdb.find({}, {projection: {_id: 0, mapid: 1, hashid: 1}}).toArray((err, whitelist_list) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        let i = 0;
        let attempt = 0;
        retrieveWhitelist(whitelist_list, i, async function whitelistCheck(whitelist, stopSign = false) {
            if (stopSign) return await message.channel.send(`✅ **| ${message.author}, whitelist entry scan complete!**`);
            
            let beatmap_id = whitelist.mapid;
            let hash = whitelist.hashid;
            const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap_id, file: false});
            attempt++;
            if (mapinfo.error) {
                console.log("API fetch error");
                if (attempt === 3) {
                    ++i;
                    attempt = 0
                }
                return retrieveWhitelist(whitelist_list, i, whitelistCheck)
            }
            console.log(i);
            attempt = 0;
            if (!mapinfo.title) {
                console.log("Whitelist entry not available");
                whitelistdb.deleteOne({mapid: beatmap_id}, err => {
                    if (err) {
                        console.log(err);
                        setTimeout(() => {
                            retrieveWhitelist(whitelist_list, i, whitelistCheck)
                        }, 50);
                        return
                    }
                    ++i;
                    setTimeout(() => {
                        retrieveWhitelist(whitelist_list, i, whitelistCheck)
                    }, 50)
                })
            }
            if (hash && mapinfo.hash === hash) {
                ++i;
                setTimeout(() => {
                    retrieveWhitelist(whitelist_list, i, whitelistCheck)
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
                    setTimeout(() => {
                        retrieveWhitelist(whitelist_list, i, whitelistCheck)
                    }, 50);
                    return
                }
                ++i;
                setTimeout(() => {
                    retrieveWhitelist(whitelist_list, i, whitelistCheck)
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