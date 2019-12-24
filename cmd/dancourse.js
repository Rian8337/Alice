var http = require('http');
var droidapikey = process.env.DROID_API_KEY;
var config  = require('../config.json');
var cd = new Set();

function isEligible(member) {
    var res = 0;
    var eligibleRoleList = config.mute_perm; //mute_permission but used for this command, practically the same
    eligibleRoleList.forEach((id) => {
        if(member.roles.has(id[0])) res = id[1]
    });
    return res
}

function rejectionMessage(id) {
    switch (id) {
        case 1: return "NF/EZ/HT mod used";
        case 2: return "Rank achieved is not S or accuracy achieved is less than 97% with A rank";
        case 3: return "Accuracy achieved is less than 93%";
        case 4: return "Accuracy achieved is less than 90%";
        case 5: return "Rank achieved is not S or A";
        default: return "Unknown"
    }
}

function dancheck(hash) {
    switch (hash) {
        case "53d46ac17cc3cf56f35c923f72343fa5": return [1, "1st Dan"];
        case "520e21c012c50b328cec7dff20d6ba37": return [2, "2nd Dan"];
        case "78ce191ff0e732fb7a3c76b5b1b68180": return [3, "3rd Dan"];
        case "461f0c615a5cba0d33137ce28dd815fb": return [4, "4th Dan"];
        case "f3577717c5a3ecbe7663a9b562453ea3": return [5, "5th Dan"];
        case "056bf9d0d67b0b862d831cfe65f09ae7": return [6, "6th Dan"];
        case "26beb83acc2133f3b756288d158fded4": return [7, "7th Dan"];
        case "47d5130e26c70c7ab8f4fc08424f4459": return [8, "8th Dan"];
        case "5c10b8deba7725ba1009275f1240f950": return [9, "9th Dan"];
        case "40261e470a4649e3f77b65d64964529e": return [10, "Chuuden"];
        case "c12aa4ce57bf072ffa47b223b81534dd": return [11, "Kaiden"];
        case "b07292999f84789970bf8fbad72d5680": return [12, "Aleph-0 Dan"];
        default: return 0
    }
}

