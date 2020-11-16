const osudroid = require('osu-droid');

function retrieveClan(res, i, cb) {
    if (!res[i]) return cb(null);
    cb(res[i]);
}

module.exports.run = maindb => {
    console.log("Updating clan rank");
    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");

    binddb.find({}, {projection: {_id: 0, discordid: 1, previous_bind: 1}}).toArray(function(err, res) {
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
                    const user = res.find(u => u.discordid === member.id);
                    if (!user) {
                        console.log(`Couldn't find bind with Discord ID ${member.id}`);
                        continue;
                    }
                    let previous_bind = user.previous_bind;
                    if (!previous_bind) previous_bind = [user.uid];
                    let rank = Number.POSITIVE_INFINITY;
                    let fix_uid = 0;
                    for await (const uid of previous_bind) {
                        const player = await osudroid.Player.getInformation({uid: uid});
                        if (player.error) {
                            continue;
                        }
                        if (rank > player.rank) {
                            rank = player.rank;
                            fix_uid = parseInt(uid);
                        }
                    }
                    member.uid = fix_uid;
                    member.rank = rank;
                    new_members.push(member);
                }
    
                const updateVal = {
                    $set: {
                        member_list: new_members
                    }
                };
    
                clandb.updateOne({name: clan.name}, updateVal, err => {
                    if (err) throw err;
                    ++i;
                    retrieveClan(clans, i, processClan);
                });
            });
        });
    });
};

module.exports.config = {
    name: "clanrankupdate"
};
