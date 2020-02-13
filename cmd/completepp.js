let Discord = require('discord.js');
let request = require('request');
let droidapikey = process.env.DROID_API_KEY;
let osudroid = require('../modules/osu!droid');

function test(uid, page, cb) {
    console.log("Current page: " + page);
    let url = 'http://ops.dgsrz.com/api/scoresearch.php?apiKey=' + droidapikey + '&uid=' + uid + '&page=' + page;
    request(url, function (err, response, data) {
        if (!data) {
            console.log("Empty response from droid API");
            page--;
        }
        //console.log(data);
        let entries = [];
        let line = data.split('<br>');
        for (let i in line) {
            entries.push(line[i].split(' '));
        }
        entries.shift();
        if (!entries[0]) cb(entries, true);
        else cb(entries, false)
    })
}

function calculatePP(ppentries, entry, cb) {
    if (entry[1] == '0') {
        console.log("0 score found");
        return cb()
    }
    new osudroid.MapInfo().get({hash: entry[8]}, mapinfo => {
        if (!mapinfo.title) {
            console.log("Map not found");
            return cb()
        }
        if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
            console.log('Error: PP system only accept ranked, approved, whitelisted or loved mapset right now');
            return cb()
        }
        let beatmapid = mapinfo.beatmap_id;
        let mods = mapinfo.modConvert(entry[4]);
        let acc_percent = parseFloat(entry[5]) / 1000;
        let combo = parseInt(entry[2]);
        let miss = parseInt(entry[6]);
        new osudroid.MapStars().calculate({beatmap_id: beatmapid, mods: mods}, star => {
            let npp = new osudroid.MapPP().calculate({
                stars: star.droid_stars,
                combo: combo,
                miss: miss,
                acc_percent: acc_percent,
                mode: "droid"
            });
            let playinfo = mapinfo.showStatistics(mods, 0);
            let pp = parseFloat(npp.pp.toString().split(" ")[0]);
            let ppentry = [entry[8], playinfo, pp, combo.toString() + "x", acc_percent.toString() + "%", miss.toString()];
            if (!isNaN(pp)) ppentries.push(ppentry);
            cb()
        })
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    let ppentries = [];
    let page = 0;
    let ufind = args[0];
    if (!ufind) return message.channel.send("Please mention a user or user ID");
    ufind = ufind.replace('<@!','');
    ufind = ufind.replace('<@','');
    ufind = ufind.replace('>','');

    let binddb = maindb.collection("userbind");
    let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, userres) {
        if (!userres[0]) return console.log('user not found');
        let uid = userres[0].uid;
        let pplist = [];
        if (userres[0].pp) pplist = userres[0].pp;
        let playc = 0;
        let pptotal = 0;

        test(uid, page, function testcb(entries, stopSign) {
            if (stopSign) { 
                console.log("COMPLETED!"); 
                console.table(ppentries); 
                ppentries.forEach((ppentry) => {
                    let dup = false;
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
                let weight = 1;
                for (i in pplist) {
                    pptotal += weight*pplist[i][2];
                    weight *= 0.95;
                }
                message.channel.send('<@' + message.author.id + '> recalculated <@' + ufind + ">'s plays: " + pptotal + ' pp');
                let updateVal = { $set: {
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
            let i = 0;
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
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
	name: "completepp"
};
