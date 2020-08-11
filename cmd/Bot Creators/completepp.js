const Discord = require('discord.js');
const request = require('request');
const droidapikey = process.env.DROID_API_KEY;
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function test(uid, page, cb) {
    console.log("Current page: " + page);
    let url = 'http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=' + droidapikey + '&uid=' + uid + '&page=' + page;
    request(url, function (err, response, data) {
        if (err || !data) {
            console.log("Empty response from droid API");
            page--;
            return cb([], false)
        }
        let entries = [];
        let line = data.split('<br>');
        for (let i of line) entries.push(i.split(' '));
        entries.shift();
        if (!entries[0]) cb(entries, true);
        else cb(entries, false)
    })
}

async function calculatePP(ppentries, entry, cb) {
    const mapinfo = await new osudroid.MapInfo().get({hash: entry[11]});
    if (mapinfo.error) {
        console.log("API fetch error");
        return cb()
    }
    if (!mapinfo.title) {
        console.log("Map not found");
        return cb()
    }
    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
        console.log('Error: PP system only accept ranked, approved, whitelisted or loved mapset right now');
        return cb()
    }
    if (!mapinfo.osu_file) {
        console.log("No osu file");
        return cb(true)
    }
    let mods = osudroid.mods.droid_to_PC(entry[6]);
    let acc_percent = parseFloat(entry[7]) / 1000;
    let combo = parseInt(entry[4]);
    let miss = parseInt(entry[8]);
    let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mods});
    let npp = osudroid.ppv2({
        stars: star.droid_stars,
        combo: combo,
        acc_percent: acc_percent,
        miss: miss,
        mode: "droid"
    });
    
    let pp = parseFloat(npp.toString().split(" ")[0]);
    let ppentry = {
        hash: entry[11],
        title: mapinfo.full_title,
        pp: pp,
        mods: mods,
        accuracy: acc_percent,
        combo: combo,
        miss: miss,
        score_id: parseInt(entry[0])
    };
    if (!isNaN(pp)) ppentries.push(ppentry);
    cb()
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    let ppentries = [];
    let page = 0;
    let ufind = args[0];
    if (!ufind) return message.channel.send("Please mention a user or user ID");
    ufind = ufind.replace('<@!','').replace('<@', '').replace('>', '');

    let binddb = maindb.collection("userbind");
    let query = { discordid: ufind };
	binddb.findOne(query, function(err, userres) {
        if (!userres) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres.uid;
        let pplist = [];
        if (userres.pp) pplist = userres.pp;
        let playc = 0;
        let pptotal = 0;

        test(uid, page, async function testcb(entries, stopSign = false) {
            if (stopSign) { 
                console.log("COMPLETED!"); 
                console.table(ppentries); 
                ppentries.forEach(ppentry => {
                    let dup = false;
                    for (let i in pplist) {
                        if (ppentry[0].trim() === pplist[i][0].trim()) {
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
                for (let i of pplist) {
                    pptotal += weight * i[2];
                    weight *= 0.95;
                }
                message.channel.send('✅ **| <@' + message.author.id + '>, recalculated <@' + ufind + ">'s plays: " + pptotal + ' pp.**');
                let updateVal = { $set: {
                        pptotal: pptotal,
                        pp: pplist,
                        playc: playc
                    }
                };
                binddb.updateOne(query, updateVal, function(err) {
                    if (err) throw err;
                    console.log('pp updated')
                });

                //reset everything if additional uid is added
                return;
            }
            console.table(entries);
            let i = 0;
            let attempt = 0;
            await calculatePP(ppentries, entries[i], async function cb(error = false, stopFlag = false) {
                console.log(i);
                attempt++;
                if (attempt === 3 && error) i++;
                if (!error) {
                    i++;
                    playc++;
                    attempt = 0
                }
                if (i < entries.length && !stopFlag) await calculatePP(ppentries, entries[i], cb);
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
    name: "completepp",
    description: "Recalculates all plays of an account.",
    usage: "completepp <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};