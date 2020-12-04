const osudroid = require('osu-droid');
const { Db } = require('mongodb');

/**
 * @param {Db} maindb 
 */
module.exports.run = maindb => {
    console.log("Updating clan rank");
    const bindDb = maindb.collection("userbind");
    const clanDb = maindb.collection("clandb");
    const currentTime = Math.floor(Date.now() / 1000);

    bindDb.find({clan: {$not: ""}}, {projection: {_id: 0, discordid: 1, previous_bind: 1}}).toArray((err, res) => {
        if (err) throw err;
        clanDb.find({}, {projection: {_id: 0, name: 1, member_list: 1, weeklyfee: 1}}).toArray(async (err, clans) => {
            if (err) throw err;

            for await (const clan of clans) {
                // do not update rank if weekly upkeep is near
                if (clan.weeklyfee - currentTime < 600) {
                    continue;
                }

                const members = clan.member_list;
                const newMembers = [];
                for await (const member of members) {
                    const user = res.find(u => u.discordid === member.id);
                    if (!user) {
                        continue;
                    }

                    const previousBind = user.previous_bind ?? [user.uid];
                    let rank = Number.POSITIVE_INFINITY;
                    let highestRankUid = 0;

                    for await (const uid of previousBind) {
                        const player = await osudroid.Player.getInformation({uid: uid});
                        if (player.error) {
                            continue;
                        }
                        if (rank > player.rank) {
                            rank = player.rank;
                            highestRankUid = player.uid;
                        }
                    }

                    member.uid = highestRankUid;
                    member.rank = rank;
                    newMembers.push(member);
                }

                await clanDb.updateOne({name: clan.name}, {$set: {member_list: newMembers}});
            }

            console.log("Updating rank done");
        });
    });
};

module.exports.config = {
    name: "clanrankupdate"
};