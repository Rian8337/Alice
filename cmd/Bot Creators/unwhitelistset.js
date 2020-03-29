const Discord = require('discord.js');
const https = require("https");
const apikey = process.env.OSU_API_KEY;
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

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321' && message.author.id != "293340533021999105") return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let whitelist = maindb.collection("mapwhitelist");
    let link_in = args[0];
    whitelistInfo(link_in, message, (res, mapid, hashid, mapstring, diffstring) => {
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
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!")
                    }
                    if (!wlres) return message.channel.send("❎ **| I'm sorry, the beatmap is not whitelisted!**");
                    let removeData = {
                        mapid: parseInt(entry[0]),
                        hashid: entry[1],
                        mapname: entry[2]
                    };
                    console.log("Whitelist entry removed");
                    whitelist.deleteOne(dupQuery, removeData, () => {
                        message.channel.send("Whitelist entry removed | `" + entry[2] + "`")
                    })
                })
            })
        }
    })
};

function whitelistInfo(link_in, message, callback) {
    let setid = "";
    let mapid = [];
    let hashid = [];
    let diffstring = [];

    if(link_in) {                 //Normal mode
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
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
        });
        res.on("end", function () {
            let obj;
            try {
                obj = JSON.parse(content);
            } catch (e) {
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
            }
            if (!obj[0]) {console.log("Set not found"); callback(0);}
            let mapinfo = obj;
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
        })
    });
	req.end()
}

module.exports.config = {
    name: "unwhitelistset",
    description: "Unwhitelists a beatmap set.",
    usage: "unwhitelistset <map set link/map set ID>",
    detail: "`map set link/map set ID`: The beatmap set link or ID to unwhitelist [String]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
