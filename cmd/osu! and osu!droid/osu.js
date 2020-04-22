const Discord = require('discord.js');
const https = require('https');
const apikey = process.env.OSU_API_KEY;
const config = require('../../config.json');

function progress(level) {
    let final = (parseFloat(level) - Math.floor(parseFloat(level))) * 100;
    return final.toFixed(2)
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    let playerdb = alicedb.collection("osubind");
	
	const ssh = client.emojis.cache.get("611559473479155713");
    const ss = client.emojis.cache.get("611559473492000769");
    const sh = client.emojis.cache.get("611559473361846274");
    const s = client.emojis.cache.get("611559473294606336");
    const a = client.emojis.cache.get("611559473236148265");
	
    let query = {discordid: message.author.id};
    playerdb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        let username;
        if (args[0] === 'set') {
            username = args.slice(1).join(" ");
            if (!username) return message.channel.send("❎ **| Hey, I don't know what account to bind!**");
            if (!res) {
                let insertVal = {
                    discordid: message.author.id,
                    username: username
                };
                playerdb.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("osu! profile updated for " + message.author.id);
                    message.channel.send("✅ **| Your osu! profile has been set to " + username + ".**")
                })
            } else {
                let updateVal = {
                    $set: {
                        discordid: message.author.id,
                        username: username
                    }
                };
                playerdb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("osu! profile updated for " + message.author.id);
                    message.channel.send("✅ **| Your osu! profile has been set to " + username + ".**")
                })
            }
        }
        else {
            if (res) username = res.username;
			if (args[0]) username = args[0];
			if (!username) return message.channel.send("❎ **| I'm sorry, your account is not binded! Please bind using `a!osu set <username>` first.**");

			let mode = args[1] ? args[1] : args[0];
			switch (mode) {
				case 'std':
					mode = 0;
					break;
				case 'taiko':
					mode = 1;
					break;
				case 'ctb':
					mode = 2;
					break;
				case 'mania':
					mode = 3;
					break;
				default:
					mode = 0
			}

			let options = new URL("https://osu.ppy.sh/api/get_user?k=" + apikey + "&u=" + username + "&m=" + mode);
			let content = '';

			https.get(options, res => {
				res.setEncoding("utf8");
				res.on("data", chunk => {
					content += chunk
				});
				res.on("error", err => {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
				});
				res.on("end", () => {
					let obj;
					try {
						obj = JSON.parse(content)
					} catch (e) {
						return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
					}
					if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the username!**");
					let playerinfo = obj[0];

					let string = '';
					string += `**Rank**: #${parseInt(playerinfo.pp_rank).toLocaleString()} (${playerinfo.country}#${parseInt(playerinfo.pp_country_rank).toLocaleString()})\n`;
					string += `**Total Score**: ${parseInt(playerinfo.total_score).toLocaleString()}\n`;
					string += `**Ranked Score**: ${parseInt(playerinfo.ranked_score).toLocaleString()}\n`;
					string += `**Level**: ${Math.floor(parseFloat(playerinfo.level))} (${progress(playerinfo.level)}%)\n`;
					string += `**PP**: ${parseFloat(playerinfo.pp_raw).toLocaleString()}\n`;
					string += `**Play Count**: ${parseInt(playerinfo.playcount).toLocaleString()}\n`;
					string += `**Join Date**: ${playerinfo.join_date} UTC\n\n`;
					string += `**${ssh} ${parseInt(playerinfo.count_rank_ssh).toLocaleString()}** | **${ss} ${parseInt(playerinfo.count_rank_ss).toLocaleString()}** | **${sh} ${parseInt(playerinfo.count_rank_sh).toLocaleString()}** | **${s} ${parseInt(playerinfo.count_rank_s).toLocaleString()}** | **${a} ${parseInt(playerinfo.count_rank_a).toLocaleString()}**`;

					let rolecheck;
					try {
						rolecheck = message.member.roles.highest.hexColor
					} catch (e) {
						rolecheck = "#000000"
					}
					let footer = config.avatar_list;
					const index = Math.floor(Math.random() * footer.length);
					let embed = new Discord.MessageEmbed()
						.setThumbnail("https://a.ppy.sh/" + playerinfo.user_id)
						.setColor(rolecheck)
						.setFooter("Alice Synthesis Thirty", footer[index])
						.setDescription(string);

					switch (mode) {
						case 0: embed.setAuthor("osu!standard Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id); break;
						case 1: embed.setAuthor("Taiko Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id); break;
						case 2: embed.setAuthor("Catch the Beat Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id); break;
						case 3: embed.setAuthor("osu!mania Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id)
					}

					message.channel.send({embed: embed}).catch(console.error)
				})
			}).end()
        }
    })
};

module.exports.config = {
    name: "osu",
    description: "Retrieves an osu! account profile.",
    usage: "osu [mode] [user]\nosu set <username>",
    detail: "`mode`: Gamemode. Accepted arguments are `std`, `taiko`, `ctb`, `mania`\n`user`: The user to retrieve information from [UserResolvable (mention or user ID) or String]\n`username`: The username to bind [String]",
    permission: "None"
};
