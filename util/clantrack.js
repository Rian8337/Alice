const osudroid = require('../modules/osu!droid');

function getRank(memberlist, i, ranklist, cb) {
    if (!memberlist[i]) return cb(ranklist, true);
    let uid = memberlist[i][1];
    new osudroid.PlayerInfo().get({uid: uid}, player => {
        if (!player.name) return cb(ranklist);
        ranklist.push(player.rank);
        cb(ranklist)
    })
}

module.exports.run = (client, message = "", args = {}, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel || message.author != null) return;
    console.log("Retrieving clan data");
    let binddb = maindb.collection("userbind");
    let clandb = maindb.collection("clandb");
    let pointdb = alicedb.collection("playerpoints");
    let curtime = Math.floor(Date.now() / 1000);

    clandb.find({}).toArray((err, clan) => {
        if (err) return console.log(err);
        let count = -1;
        let check = setInterval(() => {
            count++;
            if (count == clan.length) {
                clearInterval(check);
                return console.log("Done checking")
            }
            let weeklytime = clan[count].weeklyfee - curtime;
            if (weeklytime > 0) return;
            let memberlist = clan[count].member_list;
            let leader = clan[count].leader;
            let power = clan[count].power;
            let i = 0;
            let ranklist = [];
            getRank(memberlist, i, ranklist, function testRank(ranklist, stopSign = false) {
                if (stopSign) {
                    let totalcost = 200;
                    for (i in ranklist) {
                        totalcost += 20 + Math.floor(480 - 34.74 * Math.log(ranklist[i]))
                    }
                    console.log(clan[count].name, "total cost:", totalcost);
                    pointdb.find({discordid: leader}).toArray((err, pointres) => {
                        if (err) return console.log(err);
                        let alicecoins = 0;
                        if (pointres[0]) alicecoins = pointres[0].alicecoins;
                        if (alicecoins - totalcost < 0) {
                            if (memberlist.length > 1) {
                                let index = Math.floor(Math.random() * (memberlist.length - 1) + 1);
                                while (memberlist[index] == leader) index = Math.floor(Math.random() * memberlist.length);
                                let kicked = memberlist[index][0];
                                memberlist[index] = false;
                                memberlist = memberlist.filter(member => member);
                                client.users.fetch(leader).then((user) => user.send("❗**| I'm sorry, as you do not maintain enough Alice coins for your weekly upkeep, a clan member has been kicked!").catch(console.error)).catch(console.error);
                                client.users.fetch(kicked).then((user) => user.send("❗**| I'm sorry, as your clan leader does not maintain enough Alice coins for your weekly upkeep, you have been kicked from your previous clan!**").catch(console.error)).catch(console.error);
                                let updateVal = {
                                    $set: {
                                        member_list: memberlist,
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
                            }
                            else {
                                if (power < 20) {
                                    client.users.fetch(leader).then((user) => user.send("❗**| I'm sorry, you don't have enough Alice coins for your clan's weekly fee, and it does not have enough members and power points, thus it has been disbanded!**").catch(console.error)).catch(console.error);
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
                                }
                                else {
                                    let updateVal = {
                                        $set: {
                                            power: power - 20,
                                            weeklyfee: curtime + 86400 * 7
                                        }
                                    };
                                    clandb.updateOne({leader: leader}, updateVal, err => {
                                        if (err) return console.log(err);
                                        console.log("Clan power updated")
                                    })
                                }
                            }
                        }
                        else {
                            let updateVal = {
                                $set: {
                                    alicecoins: alicecoins - totalcost
                                }
                            };
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
                    return
                }
                console.log(i);
                i++;
                getRank(memberlist, i, ranklist, testRank)
            })
        }, 5000)
    })
};

module.exports.config = {
    name: "clantrack",
    description: "Used to track clan data.",
    usage: "None",
    detail: "None",
    permission: "None"
};
