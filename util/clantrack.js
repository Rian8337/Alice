const osudroid = require('osu-droid');
const { Client } = require('discord.js');
const { Db } = require('mongodb');

function equalDistribution(num) {
    const dist_list = [];
    const index_list = [];
    const base = Math.floor(200 / num);
    const mod = 200 % num;

    for (let i = 0; i < num; ++i) {
        dist_list.push(base);
    }

    for (let i = 0; i < mod; ++i) {
        let index = Math.floor(Math.random() * dist_list.length);
        while (index_list.includes(index)) index = Math.floor(Math.random() * dist_list.length);
        index_list.push(index);
        ++dist_list[index];
    }

    return dist_list;
}

/**
 * @param {Client} client 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, maindb, alicedb) => {
    const guild = client.guilds.cache.get("316545691545501706");
    const role = guild.roles.cache.find(r => r.name === 'Clans');
    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");
    const pointdb = alicedb.collection("playerpoints");
    const curtime = Math.floor(Date.now() / 1000);

    clandb.find({weeklyfee: {$lte: curtime}}).sort({weeklyfee: 1}).toArray(async (err, clans) => {
        if (err) {
            return console.log(err);
        }
        if (clans.length === 0) {
            return;
        }

        for await (const clan of clans) {
            console.log(`Checking ${clan.name} clan`);
            const clanrole = guild.roles.cache.find(r => r.name === clan.name);
            const leader = clan.leader;
            const memberList = clan.member_list;
            const upkeepDistribution = equalDistribution(member_list.length);
            const query = {discordid: {$in: []}};
            for (const member of memberList) {
                query.discordid.$in.push(member.id);
            }

            const newMemberList = [];
            const kickedList = [];
            const rankInformation = [];
            const upkeepPricesList = [];
            let clanDisbanded = false;

            console.log("Fetching clan members coins entry");
            const membersPoints = await pointdb.find(query, {projection: {_id: 0, discordid: 1, alicecoins: 1}}).toArray();
            const bindInfo = await binddb.find({clan: clan.name}, {projection: {_id: 0, discordid: 1, uid: 1, previous_bind: 1}}).toArray();

            for await (const bind of bindInfo) {
                let rank = Number.POSITIVE_INFINITY;
                for await (const uid of bindInfo.previous_bind) {
                    rank = Math.min(rank, await osudroid.Player.getInformation({uid: uid}));
                }
                rankInformation.push({
                    discordid: bind.discordid,
                    rank: rank
                });
            }

            for (let i = 0; i < memberList.length; ++i) {
                const member = memberList[i];
                const guildMember = guild.member(member.id);
                // if the person is not in the server, kick the person
                if (!guildMember) {
                    upkeepDistribution.shift();
                    kickedList.push(member.id);
                    continue;
                }

                const index = Math.floor(Math.random() * upkeepDistribution.length);
                const rank = rankInformation.find(v => v.discordid === member.id);
                if (!rank) {
                    kickedList.push(member.id);
                    upkeepDistribution.shift();
                    continue;
                }
                const upkeep = 500 - Math.floor(34.74 * Math.log(rank)) + upkeepDistribution[index];
                upkeepDistribution.splice(index, 1);

                const memberPoint = membersPoints.find(m => m.discordid === member.id);

                // if clan member can't pay upkeep
                if (!memberPoint || memberPoint.alicecoins < upkeep) {
                    console.log(`Uid ${member.uid} cannot pay upkeep`);
                    // if leader is the current entry in loop, kick random member
                    if (member.id === leader && memberList.length > 1) {
                        console.log(`Uid ${member.uid} cannot pay upkeep, user is clan leader`);
                        let memberIndex = Math.floor(Math.random() * memberList.length);
                        while (memberList[memberIndex].id === leader) {
                            memberIndex = Math.floor(Math.random() * memberList.length);
                        }
                        kickedList.push(memberList[memberIndex].id);
                        const paidIndex = newMemberList.findIndex(m => m.id === memberList[memberIndex].id);
                        if (paidIndex !== 1) {
                            newMemberList.splice(paidIndex, 1);
                        }
                    } // if the clan only consists of the leader himself
                    else if (memberList.length === 1) {
                        // if clan power is less than 100, disband the clan
                        clanDisbanded = clan.power < 100;
                    }
                    // if there are other members
                    else {
                        kickedList.push(member.id);
                    }
                }
                // clan member can pay upkeep
                else {
                    console.log(`Uid ${member.uid} can pay upkeep`);
                    newMemberList.push(member);
                    upkeepPricesList.push({
                        id: member.id,
                        upkeep: upkeep
                    });
                }
            }

            // disband clan
            if (clanDisbanded && memberList.length === 1) {
                await clandb.deleteOne({name: clan.name});
                await binddb.updateOne({discordid: leader}, {$set: {
                    clan: "",
                    oldclan: clan.name,
                    joincooldown: curtime + 86400 * 3,
                    oldjoincooldown: curtime + 86400 * 14
                }});
                continue;
            }

            // pay for upkeep
            for await (const upkeepPrice of upkeepPricesList) {
                await pointdb.updateOne({discordid: upkeepPrice.id}, {$inc: {alicecoins: -upkeepPrice.upkeep}});
            }

            // kick members
            for await (const kicked of kickedList) {
                if (clanrole) {
                    const guildMember = guild.member(kicked);
                    if (guildMember) {
                        guildMember.roles.remove([role, clanrole], "Kicked from clan");
                    }
                }
                await binddb.updateOne({discordid: kicked}, {$set: {
                    clan: "",
                    oldclan: clan.name,
                    joincooldown: curtime + 86400 * 3,
                    oldjoincooldown: curtime + 86400 * 14
                }});
            }

            // update clan entry
            if (newMemberList.length > 0) {
                await clandb.updateOne({name: clan.name}, {$inc: {weeklyfee: 86400 * 7}, $set: {member_list: newMemberList}});
            }

            // notify clan leaders
            client.users.fetch(leader).then(u => u.send(`❗**| Hey, your clan upkeep has been picked up from your members! ${newMemberList.length} member(s) have successfully paid their upkeep. A total of ${kickedList.length} member(s) were kicked. Your next clan upkeep will be picked in ${new Date((clan.weeklyfee + 86400 * 7) * 1000).toUTCString()}.**`).catch(console.error)).catch(console.error);
            console.log(`Done checking ${clan.name} clan`);
        }
        console.log("Clan check complete");
    });
};

module.exports.config = {
    name: "clantrack"
};