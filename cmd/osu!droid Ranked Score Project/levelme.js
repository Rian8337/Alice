const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function levelBar(levelprogress) {
    let barcount = 15;
    let progress = Math.floor(parseFloat(levelprogress.toFixed(2)) / (100 / barcount));
    return "🟢".repeat(Math.min(5, progress)) + "🟡".repeat(Math.min(5, Math.max(0, progress - 5))) + "🔴".repeat(Math.min(5, Math.max(0, progress - 10))) + "⚪".repeat(barcount - progress);
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    let ufind = message.author.id;
    if (args[0]) {
        ufind = args[0];
        ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "");
    }
    let binddb = maindb.collection("userbind");
    let scoredb = alicedb.collection("playerscore");
    let query = {discordid: ufind};
    binddb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!userres) {
			if (args[0]) {
                message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**")
            } else {
                message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
            }
			return;
		}
        const uid = userres.uid;
        const username = userres.username;

        query = {uid: uid};
        scoredb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            const score = res?.score ?? 0;
            const level = res?.level ?? 1;
            const playc = res?.playc ?? 0;
            const levelremain = (level - Math.floor(level)) * 100;
            const player = await osudroid.Player.getInformation({uid: uid});
            if (player.error) {
                if (args[0]) {
                    message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
                } else {
                    message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                }
                return;
            }
            if (!player.username) {
                return message.channel.send("❎ **| I'm sorry, I cannot find the user info!**");
            }
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const embed = new Discord.MessageEmbed()
                .setColor(message.member?.roles.color?.hexColor || "#000000")
                .setThumbnail(player.avatarURL)
                .setAuthor(`Level profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}.html`)
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setDescription(`**Total Ranked Score:** ${score.toLocaleString()}\n**Play Count:** ${playc}\n**Level:** ${Math.floor(level)} (${levelremain.toFixed(2)}%)\n\n**Level Progress**\n${levelBar(levelremain)}`);

            message.channel.send(embed).catch(console.error);
        });
    });
};

module.exports.config = {
    name: "levelme",
    description: "Views a user's ranked score profile.",
    usage: "levelme [user]",
    detail: "`user`: The user to view [UserResolvable (mention or user ID)]",
    permission: "None"
};