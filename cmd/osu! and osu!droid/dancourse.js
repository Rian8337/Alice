const Discord = require('discord.js');
const config  = require('../../config.json');
const osudroid = require('osu-droid');

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission but used for this command, practically the same
    eligibleRoleList.forEach((id) => {
        if (member.roles.cache.has(id[0])) res = id[1]
    });
    return res
}

function rejectionMessage(id) {
    switch (id) {
        case 1: return "NF/EZ/HT mod used";
        case 2: return "Rank achieved is not S or accuracy achieved is less than 97% with A rank";
        case 3: return "Accuracy achieved is less than 93%";
        case 4: return "Accuracy achieved is less than 90%";
        case 5: return "Rank achieved is not A or S";
        default: return "Unknown"
    }
}

function danCheck(hash) {
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
        default: return undefined
    }
}

function validation(dan, mod, acc, rank) {
    let res = 0;
    if (mod.includes("NF") || mod.includes("EZ") || mod.includes("HT")) {
        res = 1;
        return res
    }
    if (dan >= 1 && dan <= 9 && (acc < 97 && !rank.includes("S"))) res = 2; // 1st-9th Dan
    if (dan === 10 && acc < 93) res = 3; // Chuuden
    if (dan === 11 && acc < 90) res = 4;// Kaiden
    if (dan === 12 && (!rank.includes("A") && !rank.includes("S"))) res = 5; // Aleph-0 Dan
    return res
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let danchannel = message.guild.channels.cache.get('361785436982476800');
    if (!danchannel || message.channel.id != '361785436982476800') return message.channel.send("❎ **| I'm sorry, this command is only supported in dan course channel in droid International Discord server.**");
    let objcount = {x: 0};
    let danlist = ["1st Dan", "2nd Dan", "3rd Dan", "4th Dan", "5th Dan", "6th Dan", "7th Dan", "8th Dan", "9th Dan", "Chuuden", "Kaiden", "Aleph-0 Dan"];
    let channel = message.guild.channels.cache.get("316545691545501706");

    if (args[0] == 'about') {
        if (!channel) return message.channel.send("❎ **| I'm sorry, this command is only executable in droid (International) Discord server!**");
        let footer = config.avatar_list;
        let helper = message.guild.roles.cache.get("369108742077284353");
        let mod = message.guild.roles.cache.get("595667274707370024");
        const index = Math.floor(Math.random() * footer.length);
        let rolecheck;
        try {
            rolecheck = message.member.roles.highest.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }
        let embed = new Discord.MessageEmbed()
            .setTitle("droid Daninintei Courses")
            .setThumbnail("https://cdn.discordapp.com/attachments/430939277720027136/623153414414532609/BG.png")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(rolecheck)
            .setDescription("__osu!droid Daninintei Courses__ is a course system to measure your skill level. Receive roles and gain scores (yes) as you progress through each course!\n\nThere are **" + danlist.length + "** available courses: **" + danlist.join(", ") + "**.")
            .addField("Requirements", "1. You **must be logged in to the server** when you do courses.\n2. You **cannot** use HT, EZ, NF, and any unranked mods.\n3. For 1st Dan to 9th Dan, **you must achieve S rank regardless of accuracy *or* A rank with at least 97% accuracy.**\n4. For Chuuden, **you must achieve at least 93% accuracy.**\n5. For Kaiden, **you must achieve at least 90% accuracy.**\n6. For Aleph-0 Dan, **you must achieve A or S rank.**")
            .addField("Submission", `After you have completed a course, simply type \`a!dancourse\` in ${!danchannel?"#dan-courses":danchannel} to get the role *if your score was recent and it was submitted to the server*. Otherwise, tag ${!mod?"@Moderator":mod} or ${!helper?"@Helper":helper}.`)
            .addField("Course Download", `You can download courses in pinned messages of ${!danchannel?"#dan-courses":danchannel}.`)
            .addField("FAQ", "**Q: Is this necessary?**\nA: No, you can ignore this if you want to.\n\n**Q: Can I skip lower courses?**\nA: Yes, you don't have to do them in order.\n\n**Q: Is there a list of maps for each course?**\nA: Yes, click/tap [here](https://docs.google.com/spreadsheets/d/1oGu7Y9T8q_V6Sd-gYJKgu0_h-emcCqAZM0pp2ghGA_E/edit?usp=sharing).\n\n**Q: I have questions that are not answered in this FAQ!**\nA: You can ask a Helper or Moderator for help.");

        message.channel.send({embed: embed}).catch(console.error)
    }
    else {
        if (args[0]) {
            let perm = isEligible(message.member);
            if (!perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this. Please ask a Helper or Moderator!**");

            let togive = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
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
            let role = message.guild.roles.cache.find((r) => r.name === rolename);
            if (!role) return message.channel.send(`❎ **| I'm sorry, I cannot find ${rolename} role!**`);
            if (togive.roles.cache.has(role.id)) return message.channel.send(`❎ **| I'm sorry, the user already has ${rolename} role!**`);

            togive.roles.add(role.id, "Successfully completed dan course").then (() => {
                message.channel.send(`✅ **| ${message.author}, successfully given ${rolename} role for <@${togive.id}>. Congratulations for <@${togive.id}>!**`);
                if (danlist.slice(7, danlist.length).includes(rolename)) channel.send(`**<@${togive.id}> has just completed ${rolename}. Congratulations to <@${togive.id}>!**`)
            }).catch(console.error);

            // Dan Course Master
            danlist.pop();
            let count = 1;
            danlist.forEach(role => {
                if (togive.roles.cache.find((r) => r.name === role)) count++
            });
            if (count == danlist.length) {
                let dcmrole = message.guild.roles.cache.find((r) => r.name === "Dan Course Master");
                if (!dcmrole) return message.channel.send("❎ **| I'm sorry, I cannot find the Dan Course Master role!**");
                if (!togive.roles.cache.has(dcmrole.id)) togive.roles.add(dcmrole.id, "Successfully completed required dan courses").then(() => {
                    message.channel.send(`✅ **| <@${togive.id}>, congratulations! You have completed every dan required to get the Dan Course Master role!**`);
                    channel.send(`**<@${togive.id}> has just achieved Dan Course Master. Congratulations to <@${togive.id}>!**`)
                }).catch(console.error);
            }
        }
        else {
            let binddb = maindb.collection("userbind");
            let query = {discordid: message.author.id};
            binddb.find(query).toArray(async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = res[0].uid;
                const player = await new osudroid.PlayerInfo().get({uid: uid});
                if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                let play = player.recent_plays;
                let danentries = [];
                for (let i = 0; i < 5; i++) {
                    if (!play[i]) break;
                    let dan = danCheck(play[i].hash);
                    if (dan) {
                        let mods = play[i].mods;
                        let acc = play[i].accuracy;
                        let rank = play[i].rank;
                        let danentry = {
                            dan: dan[0],
                            play: dan[1],
                            mod: mods,
                            acc: acc,
                            rank: rank
                        };
                        danentries.push(danentry)
                    }
                }
                if (danentries.length == 0) return message.channel.send("❎ **| I'm sorry, you haven't set any dan course play recently!**");

                danentries.forEach(x => {
                    objcount.x++;
                    let valid = validation(x.dan, x.mod, x.acc, x.rank);
                    if (valid != 0) return message.channel.send(`❎ **| I'm sorry, the dan course you've played didn't fulfill the requirement for dan role!\n\nCourse played: ${x.play} (${x.rank}, ${osudroid.mods.droid_to_PC(x.mod)}, ${x.acc}%)\nReason: ${rejectionMessage(valid)}**`);
                    let danrole = x.play;
                    let role = message.guild.roles.cache.find((r) => r.name === danrole);
                    if (!role) return message.channel.send(`❎ **| I'm sorry, I cannot find ${danrole} role!**`);
                    if (!message.member.roles.cache.has(role.id)) message.member.roles.add(role.id, "Successfully completed dan course").then(() => {
                        message.channel.send(`✅ **| ${message.author}, congratulations! You have completed ${danrole}.**`);
                        if (x.dan > 7) channel.send(`**${message.author} has just completed ${danrole}. Congratulations to ${message.author}!**`)
                    }).catch(console.error);

                    // Dan Course Master
                    if (objcount.x == danentries.length) {
                        danlist.pop();
                        let count = 1;
                        danlist.forEach(role => {
                            if (message.member.roles.cache.find((r) => r.name === role)) count++
                        });
                        if (count == danlist.length) {
                            let dcmrole = message.guild.roles.cache.find((r) => r.name === "Dan Course Master");
                            if (!dcmrole) return message.channel.send("❎ **| I'm sorry, I cannot find the Dan Course Master role!**");
                            if (!message.member.roles.cache.has(dcmrole.id)) message.member.roles.add(dcmrole.id, "Successfully completed required dan courses").then(() => {
                                message.channel.send(`✅ **| ${message.author}, congratulations! You have completed every dan required to get the Dan Course Master role!**`);
                                channel.send(`**${message.author} has just achieved Dan Course Master. Congratulations to ${message.author}!**`)
                            }).catch(console.error)
                        }
                    }
                })
            })
        }
    }
};

module.exports.config = {
    name: "dancourse",
    description: "Dan course command for international server.",
    usage: "dancourse\ndancourse about\ndancourse [user] [role] (Helper+)",
    detail: "`user`: The user to give the role to [UserResolvable (mention or user ID)]\n`role`: Dan role to give. Accepted arguments are `1st Dan`, `2nd Dan`, `3rd Dan`, `4th Dan`, `5th Dan`, `6th Dan`, `7th Dan`, `8th Dan`, `9th Dan`, `Chuuden`, `Kaiden`, `Aleph-0 Dan`",
    permission: "None | Helper"
};