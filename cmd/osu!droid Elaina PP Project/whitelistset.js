const Discord = require('discord.js');
const osudroid = require('osu-droid');
const https = require("https");
const apikey = process.env.OSU_API_KEY;
const config = require('../../config.json');
const { Db } = require('mongodb');

function mapstatusread(status) {
	switch (status) {
		case -2: return 16711711;
		case -1: return 9442302;
		case 0: return 16312092;
		case 1: return 2483712;
		case 2: return 16741376;
		case 3: return 5301186;
		case 4: return 16711796;
		default: return 0
	}
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    }
    if (!message.isOwner && !message.member.roles.cache.has('551662273962180611')) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    let whitelist = maindb.collection("mapwhitelist");
    let link_in = args[0];
    whitelistInfo(client, link_in, message, (res, mapid, hashid, mapstring, diffstring) => {
        if (res > 0) {
            let i = 0;
            let entryarr = [];
            for (i in mapid) {
                let finalstring = mapstring + " [" + diffstring[i] + "]";
                entryarr.push([mapid[i], hashid[i], finalstring]);
            }
            entryarr.forEach((entry) => {
                let dupQuery = {mapid: parseInt(entry[0])};
                whitelist.findOne(dupQuery, (err, wlres) => {
                    console.log(wlres);
                    if (err) {
                        console.log(err);
                        return message.channel.send("Error: Empty database response. Please try again!");
                    }
                    if (!wlres) {
                        let insertData = {
                            mapid: parseInt(entry[0]),
                            hashid: entry[1],
                            mapname: entry[2]
                        };
                        console.log("Whitelist entry added");
                        whitelist.insertOne(insertData, () => {
                            message.channel.send("Whitelist entry added | `" + entry[2] + "`");
                            client.channels.cache.get("638671295470370827").send("Whitelist entry added | `" + entry[2] + "`");
                        });
                    }
                    else {
                        let updateData = { $set: {
                            mapid: parseInt(entry[0]),
                            hashid: entry[1],
                            mapname: entry[2]
                        }};
                        console.log("Whitelist entry update");
                        whitelist.updateOne(dupQuery, updateData, () => {
                            message.channel.send("Whitelist entry updated | `" + entry[2] + "`");
                            client.channels.cache.get("638671295470370827").send("Whitelist entry updated | `" + entry[2] + "`");
                        });
                    }
                });
            });
        }
        else message.channel.send("❎ **| I'm sorry, beatmap whitelisting failed.**");
    });
};

function whitelistInfo(client, link_in, message, callback) {
    let setid = "";
    let mapid = [];
    let hashid = [];
    let diffstring = [];

    if(link_in) {  //Normal mode
        let line_sep = link_in.split('/');
        setid = line_sep[line_sep.length-1]
    }
    let options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&s=" + setid);

	let content = "";

	let req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
        });
		res.on("error", err => {
		    console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again later!**")
        });
        res.on("end", function () {
            let obj;
            try {
                obj = JSON.parse(content);
            } catch (e) {
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again later!**")
            }
            if (!obj[0]) {console.log("Set not found"); callback(0);}
            let mapinfo = obj;
            let firstmapinfo = mapinfo[0];
            if (firstmapinfo.mode !=0) callback(0);
            if (parseInt(firstmapinfo.approved) !== osudroid.rankedStatus.GRAVEYARD) {
                message.channel.send("❎ **| I'm sorry, this map is not graveyarded!**");
                return callback(0);
            }

            for (let i in mapinfo) {
                if (mapinfo[i].mode == 0) {
                    mapid.push(mapinfo[i].beatmap_id);
                    hashid.push(mapinfo[i].file_md5);
                    diffstring.push(mapinfo[i].version);
                }
            }
            
            let listoutput = "";

            for (let i in diffstring) {
                listoutput += "- " + diffstring[i] + " - **" + parseFloat(mapinfo[i].difficultyrating).toFixed(2) + "**\n" ;
            }

            let mapstring = firstmapinfo.artist + " - " + firstmapinfo.title + " (" + firstmapinfo.creator + ")";
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const embed = {
                "title": mapstring,
                "description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + firstmapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + firstmapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat]()",
                "url": "https://osu.ppy.sh/b/" + firstmapinfo.beatmap_id ,
                "color": mapstatusread(parseInt(firstmapinfo.approved)),
                "footer": {
                    "icon_url": footer[index],
                    "text": "Alice Synthesis Thirty"
                },
                "author": {
                    "name": "Set Found",
                    "icon_url": "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg"
                },
                "thumbnail": {
                    "url": "https://b.ppy.sh/thumb/" + firstmapinfo.beatmapset_id + ".jpg"
                },
                "fields": [
                    {
                        "name": "Last Update: " + firstmapinfo.last_update,
                        "value": "Star Rating: \n" + listoutput 
                    }
                ]
            };
            message.channel.send({embed: embed}).catch(console.error);
            client.channels.cache.get("638671295470370827").send({embed: embed}).catch(console.error);
            callback(1, mapid, hashid, mapstring, diffstring);
        });
    });
	req.end();
}

module.exports.config = {
    name: "whitelistset",
    description: "Whitelists a beatmap set.",
    usage: "whitelistset <map set link/map set ID>",
    detail: "`map set link/map set ID`: The beatmap set link or ID to whitelist [String]",
    permission: "pp-project Map Validator"
};