const osudroid = require('../../modules/osu!droid');

function recalc(target, tlength, i, newtarget, binddb, uid, whitelist, message, total) {
    if (i >= tlength) {
        newtarget.sort(function(a, b) {return b[2] - a[2];});
        console.table(newtarget);
        let totalpp = 0;
        let weight = 1;
        for (let x in newtarget) {
            totalpp += newtarget[x][2] * weight;
            weight *= 0.95;
        }
        console.log(totalpp.toFixed(2));
        let diff = totalpp - total;
        message.channel.send(`${message.author}: ${total}pp -> ${totalpp.toFixed(2)}pp (${diff >= 0 ? `+${diff}` : `-${Math.abs(diff)}`} pp)`);
        /* updatedata = {
            $set : {
                pptotal: totalpp,
                pp: newtarget
            }
        };
        binddb.updateOne({uid: uid}, updatedata, (err) => {
            if (err) return console.log(err);
            console.log("User pp is updated. Total pp:" + totalpp);
        });*/
        return
    }
    let modstring = '';
    if (target[i][1].includes('+'))  {
        let mapstring = target[i][1].split('+');
        modstring = mapstring[mapstring.length-1];
        if (modstring.includes("]")) modstring = ''
    }

    let guessing_mode = true;
    let whitelistQuery = {hashid: target[i][0]};

    whitelist.findOne(whitelistQuery, (err, wlres) => {
        let query = {hash: target[i][0]};
        if (err) return recalc(target, tlength, i, newtarget, binddb, uid, whitelist, message, total);
        if (wlres) query = {beatmap_id: wlres.mapid};
        new osudroid.MapInfo().get(query, mapinfo => {
            if (!mapinfo.title) {
                console.log("Map not found");
                return recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, message, total)
            }
            if (mapinfo.objects == 0) {
                console.log("0 object found");
                return recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, message, total)
            }
            if (!mapinfo.osu_file) {
                console.log("No osu file");
                return recalc(target, tlength, i, newtarget, binddb, uid, whitelist, message, total)
            }
            let acc_percent = 100;
            if (target[i][4]) {
                acc_percent = parseFloat(target[i][4]);
                guessing_mode = false;
            }
            let combo = target[i][3] ? parseInt(target[i][3]) : mapinfo.max_combo;
            let miss = target[i][5] ? parseInt(target[i][5]) : 0;
            let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: modstring});
            let npp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: combo,
                acc_percent: acc_percent,
                miss: miss,
                mode: "osu"
            });
            let pp = parseFloat(npp.toString().split(" ")[0]);
            let real_pp = guessing_mode ? parseFloat(target[i][2]).toFixed(2) : pp;
            console.log(`${target[i][2]} -> ${real_pp}`);
            newtarget.push(guessing_mode ? [target[i][0], target[i][1], real_pp] : [target[i][0], target[i][1], real_pp, target[i][3], target[i][4], target[i][5]]);
            recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, message, total)
        })
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    let uid = args[0];
    let newppentry = [];
    let binddb = maindb.collection("userbind");
    let whitelist = maindb.collection("mapwhitelist");
    binddb.findOne({uid: uid}, function(err, res) {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, I cannot find the user's profile!**");
        let ppentry = res.pp;
        let total = parseFloat(res.pptotal.toFixed(2));
        console.log(ppentry[0]);
        recalc(ppentry, ppentry.length, 0, newppentry, binddb, uid, whitelist, message, total)
    })
};

module.exports.config = {
    name: "prototypepp",
    description: "None",
    usage: "None",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};