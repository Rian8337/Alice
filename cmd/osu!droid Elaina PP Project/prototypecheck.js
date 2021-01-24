const Discord = require("discord.js");
const config = require('../../config.json');
const { Db } = require("mongodb");
const cd = new Set();

function generateEmbed(res, page, footer, index, color) {
    const ppentry = res.pp ?? [];
    const pptotal = res.pptotal ?? 0;
    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(ppentry.length / 5)}`, footer[index])
        .setDescription(`**PP Profile for <@${res.discordid}> (${res.username})**\nTotal PP: **${pptotal.toFixed(2)} pp**\n[PP Profile](https://ppboard.herokuapp.com/profile?uid=${res.uid}) - [Mirror](https://droidppboard.herokuapp.com/profile?uid=${res.uid})\nLast Update: **${new Date(res.lastUpdate).toUTCString()}**`);

    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
		const pp = ppentry[i];
        if (pp) {
			let modstring = pp.mods ? `+${pp.mods}` : "";
			if (pp.forcedAR || (pp.speedMultiplier && pp.speedMultiplier !== 1)) {
				if (pp.mods) {
					modstring += " ";
				}
				modstring += "(";
				if (pp.forcedAR) {
					modstring += `AR${pp.forcedAR}`;
				}
				if (pp.speedMultiplier && pp.speedMultiplier !== 1) {
					if (pp.forcedAR) {
						modstring += ", ";
					}
					modstring += `${pp.speedMultiplier}x`;
				}
				modstring += ")";
			}
            embed.addField(`${i+1}. ${pp.title} ${modstring}`, `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${pp.miss} ❌ | **${pp.prevPP}** ⮕ **${pp.pp}** pp (${(pp.pp - pp.prevPP).toFixed(2)} pp)`);
        } else {
            embed.addField(`${i+1}. -`, "-");
        }
    }
    return embed;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
	if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
	}
	
    let page = 1;
    let uid = 0;
    let query = {discordid: message.author.id};

    if (args[0]) {
		if (parseInt(args[0]) > 0 && parseInt(args[0]) <= 15) {
			page = parseInt(args[0]);
		} else {
			if (args[0].length < 18) {
				uid = parseInt(args[0]);
				if (uid >= 500000) {
					return message.channel.send("❎ **| Hey, that uid is too big!**");
				}
				query = {previous_bind: {$all: [uid.toString()]}};
			} else {
				const ufind = args[0].replace(/[<@!>]/g, "");
				if (ufind.length !== 18) {
					return message.channel.send("❎ **| I'm sorry, your first argument is invalid! Please enter a uid, user, or user ID!**");
				}
				query = {discordid: ufind};
			}
		}
    }
    
    if (args[1]) {
		if (isNaN(args[1]) || parseInt(args[1]) > 15 || parseInt(args[1]) <= 0) {
			page = 1;
		} else {
			page = parseInt(args[1]);
		}
	}

    const ppdb = alicedb.collection("prototypepp");
    ppdb.findOne(query, (err, res) => {
        if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!");
        }
        if (!res) {
			if (args[0]) message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**")
			else message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
			return;
        } 
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const color = message.member?.roles.color?.hexColor || "#000000";

        let embed = generateEmbed(res, page, footer, index, color);
        const max_page = Math.ceil(res.pp.length / 5);
        message.channel.send({embed: embed}).then(msg => {
            msg.react("⏮️").then(() => {
				msg.react("⬅️").then(() => {
					msg.react("➡️").then(() => {
						msg.react("⏭️").catch(console.error);
					});
				});
            });
            
            const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
			const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
			const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});
            
            backward.on('collect', () => {
				if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 1;
				if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				}
				embed = generateEmbed(res, page, footer, index, color);
				msg.edit({embed: embed}).catch(console.error);
			});

			back.on('collect', () => {
				if (page === 1) page = max_page;
				else page--;
				if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				}
				embed = generateEmbed(res, page, footer, index, color);
				msg.edit({embed: embed}).catch(console.error);
			});

			next.on('collect', () => {
				if (page === max_page) page = 1;
				else page++;
				if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				}
				embed = generateEmbed(res, page, footer, index, color);
				msg.edit({embed: embed}).catch(console.error);
			});

			forward.on('collect', () => {
				if (page === max_page) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = max_page;
				if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				}
				embed = generateEmbed(res, page, footer, index, color);
				msg.edit({embed: embed}).catch(console.error);
			});

			backward.on("end", () => {
				if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				}
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
            });
		});
		if (!message.isOwner) {
			cd.add(message.author.id);
			setTimeout(() => {
				cd.delete(message.author.id);
			}, 10000);
		}
    });
};

module.exports.config = {
	name: "prototypecheck",
	description: "Checks a user's prototype droid pp profile.",
	usage: "prototypecheck [page/user/uid] [page]",
	detail: "`page`: Page to check from 1 to 15. If the second argument is specified, the first argument will be treated as `user` or `uid` [Integer]\n`uid`: The uid to check [Integer]\n`user`: The user to check [UserResolvable (mention or user ID)]",
	permission: "None"
};