const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function levelBar(levelprogress) {
    let barcount = 15;
    let progress = Math.floor(parseFloat(levelprogress.toFixed(2)) / (100 / barcount));
    return "🟢".repeat(Math.min(5, progress)) + "🟡".repeat(Math.min(5, Math.max(0, progress - 5))) + "🔴".repeat(Math.max(5, Math.max(0, progress - 10))) + "⚪".repeat(barcount - progress);
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    let uid = args[0];
    if (!uid) return message.channel.send("❎ **| Hey, I don't know what uid to view!**");
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, that uid is invalid!**");
    let binddb = maindb.collection("userbind");
    let scoredb = alicedb.collection("playerscore");
    let query = {uid: uid};
    binddb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        let username = userres.username;

        scoredb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            let score = 0;
            let level = 1;
            let playc = 0;
            if (res) {
                score = res.score;
                level = res.level;
                playc = res.playc
            }
            let levelremain = (level - Math.floor(level)) * 100;
            const player = await osudroid.Player.getInformation(query);
            if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
            if (!player.username) return message.channel.send("❎ **| I'm sorry, I cannot find the user info!**");
            let avalink = player.avatarURL;
            let rolecheck;
            try {
                rolecheck = message.member.roles.color.hexColor;
            } catch (e) {
                rolecheck = "#000000";
            }
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            let embed = new Discord.MessageEmbed()
                .setColor(rolecheck)
                .setThumbnail(avalink)
                .setAuthor(`Level profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}.html`)
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setDescription(`**Total Ranked Score:** ${score.toLocaleString()}\n**Play Count:** ${playc}\n**Level:** ${Math.floor(level)} (${levelremain.toFixed(2)}%)\n\n**Level Progress**\n${levelBar(levelremain)}`);

            message.channel.send({embed: embed}).catch(console.error);
        });
    });
};

module.exports.config = {
    name: "levelid",
    description: "Views a user's ranked score profile based on uid.\nUid must be binded into a Discord account and has previously submitted plays.",
    usage: "levelid <uid>",
    detail: "`user`: The uid to view [Integer]",
    permission: "None"
};