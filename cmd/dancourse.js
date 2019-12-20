var http = require('http');
var droidapikey = process.env.DROID_API_KEY;

function danid (hash) {
    switch (hash) {
        case "53d46ac17cc3cf56f35c923f72343fa5": return 1; // 1st Dan
        case "520e21c012c50b328cec7dff20d6ba37": return 2; // 2nd Dan
        case "78ce191ff0e732fb7a3c76b5b1b68180": return 3; // 3rd Dan
        case "461f0c615a5cba0d33137ce28dd815fb": return 4; // 4th Dan
        case "f3577717c5a3ecbe7663a9b562453ea3": return 5; // 5th Dan
        case "056bf9d0d67b0b862d831cfe65f09ae7": return 6; // 6th Dan
        case "26beb83acc2133f3b756288d158fded4": return 7; // 7th Dan
        case "47d5130e26c70c7ab8f4fc08424f4459": return 8; // 8th Dan
        case "5c10b8deba7725ba1009275f1240f950": return 9; // 9th Dan
        case "40261e470a4649e3f77b65d64964529e": return 10; // Chuuden
        case "c12aa4ce57bf072ffa47b223b81534dd": return 11; // Kaiden
        case "b07292999f84789970bf8fbad72d5680": return 12; // Aleph-0 Dan
        default: return 0
    }
}

function dancheck (dan) {
    switch (dan) {
        case 1: return "1st Dan";
        case 2: return "2nd Dan";
        case 3: return "3rd Dan";
        case 4: return "4th Dan";
        case 5: return "5th Dan";
        case 6: return "6th Dan";
        case 7: return "7th Dan";
        case 8: return "8th Dan";
        case 9: return "9th Dan";
        case 10: return "Chuuden";
        case 11: return "Kaiden";
        case 12: return "Aleph-0 Dan";
        default: return false
    }
}

function validation (dan, mod, acc, rank) {
    var res;
    if (mod.includes("n") || mod.includes("e") || mod.includes("t")) {
        res = 0;
        return res
    }
    if (dan >= 1 && dan <= 9) { // 1st-9th Dan
        if (acc >= 97) res = 1;
        else {
            if (rank.includes("S")) res = 1;
            else res = 0;
        }
    }
    if (dan === 10) { // Chuuden
        if (acc >= 93) res = 1;
        else res = 0
    }
    if (dan === 11) { // Kaiden
        if (acc >= 90) res = 1;
        else res = 0
    }
    if (dan === 12) { // Aleph-0 Dan
        if (rank.includes("A")) res = 1;
        else res = 0
    }
    return res
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel.id != '361785436982476800') return message.channel.send("❎ **| I'm sorry, this command is only supported in dan course channel in osu!droid International Discord server.**");
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
                var resarr = content.split("<br>");
                var headerres = resarr[0].split(" ");
                if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, I cannot find your username!**");
                var obj;
                try {
                    obj = JSON.parse(resarr[1])
                } catch (e) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                }
                if (!obj.recent[0]) return message.channel.send("❎ **| You haven't set any plays!**");
                var play = obj.recent[0];
                var mods = play.mode;
                var acc = (parseInt(play.accuracy) / 1000).toFixed(2);
                var rank = play.mark;
                var hash = play.hash;

                var dan = danid(hash);
                if (dan === 0) return message.channel.send("❎ **| I'm sorry, you haven't played any dan course recently!**");

                var valid = validation(dan, mods, acc, rank);
                if (valid === 0) return message.channel.send("❎ **| I'm sorry, the dan course you've played didn't fulfill the requirement for dan role!**");

                var danrole = dancheck(dan);
                if (!danrole) return message.channel.send("❎ **| I'm sorry, I cannot find the dan role!**");

                var role = message.guild.roles.find(r => r.name === danrole);
                message.member.addRole(role.id, "Successfully completed dan course").then(() => {
                    message.channel.send(`✅ **| ${message.author}, congratulations! You have completed ${danrole}.**`)
                }).catch(() => message.channel.send(`❎ **| I'm sorry, you already have ${danrole} role!**`));

                // Dan Course Master
                var danlist = ["1st Dan", "2nd Dan", "3rd Dan", "4th Dan", "5th Dan", "6th Dan", "7th Dan", "8th Dan", "9th Dan", "Chuuden", "Kaiden"];
                var count = 0;
                danlist.forEach(role => {
                    if (message.member.roles.find(r => r.name === role)) count++
                });
                if (count == danlist.length) {
                    var dcmrole = message.guild.roles.find(r => r.name === "Dan Course Master");
                    if (!dcmrole) return message.channel.send("❎ **| I'm sorry, I cannot find the Dan Course Master role!**");
                    message.member.addRole(dcmrole.id, "Successfully completed required dan courses").then(() => {
                        message.channel.send(`✅ **| ${message.author}, congratulations! You have completed every dan required to get the Dan Course Master role!**`)
                    }).catch(e => console.log(e))
                }
            })
        });
        req.end()
    })
};

module.exports.help = {
    name: "dancourse"
};