var Discord = require('discord.js');
var request = require('request');
var droid = require("./ojsamadroid");
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;

function modread(input) {
	var res = 4;
	if (input.includes('n')) res += 1;
	if (input.includes('h')) res += 8;
	if (input.includes('r')) res += 16;
	if (input.includes('e')) res += 2;
	if (input.includes('t')) res += 256;
	if (input.includes('c')) res += 576;
	if (input.includes('d')) res += 64;
	return res;
}

function test(uid, page, cb) {
    console.log("Current page: " + page);
    var url = 'http://ops.dgsrz.com/api/scoresearch.php?apiKey=' + droidapikey + '&uid=' + uid + '&page=' + page;
    request(url, function (err, response, data) {
        if (!data) {
            console.log("Empty response from droid API");
            page--;
        }
        //console.log(data);
        var entries = [];
        var line = data.split('<br>');
        for (i in line) {
            entries.push(line[i].split(' '));
        }
        entries.shift();
        if (!entries[0]) cb(entries, true);
        else cb(entries, false)
    })
}

function calculatePP(ppentries, entry, cb) {
    if (!entry) {console.log("erm how we get here"); cb(); return;}
    var url = "https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + entry[8];
    request(url, function (err, response, data) {
        if (!data) {
            console.log("Empty response from osu! API");
            cb();
            return;
        }
        //console.log(data);

        if (entry[1] == '0') {
            console.log("0 score found");
            cb();
            return;
        }
        if (data.includes("<html>")) {
            console.log("json error");
            cb(true);
            return;
        }
        var obj = JSON.parse(data);
        if (!obj[0]) {
            console.log("Map not found"); 
            //message.channel.send("Error: The map you've played can't be found on osu! beatmap listing, please make sure the map is submitted, and up-to-date")
            cb();
            return;
        }

        var mapinfo = obj[0];
        var mapid = mapinfo.beatmap_id;
        if (mapinfo.mode !=0) cb();
        if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
            console.log('Error: PP system only accept ranked, approved, whitelisted or loved mapset right now');
            cb();
            return;
        }
        else {
            //console.log(mapinfo)
            var mapurl = 'https://osu.ppy.sh/osu/' + mapid;
            request(mapurl, function (err, response, data) {
                if (!data) {
                    console.log("Error retrieving map data");
                    cb();
                    return;
                }
                //console.log(data)
                var parser = new droid.parser();
                var mods = modread(entry[4]);
                var acc_percent = parseFloat(entry[5]) / 1000;
                var combo = parseInt(entry[2]);
                var nmiss = parseInt(entry[6]);
                parser.feed(data);
                var nmap = parser.map;
                var cur_od = nmap.od - 5;
                var cur_ar = nmap.ar;
                var cur_cs = nmap.cs - 4;
                // if (mods) {
                // 	console.log("+" + osu.modbits.string(mods));
                // }
                if (entry[4].includes("r")) {
                    mods -= 16; 
                    cur_ar = Math.min(cur_ar*1.4, 10);
                    cur_od = Math.min(cur_od*1.4, 5);
                    cur_cs += 1;
                }

                nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;

                if (nmap.ncircles == 0 && nmap.nsliders == 0) {
                    console.log('Error: no object found'); 
                    cb();
                    return;
                }

                var nstars = new droid.diff().calc({map: nmap, mods: mods});
                var npp = droid.ppv2({
                    stars: nstars,
                    combo: combo,
                    nmiss: nmiss,
                    acc_percent: acc_percent,
                });

                if (entry[4].includes("r")) { mods += 16; }

                //console.log(nstars.toString());
                //console.log(npp.toString());
                var ppline = npp.toString().split("(");
                var playinfo = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mods == 4 && (!entry[4].includes("PR")))? " " : "+ ") + droid.modbits.string(mods - 4) + ((entry[4].includes("PR")? "PR": ""))
                //console.log(ppline)
                //console.log(playinfo)
                var pp = ppline[0];
                var ppentry = [entry[8], playinfo, parseFloat(pp), combo.toString() + "x", acc_percent.toString() + "%", nmiss.toString()];
                if (!isNaN(ppentry[2])) ppentries.push(ppentry);
                cb()
            })
        }
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
	if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    var ppentries = [];
    var page = 0;
    var ufind = args[0];

    if (args[0]) {
        ufind = args[0];
        ufind = ufind.replace('<@!','');
        ufind = ufind.replace('<@','');
        ufind = ufind.replace('>','');
    } else return message.channel.send("Please mention a user or user ID");

    let binddb = maindb.collection("userbind");
    let whitelist = maindb.collection("mapwhitelist");
    var query = { discordid: ufind };
	binddb.find(query).toArray(function(err, userres) {
        if (!userres[0]) {console.log('user not found'); return;}
        var uid = userres[0].uid;
        if (userres[0].pp) var pplist = userres[0].pp;
        else var pplist = [];
        var playc = 0;
        var pptotal = 0;

        test(uid, page, function testcb(entries, stopSign) {
            if (stopSign) { 
                console.log("COMPLETED!"); 
                console.table(ppentries); 
                ppentries.forEach((ppentry) => {
                    var dup = false;
                    //pplist.push(ppentry)
                    for (i in pplist) {
                        if (ppentry[0].trim() == pplist[i][0].trim()) {
                            if(ppentry[2] >= pplist[i][2]) pplist[i] = ppentry; 
                            dup = true; playc++; break;
                        }
                    }
                    if (!dup) {pplist.push(ppentry); playc++;}
                });
                pplist.sort(function(a, b) {return b[2] - a[2]});
                if (pplist.length > 75) pplist.splice(75);
                console.table(pplist);
                var weight = 1;
                for (i in pplist) {
                    pptotal += weight*pplist[i][2];
                    weight *= 0.95;
                }
                message.channel.send('<@' + message.author.id + '> recalculated <@' + ufind + ">'s plays: " + pptotal + ' pp');
                var updateVal = { $set: {
                        pptotal: pptotal,
                        pp: pplist,
                        playc: playc
                    }
                };
                binddb.updateOne(query, updateVal, function(err, res) {
                    if (err) throw err;
                    console.log('pp updated')
                });

                //reset everything if additional uid is added
                return;
            }
            console.table(entries);
            var i = 0;
            calculatePP(ppentries, entries[i], function cb(stopFlag = false) {
                console.log(i);
                i++;
                playc++;
                if (i < entries.length && !stopFlag) calculatePP(ppentries, entries[i], cb);
                else {
                    console.log("done");
                    ppentries.sort(function(a, b) {return b[2] - a[2]});
                    if (ppentries.length > 75) ppentries.splice(75);
                    page++;
                    console.table(ppentries);
                    test(uid, page, testcb)
                }
            })
        })
    })
};

module.exports.config = {
    description: "Recalculates all plays of an account.",
    usage: "completepp <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Owner"
};

module.exports.help = {
	name: "completepp"
};
