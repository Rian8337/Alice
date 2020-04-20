const Discord = require('discord.js');
const config = require('../../config.json');

function editEmbed(res, page, rolecheck, footer, index) {
    const embed = new Discord.MessageEmbed()
        .setTitle(`Name History for uid ${res.uid}`)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(res.previous_usernames.length / 10)}`, footer[index])
        .setColor(rolecheck);
    
    let string = `**Current username:** ${res.current_username}\n\n__**Name History**__\n`;
    
    let prev_names = res.previous_usernames;
    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); i++) {
        if (!prev_names[i]) break;
        string += `**${i+1}.** ${prev_names[i]}\n`
    }
    
    embed.setDescription(string);
    return embed
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    const uid = parseInt(args[0]);
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, please enter a valid uid!**");

    const namedb = alicedb.collection("namechange");
    namedb.findOne({uid: uid.toString()}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, this uid doesn't have any name history!**");

        let rolecheck;
        try {
            rolecheck = message.member.roles.highest.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        
        let page = 1;
        let embed = editEmbed(res, page, rolecheck, footer, index);

        message.channel.send({embed: embed}).then(msg => {
            if (Math.ceil(res.previous_usernames.length / 10) === page) return;
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(console.error)
                    })
                })
            });

            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

            backward.on('collect', () => {
                if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                page = Math.max(1, page - 10);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                embed = editEmbed(res, page, rolecheck, footer, index);
                msg.edit({embed: embed}).catch(console.error)
            });

            back.on('collect', () => {
                if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                --page;
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                embed = editEmbed(res, page, rolecheck, footer, index);
                msg.edit({embed: embed}).catch(console.error)
            });

            next.on('collect', () => {
                if (page === Math.ceil(res.previous_usernames.length / 10)) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                ++page;
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                embed = editEmbed(res, page, rolecheck, footer, index);
                msg.edit({embed: embed}).catch(console.error);
            });

            forward.on('collect', () => {
                if (page === Math.ceil(res.previous_usernames.length / 10)) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                page = Math.min(page + 10, Math.ceil(res.previous_usernames.length / 10));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                embed = editEmbed(res, page, rolecheck, footer, index);
                msg.edit({embed: embed}).catch(console.error)
            });

            backward.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
            })
        })
    })
};

module.exports.config = {
    name: "namehistory",
    description: "Checks name history of an osu!droid account.",
    usage: "namehistory <uid>",
    detail: "`uid`: Uid of the osu!droid account [Integer]",
    permission: "None"
};