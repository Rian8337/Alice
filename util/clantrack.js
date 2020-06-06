const osudroid = require('osu-droid');

function retrieveClan(clans, i, cb) {
    if (!clans[i]) cb(null, true);
    cb(clans[i])
}

async function getRank(binddb, memberlist, i, cb) {
    if (!memberlist[i]) return cb(null, true);
    let rank = Number.POSITIVE_INFINITY;
    const id = memberlist[i].id;
    binddb.findOne({discordid: id}, async (err, res) => {
        if (err) {
            console.log(err);
            return cb(null)
        }
        const bind_pool = res.previous_bind;
        for await (const uid of bind_pool) {
            const player = await new osudroid.PlayerInfo().get({uid: uid});
            rank = Math.min(rank, player.rank)
        }
        cb(rank)
    })
}

module.exports.run = (client, maindb, alicedb) => {
    console.log("Retrieving clan data");
    const guild = client.guilds.cache.get("316545691545501706");
    const role = guild.roles.cache.find(r => r.name === 'Clans');
    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");
    const pointdb = alicedb.collection("playerpoints");
    const curtime = Math.floor(Date.now() / 1000);

    clandb.find({weeklyfee: {$lte: curtime}}).sort({weeklyfee: 1}).toArray((err, clans) => {
        if (err) return console.log(err);
        if (clans.length === 0) return;
        console.log(`Found ${clans.length} clans to be checked for weekly upkeep`);
        let count = 0;
        retrieveClan(clans, count, async function checkClan(clan, stopSign = false) {
            if (stopSign || clan.weeklyfee > curtime) return console.log("Done checking clans");
            ++count;
            let member_list = clan.member_list;
            let leader = clan.leader;
            let power = clan.power;
            const clanrole = guild.roles.cache.find(r => r.name === clan.name);

            let i = 0;
            let rank_list = [];
            await getRank(binddb, member_list, i, async function checkRank(player_rank, stopFlag = false) {
                if (stopFlag) {
                    let total_cost = 200;
                    for (let rank of rank_list) total_cost += 500 - Math.floor(34.74 * Math.log(rank));
                    console.log(clan.name, "total cost:", total_cost);
                    pointdb.findOne({discordid: leader}, (err, pointres) => {
                        if (err) return console.log(err);
                        let alicecoins = 0;
                        if (pointres) alicecoins = pointres.alicecoins;

                        // clan cannot pay upkeep cost
                        if (alicecoins < total_cost) {
                            // has members
                            if (member_list.length > 1) {
                                let index = Math.floor(Math.random() * member_list.length);
                                while (member_list[index].id === leader) index = Math.floor(Math.random() * member_list.length);
                                let kicked = member_list[index].id;

                                member_list.splice(index, 1);
                                if (clanrole) {
                                    const member = guild.member(kicked);
                                    if (member) member.roles.remove([role, clanrole], "Kicked from clan").catch(console.error)
                                }

                                client.users.fetch(leader).then((user) => user.send("❗**| I'm sorry, as you do not maintain enough Alice coins for your weekly upkeep, a clan member has been kicked!**").catch(console.error)).catch(console.error);
                                client.users.fetch(kicked).then((user) => user.send("❗**| I'm sorry, as your clan leader does not maintain enough Alice coins for your weekly upkeep, you have been kicked from your previous clan!**").catch(console.error)).catch(console.error);
                                let updateVal = {
                                    $set: {
                                        member_list: member_list,
                                        weeklyfee: curtime + 86400 * 7
                                    }
                                };
                                clandb.updateOne({leader: leader}, updateVal, err => {
                                    if (err) return console.log(err);
                                    console.log("Clan data updated, player kicked")
                                });
                                updateVal = {
                                    $set: {
                                        clan: "",
                                        joincooldown: curtime + 86400 * 3
                                    }
                                };
                                binddb.updateOne({discordid: kicked}, updateVal, err => {
                                    if (err) return console.log(err);
                                    console.log("Kicked user data updated")
                                })
                            } else {
                                // leader only
                                if (power < 50) {
                                    client.users.fetch(leader).then((user) => user.send("❗**| I'm sorry, you don't have enough Alice coins for your clan's weekly fee, and your clan does not have enough members and power points, thus it has been disbanded!**").catch(console.error)).catch(console.error);
                                    let clanrole = client.guilds.cache.get("316545691545501706").roles.cache.find((r) => r.name === clan.name);
                                    if (clanrole) clanrole.delete("Clan disbanded").catch(console.error);
                                    clandb.deleteOne({leader: leader}, err => {
                                        if (err) return console.log(err);
                                        console.log("Clan disbanded")
                                    });
                                    let updateVal = {
                                        $set: {
                                            clan: ""
                                        }
                                    };
                                    binddb.updateOne({discordid: leader}, updateVal, err => {
                                        if (err) return console.log(err);
                                        console.log("Leader data updated")
                                    })
                                } else {
                                    let updateVal = {
                                        $set: {
                                            power: power - 50,
                                            weeklyfee: curtime + 86400 * 7
                                        }
                                    };
                                    clandb.updateOne({leader: leader}, updateVal, err => {
                                        if (err) return console.log(err);
                                        console.log("Clan power updated")
                                    })
                                }
                            }
                        } else {
                            // clan can pay upkeep cost
                            let updateVal = {
                                $set: {
                                    alicecoins: alicecoins - total_cost
                                }
                            };
                            client.users.fetch(leader).then((user) => user.send(`❗**| Hey, your clan upkeep for this week has been picked! Your next clan upkeep will be picked in ${new Date().toUTCString()}.**`).catch(console.error)).catch(console.error);
                            pointdb.updateOne({discordid: leader}, updateVal, err => {
                                if (err) return console.log(err);
                                console.log("User coins data updated")
                            });
                            updateVal = {
                                $set: {
                                    weeklyfee: curtime + 86400 * 7
                                }
                            };
                            clandb.updateOne({leader: leader}, updateVal, err => {
                                if (err) return console.log(err);
                                console.log("Clan data updated")
                            })
                        }
                    });
                    return retrieveClan(clans, count, checkClan)
                }
                console.log(i);
                rank_list.push(player_rank);
                ++i;
                await getRank(binddb, member_list, i, checkRank)
            })
        })
    })
};

module.exports.config = {
    name: "clantrack",
    description: "Used to track clan data.",
    usage: "None",
    detail: "None",
    permission: "None"
};
