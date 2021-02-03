const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const config = require('../../config.json');

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
module.exports.run = async (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const whitelist = maindb.collection("mapwhitelist");
    const link_in = args[0];
    await whitelistInfo(link_in, message, (res, mapid, hashid, mapstring, diffstring) => {
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
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!");
                    }
                    if (!wlres) return message.channel.send("❎ **| I'm sorry, the beatmap is not whitelisted!**");
                    let removeData = {
                        mapid: parseInt(entry[0]),
                        hashid: entry[1],
                        mapname: entry[2]
                    };
                    console.log("Whitelist entry removed");
                    whitelist.deleteOne(dupQuery, removeData, () => {
                        message.channel.send("Whitelist entry removed | `" + entry[2] + "`");
                    });
                });
            });
        }
    });
};

async function whitelistInfo(link_in, message, callback) {
    let setid = "";
    let mapid = [];
    let hashid = [];
    let diffstring = [];

    if(link_in) {                 //Normal mode
        let line_sep = link_in.split('/');
        setid = line_sep[line_sep.length-1];
    }

    const apiRequestBuilder = new osudroid.OsuAPIRequestBuilder()
        .setEndpoint("get_beatmaps")
        .addParameter("s", setid);

    const result = await apiRequestBuilder.sendRequest();
    const mapinfo = JSON.parse(result.data.toString("utf-8"));

    if (!mapinfo[0]) {console.log("Set not found"); callback(0);}
    let firstmapinfo = mapinfo[0];
    if (firstmapinfo.mode !=0) callback(0);

    for (let i in mapinfo) {
        mapid.push(mapinfo[i].beatmap_id);
        hashid.push(mapinfo[i].file_md5);
        diffstring.push(mapinfo[i].version);
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
    callback(1, mapid, hashid, mapstring, diffstring);
}

module.exports.config = {
    name: "unwhitelistset",
    description: "Unwhitelists a beatmap set.",
    usage: "unwhitelistset <map set link/map set ID>",
    detail: "`map set link/map set ID`: The beatmap set link or ID to unwhitelist [String]",
    permission: "Bot Creators"
};