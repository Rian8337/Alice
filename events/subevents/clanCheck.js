const { Client, GuildMember } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {GuildMember} member 
 * @param {Db} maindb 
 */
module.exports.run = (client, member, maindb) => {
    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");
    const curtime = Math.floor(Date.now() / 1000);
    
    let query = {discordid: member.id};
    binddb.findOne(query, (err, res) => {
        if (err) {
            return console.log(err);
        }
        if (!res) {
            return;
        }
        let clan = res.clan;
        if (!clan) {
            return;
        }
        query = {name: clan};
        clandb.findOne(query, (err, clanres) => {
            if (err) {
                return console.log(err);
            }
            if (!clanres) {
                return;
            }
            let member_list = clanres.member_list;
            let leader = clanres.leader;
            let index = member_list.findIndex(m => m.id === member.id);
            member_list.splice(index, 1);
            if (member.id === leader) {
                // Set new leader
                index = Math.floor(Math.random() * member_list.length);
                while (!member_list[index].hasPermission) {
                    index = Math.floor(Math.random() * member_list.length);
                }
                member_list[index].hasPermission = true;
                member_list[index].id = leader;
            }
            let updateVal = {
                $set: {
                    clan: "",
                    joincooldown: curtime + 86400 * 3,
                    oldclan: clan,
                    oldjoincooldown: curtime + 86400 * 14
                }
            };
            binddb.updateOne({discordid: member.id}, updateVal, err => {
                if (err) {
                    return console.log(err);
                }
                updateVal = {
                    $set: {
                        leader,
                        member_list
                    }
                };
                clandb.updateOne(query, updateVal, err => {
                    if (err) {
                        return console.log(err);
                    }
                    if (member.id !== leader) {
                        client.users.fetch(member_list[index].id).then(u => u.send(`❗**| Hey, unfortunately ${res.username} (uid ${res.uid}) has left the server! Therefore, you have been promoted as Clan Leader!`).catch(console.error)).catch(console.error);
                    } else {
                        client.users.fetch(leader).then(u => u.send(`❗**| Hey, unfortunately ${res.username} (uid ${res.uid}) has left the server! Therefore, the user has been kicked from your clan!**`).catch(console.error)).catch(console.error);
                    }
                });
            });
        });
    });
};

module.exports.config = {
    name: "clanCheck"
};