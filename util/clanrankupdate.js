const osudroid = require('osu-droid');

function retrieveClan(res, i, cb) {
    if (!res[i]) return cb(null);
    cb(res[i])
}

module.exports.run = maindb => {
    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");

    binddb.find({}, {projection: {_id: 0, discordid: 1, uid: 1}}).toArray(function(err, users) {
        if (err) throw err;
        clandb.find({}, {projection: {_id: 0, name: 1, member_list: 1}}).toArray(function(err, clans) {
            if (err) throw err;
            let i = 0;
            
            retrieveClan(clans, i, async function processClan(clan) {
                if (!clan) return console.log("Process complete");
                console.log(i);
                const members = clan.member_list;
                const new_members = [];
                for await (const member of members) {
                    const uid = users.find(user => user.discordid === member.id).uid;
                    console.log(uid);
                    const player = await new osudroid.PlayerInfo().get({uid: uid});
                    member.uid = parseInt(uid);
                    member.rank = player.rank;
                    new_members.push(member)
                }

                const updateVal = {
                    $set: {
                        member_list: new_members
                    }
                };

                clandb.updateOne({name: clan.name}, updateVal, err => {
                    if (err) throw err;
                    ++i;
                    retrieveClan(clans, i, processClan)
                })
            })
        })
    })
};

module.exports.config = {
    name: "clanrankupdate"
};