function validation(dan, mod, acc, rank) {
    var res = 0;
    if (mod.includes("n") || mod.includes("e") || mod.includes("t")) {
        res = 1;
        return res
    }
    if (dan >= 1 && dan <= 9 && (acc < 97 || !rank.includes("S"))) res = 2; // 1st-9th Dan
    if (dan === 10 && acc < 93) res = 3; // Chuuden
    if (dan === 11 && acc < 90) res = 4;// Kaiden
    if (dan === 12 && (!rank.includes("A") && !rank.includes("S"))) res = 5; // Aleph-0 Dan
    return res
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel.id != '361785436982476800') return message.channel.send("❎ **| I'm sorry, this command is only supported in dan course channel in osu!droid International Discord server.**");
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    let danlist = ["1st Dan", "2nd Dan", "3rd Dan", "4th Dan", "5th Dan", "6th Dan", "7th Dan", "8th Dan", "9th Dan", "Chuuden", "Kaiden", "Aleph-0 Dan"];
    let channel = message.guild.channels.get("316545691545501706");

    if (args[0]) {
        let perm = isEligible(message.member);
        if (perm == 0) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this. Please ask a Helper!**");

        let togive = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if (!togive) return message.channel.send("❎ **| Hey, I don't know the user to give the role to!**");

        let rolename = args.slice(1).join(" ");
        if (!rolename) return message.channel.send("❎ **| Hey, I don't know what dan role to give!**");
        if (!danlist.includes(rolename)) {
            let rolelist = '';
            danlist.forEach(role => {
                rolelist += '`' + role + '`;';
            });
            rolelist = rolelist.split(";").join(", ").slice(0, -2);
            return message.channel.send(`❎ **| I'm sorry, I cannot find the role! Accepted arguments are ${rolelist}.**`)
        }
        let role = message.guild.roles.find(r => r.name === rolename);
        if (!role) return message.channel.send(`❎ **| I'm sorry, I cannot find ${rolename} role!**`);
        if (togive.roles.has(role.id)) return message.channel.send(`❎ **| I'm sorry, the user already has ${rolename} role!**`);

        togive.addRole(role.id, "Successfully completed dan course").then (() => {
            message.channel.send(`✅ **| ${message.author}, successfully given ${rolename} role for <@${togive.id}>. Congratulations for <@${togive.id}>!**`);
            if (danlist.slice(7, danlist.length).includes(rolename)) channel.send(`**<@${togive.id}> has just completed ${rolename}. Congratulations to <@${togive.id}>!**`)
        }).catch(e => console.log(e));

        // Dan Course Master
        danlist.pop();
        let count = 1;
        danlist.forEach(role => {
            if (togive.roles.find(r => r.name === role)) count++
        });
        if (count == danlist.length) {
            let dcmrole = message.guild.roles.find(r => r.name === "Dan Course Master");
            if (!dcmrole) return message.channel.send("❎ **| I'm sorry, I cannot find the Dan Course Master role!**");
            togive.addRole(dcmrole.id, "Successfully completed required dan courses").then(() => {
                message.channel.send(`✅ **| <@${togive.id}>, congratulations! You have completed every dan required to get the Dan Course Master role!**`);
                channel.send(`**<@${togive.id}> has just achieved Dan Course Master. Congratulations to <@${togive.id}>!**`)
            }).catch(e => console.log(e));
        }
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 5000);
    }
    else {
        let binddb = maindb.collection("userbind");
        let query = {discordid: message.author.id};
        binddb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (!res[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
            var uid = res[0].uid;
            var options = {
                host: "ops.dgsrz.com",
                port: 80,
                path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
            };
            var content = '';
            var req = http.request(options, res1 => {
                res1.setEncoding("utf8");
                res1.on("data", chunk => {
                    content += chunk
                });
                res1.on("error", err1 => {
                    console.log(err1);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                });
                res1.on("end", () => {
                    let resarr = content.split("<br>");
                    let headerres = resarr[0].split(" ");
                    if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, I cannot find your username!**");
                    var obj;
                    try {
                        obj = JSON.parse(resarr[1])
                    } catch (e) {
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                    }
                    if (!obj.recent[0]) return message.channel.send("❎ **| You haven't set any plays!**");
                    let play = obj.recent[0];
                    let mods = play.mode;
                    let acc = (parseInt(play.accuracy) / 1000).toFixed(2);
                    let rank = play.mark;
                    let dan = dancheck(play.hash);
                    let valid = validation(dan[0], mods, acc, rank);
                    if (valid != 0) return message.channel.send("❎ **| I'm sorry, the dan course you've played didn't fulfill the requirement for dan role!\nReason: " + rejectionMessage(valid) + "**");

                    let danrole = dan[1];
                    let role = message.guild.roles.find(r => r.name === danrole);
                    if (!role) return message.channel.send(`❎ **| I'm sorry, I cannot find ${danrole} role!**`);
                    if (message.member.roles.has(role.id)) return message.channel.send(`❎ **| I'm sorry, you already have ${danrole} role!**`);
                    message.member.addRole(role.id, "Successfully completed dan course").then(() => {
                        message.channel.send(`✅ **| ${message.author}, congratulations! You have completed ${danrole}.**`);
                        if (dan[0] > 7) channel.send(`**${message.author} has just completed ${danrole}. Congratulations to ${message.author}!**`)
                    }).catch(console.error);

                    // Dan Course Master
                    danlist.pop();
                    let count = 1;
                    danlist.forEach(role => {
                        if (message.member.roles.find(r => r.name === role)) count++
                    });
                    if (count == danlist.length) {
                        let dcmrole = message.guild.roles.find(r => r.name === "Dan Course Master");
                        if (!dcmrole) return message.channel.send("❎ **| I'm sorry, I cannot find the Dan Course Master role!**");
                        message.member.addRole(dcmrole.id, "Successfully completed required dan courses").then(() => {
                            message.channel.send(`✅ **| ${message.author}, congratulations! You have completed every dan required to get the Dan Course Master role!**`);
                            channel.send(`**${message.author} has just achieved Dan Course Master. Congratulations to ${message.author}!**`)
                        }).catch(console.error)
                    }
                })
            });
            req.end();
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 5000)
        })
    }
};

module.exports.help = {
    name: "dancourse"
};
