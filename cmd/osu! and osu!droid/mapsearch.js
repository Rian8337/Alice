const osudroid = require('osu-droid');
const Discord = require('discord.js');
const request = require('request');
const config = require('../../config.json');
const cd = new Set();

function timeString(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

async function createEmbed(content, page, footer, index, color) {
    const beatmaps = content.beatmaps;
    const resultCount = content.result_count;
    const embed = new Discord.MessageEmbed()
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(beatmaps.length / 2)}`, footer[index])
        .setDescription("**Beatmaps Found**: " + resultCount.toLocaleString())
        .setColor(color);

    let convertIndex = 2 * (page - 1);
    let convertCount = 0;

    for await (const b of beatmaps) {
        if (!beatmaps[convertIndex] || convertCount === 2) {
            break;
        }
        if (!(beatmaps[convertIndex] instanceof osudroid.MapInfo)) {
            const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmaps[convertIndex].beatmap_id, file: false});
            if (mapinfo.title) {
                beatmaps[convertIndex] = mapinfo;
            }
        }
        ++convertCount;
        ++convertIndex;
    }

    for (let i = 2 * (page - 1); i < 2 + 2 * (page - 1); ++i) {
        if (!beatmaps[i]) {
            break;
        }
        const beatmap = beatmaps[i];

        if (beatmap instanceof osudroid.MapInfo) {
            const title = `${i+1}. ${beatmap.showStatistics("", 0)} (${beatmap.totalDifficulty.toFixed(2)}★)`;
            const description = `[Beatmap Page](https://osu.ppy.sh/b/${beatmap.beatmapID})\n${beatmap.showStatistics("", 1)}\n${beatmap.showStatistics("", 2)}\n${beatmap.showStatistics("", 3)}\n${beatmap.showStatistics("", 4)}\n${beatmap.showStatistics("", 5)}`;
            embed.addField(title, description);
        } else {
            const dateEntries = beatmap.date.replace("T", " ").split(" ");
            const dateEntry = dateEntries[0].split("-");
            const timeEntry = dateEntries[1].split(":");

            const year = parseInt(dateEntry[0]);
            const month = parseInt(dateEntry[1]) - 1;
            const date = parseInt(dateEntry[2]);

            const hour = parseInt(timeEntry[0]);
            const minute = parseInt(timeEntry[1]);
            const second = parseInt(timeEntry[2]);

            const finalDate = new Date(Date.UTC(year, month, date, hour, minute, second));

            const title = `${i+1}. ${beatmap.artist} - ${beatmap.title} (${beatmap.mapper}) [${beatmap.difficulty_name}] (${beatmap.difficulty.toFixed(2)}★)`;
            const description = `
                **Download**: [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/${beatmap.beatmapset}.osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=${beatmap.beatmapset})
                **CS**: ${beatmap.difficulty_cs} - **AR**: ${beatmap.difficulty_ar} - **OD**: ${beatmap.difficulty_od} - **HP**: ${beatmap.difficulty_hp}
                **BPM**: ${beatmap.bpm} - **Length**: ${timeString(beatmap.play_length)}/${timeString(beatmap.total_length)}
                **Last Update**: ${finalDate.toUTCString()} | **Unavailable in osu! map listing**
                ❤️ **${beatmap.favorites.toLocaleString()}** - ▶️ **${beatmap.play_count.toLocaleString()}**
            `;

            embed.addField(title, description);
        }
    }

    return embed;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }
    if (!args[0]) {
        return message.channel.send("❎ **| Hey, please enter a search query!**");
    }
    let url = `https://osusearch.com/query/?modes=Standard&`;
    
    for (let i = 0; i < args.length; ++i) {
        const arg = args[i];
        if (!arg.includes("=")) {
            continue;
        }
        const length = arg.split("=", 1)[0].length + 1;

        // title
        if (arg.startsWith("title=")) {
            url += `title=${arg.substring(length).replace("%20", " ")}&`;
            continue;
        }

        // artist
        if (arg.startsWith("artist=")) {
            url += `artist=${arg.substring(length).replace("%20", " ")}&`;
            continue;
        }

        // source
        if (arg.startsWith("source=")) {
            url += `source=${arg.substring(length).replace("%20", " ")}&`;
            continue;
        }

        // creator (mapper)
        if (arg.startsWith("creator=")) {
            url += `mapper=${arg.substring(length).replace("%20", " ")}&`;
            continue;
        }

        // difficulty name
        if (arg.startsWith("diffname=")) {
            url += `diff_name=${arg.substring(length).replace("%20", " ")}&`;
            continue;
        }

        // genre
        if (arg.startsWith("genre=")) {
            const tempArgs = arg.substring(length).split(",");
            let genreQuery = '';
            for (const tempArg of tempArgs) {
                if (tempArg.trim().toLowerCase() === "any") {
                    genreQuery = "Any";
                    break;
                }
                switch (tempArg.trim().toLowerCase()) {
                    case "anime":
                        genreQuery += "Anime";
                        break;
                    case "videogame":
                        genreQuery += "Video Game";
                        break;
                    case "novelty":
                        genreQuery += "Novelty";
                        break;
                    case "electronic":
                        genreQuery += "Electronic";
                        break;
                    case "pop":
                        genreQuery += "Pop";
                        break;
                    case "rock":
                        genreQuery += "Rock";
                        break;
                    case "hiphop":
                        genreQuery += "Hip Hop";
                        break;
                    case "other":
                        genreQuery += "Other";
                        break;
                    case "any": 
                        genreQuery += "Any";
                        break;
                    default:
                        return message.channel.send(`❎ **| I'm sorry, \`${tempArg}\` is not a valid genre! Accepted genres are \`Anime\`, \`VideoGame\`, \`Novelty\`, \`Electronic\`, \`Pop\`, \`Rock\`, \`HipHop\`, \`Other\`, and \`Any\` (all are case insensitive).**`);
                }
                genreQuery += ",";
            }
            url += `genres=${genreQuery}&`;
            continue;
        }

        // language
        if (arg.startsWith("language=")) {
            const tempArgs = arg.substring(length).split(",");
            let languageQuery = '';
            for (const tempArg of tempArgs) {
                if (tempArg.trim().toLowerCase() === "any") {
                    languageQuery = "Any";
                    break;
                }
                switch (tempArg.trim().toLowerCase()) {
                    case "jp":
                        languageQuery += "Japanese";
                        break;
                    case "ins":
                        languageQuery += "Instrumental";
                        break;
                    case "eng":
                        languageQuery += "English";
                        break;
                    case "kr":
                        languageQuery += "Korean";
                        break;
                    case "cn":
                        languageQuery += "Chinese";
                        break;
                    case "de":
                        languageQuery += "German";
                        break;
                    case "es":
                        languageQuery += "Spanish";
                        break;
                    case "it":
                        languageQuery += "Italian";
                        break;
                    case "fr":
                        languageQuery += "French";
                        break;
                    case "other":
                        languageQuery += "Other";
                        break;
                    case "any":
                        languageQuery += "Any";
                        break;
                    default:
                        return message.channel.send(`❎ **| I'm sorry, \`${tempArg}\` is not a valid language query! Accepted language queries are \`JP\` (Japanese), \`Ins\` (Instrumental), \`ENG\` (English), \`KR\` (Korean), \`CN\` (Chinese), \`DE\` (German), \`SP\` (Spanish), \`IT\` (Italian), \`FR\` (French), \`Other\`, and \`Any\` (all are case insensitive).**`);
                }
                languageQuery += ",";
            }
            url += `languages=${languageQuery}&`;
            continue;
        }

        // ranked status
        if (arg.startsWith("status=")) {
            const tempArgs = arg.substring(length).split(",");
            let rankStatusQuery = '';
            for (const tempArg of tempArgs) {
                switch (tempArg.trim().toLowerCase()) {
                    case "r":
                        rankStatusQuery += "Ranked";
                        break;
                    case "q":
                        rankStatusQuery += "Qualified";
                        break;
                    case "l":
                        rankStatusQuery += "Loved";
                        break;
                    case "u":
                        rankStatusQuery += "Unranked";
                        break;
                    default:
                        return message.channel.send(`❎ **| I'm sorry, \`${tempArg}\` is not a valid ranked status query! Accepted ranked status queries are \`R\` (Ranked), \`Q\` (Qualified), \`L\` (Loved), and \`U\` (Unranked) (all are case insensitive).**`);
                }
            }
            url += `statuses=${rankStatusQuery}&`;
            continue;
        }

        // start date
        if (arg.startsWith("startdate=")) {
            const dateEntry = arg.substring(length).split("-").map(e => parseInt(e));
            if (dateEntry.length !== 3) {
                return message.channel.send("❎ **| I'm sorry, your start date query is invalid! Query format is `YYYY-MM-DD`.**");
            }

            const year = Math.max(2007, dateEntry[0]);
            if (isNaN(year) || year === Infinity) {
                return message.channel.send(`❎ **| I'm sorry, your start date year (${dateEntry[0]}) is invalid!**`);
            }

            const month = Math.max(1, Math.min(12, dateEntry[1]));
            if (isNaN(month)) {
                return message.channel.send(`❎ **| I'm sorry, your start date month (${dateEntry[1]}) is invalid!**`);
            }

            const date = Math.max(1, Math.min(31, dateEntry[2]));
            if (isNaN(date)) {
                return message.channel.send(`❎ **| I'm sorry, your start date date (${dateEntry[2]}) is invalid!**`);
            }

            const d = Date.UTC(year, month - 1, date);
            if (d < Date.now()) {
                return message.channel.send("❎ **| Hey, are you in the future? We haven't even reached the specified date yet!**");
            }

            url += `date_start=${year}-${month}-${date}&`;
            continue;
        }

        // end date
        if (arg.startsWith("enddate=")) {
            const dateEntry = arg.substring(length).split("-").map(e => parseInt(e));
            if (dateEntry.length !== 3) {
                return message.channel.send("❎ **| I'm sorry, your end date query is invalid! Query format is `YYYY-MM-DD`.**");
            }

            const year = Math.max(2007, dateEntry[0]);
            if (isNaN(year) || year === Infinity) {
                return message.channel.send(`❎ **| I'm sorry, your end date year (${dateEntry[0]}) is invalid!**`);
            }

            const month = Math.max(1, Math.min(12, dateEntry[1]));
            if (isNaN(month)) {
                return message.channel.send(`❎ **| I'm sorry, your end date month (${dateEntry[1]}) is invalid!**`);
            }

            const date = Math.max(1, Math.min(31, dateEntry[2]));
            if (isNaN(date)) {
                return message.channel.send(`❎ **| I'm sorry, your end date date (${dateEntry[2]}) is invalid!**`);
            }

            url += `date_end=${year}-${month}-${date}&`;
            continue;
        }

        // minimum length
        if (arg.startsWith("minlength=")) {
            const minLength = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(minLength) || minLength === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum length query is invalid! Please enter length in seconds!**");
            }

            url += `min_length=${minLength}&`;
            continue;
        }

        // maximum length
        if (arg.startsWith("maxlength=")) {
            const maxLength = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(maxLength) || maxLength === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum length query is invalid! Please enter length in seconds!**");
            }

            url += `max_length=${maxLength}&`;
            continue;
        }

        // minimum BPM
        if (arg.startsWith("minbpm=")) {
            const minBpm = Math.max(0, parseFloat(parseFloat(arg.substring(length)).toFixed(2)));
            if (isNaN(minBpm) || minBpm === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum BPM query is invalid!**");
            }

            url += `min_bpm=${minBpm}&`;
            continue;
        }

        // maximum BPM
        if (arg.startsWith("maxbpm=")) {
            const maxBpm = Math.max(0, parseFloat(parseFloat(arg.substring(length)).toFixed(2)));
            if (isNaN(maxBpm) || maxBpm === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum BPM query is invalid!**");
            }

            url += `max_bpm=${maxBpm}&`;
            continue;
        }

        // minimum favorite count
        if (arg.startsWith("minfav=")) {
            const minFav = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(minFav) || minFav === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum favorite count query is invalid!**");
            }

            url += `min_favorites=${minFav}&`;
            continue;
        }

        // maximum favorite count
        if (arg.startsWith("maxfav=")) {
            const maxFav = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(maxFav) || maxFav === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum favorite count query is invalid!**");
            }

            url += `max_favorites=${maxFav}&`;
            continue;
        }

        // minimum play count
        if (arg.startsWith("minpc=")) {
            const minPc = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(minPc) || minPc === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum play count query is invalid!**");
            }

            url += `min_play_count=${minPc}&`;
            continue;
        }

        // maximum play count
        if (arg.startsWith("maxpc=")) {
            const maxPc = Math.max(0, parseInt(arg.substring(length)));
            if (isNaN(maxPc) || maxPc === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum play count query is invalid!**");
            }

            url += `max_play_count=${maxPc}&`;
            continue;
        }

        // star rating
        if (arg.startsWith("sr=")) {
            const diffEntry = arg.substring(length).split("-").map(e => Math.max(0, parseFloat(parseFloat(e).toFixed(2))));
            if (diffEntry.length !== 2) {
                return message.channel.send("❎ **| I'm sorry, your star rating range query is invalid! Query format is `min_SR-max_SR`.**");
            }

            const minDiff = diffEntry[0];
            if (isNaN(minDiff) || minDiff === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum star rating query is invalid!**");
            }
            
            const maxDiff = diffEntry[1];
            if (isNaN(maxDiff) || maxDiff === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum star rating query is invalid!**");
            }

            if (minDiff > maxDiff) {
                return message.channel.send("❎ **| I'm sorry, your star rating range query is invalid (minimum star rating is more than maximum star rating)!**");
            }

            url += `star=(${minDiff},${maxDiff})&`;
            continue;
        }

        // AR (approach rate)
        if (arg.startsWith("ar=")) {
            const arEntry = arg.substring(length).split("-").map(e => Math.max(0, parseFloat(parseFloat(e).toFixed(2))));
            if (arEntry.length !== 2) {
                return message.channel.send("❎ **| I'm sorry, your AR range query is invalid! Query format is `min_AR-max_AR`.**");
            }

            const minAR = arEntry[0];
            if (isNaN(minAR) || minAR === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum AR query is invalid!**");
            }
            
            const maxAR = arEntry[1];
            if (isNaN(maxAR) || maxAR === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum AR query is invalid!**");
            }

            if (minAR > maxAR) {
                return message.channel.send("❎ **| I'm sorry, your AR range query is invalid (minimum AR is more than maximum AR)!**");
            }

            url += `ar=(${minAR},${maxAR})&`;
            continue;
        }

        // OD (overall difficulty)
        if (arg.startsWith("od=")) {
            const odEntry = arg.substring(length).split("-").map(e => Math.max(0, parseFloat(parseFloat(e).toFixed(2))));
            if (odEntry.length !== 2) {
                return message.channel.send("❎ **| I'm sorry, your OD range query is invalid! Query format is `min_OD-max_OD`.**");
            }

            const minOD = odEntry[0];
            if (isNaN(minOD) || minOD === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum OD query is invalid!**");
            }
            
            const maxOD = odEntry[1];
            if (isNaN(maxOD) || maxOD === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum OD query is invalid!**");
            }

            if (minOD > maxOD) {
                return message.channel.send("❎ **| I'm sorry, your AR range query is invalid (minimum OD is more than maximum OD)!**");
            }

            url += `od=(${minOD},${maxOD})&`;
            continue;
        }

        // HP (health drain)
        if (arg.startsWith("hp=")) {
            const hpEntry = arg.substring(length).split("-").map(e => Math.max(0, parseFloat(parseFloat(e).toFixed(2))));
            if (hpEntry.length !== 2) {
                return message.channel.send("❎ **| I'm sorry, your HP range query is invalid! Query format is `min_HP-max_HP`.**");
            }

            const minHP = hpEntry[0];
            if (isNaN(minHP) || minHP === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum HP query is invalid!**");
            }
            
            const maxHP = hpEntry[1];
            if (isNaN(maxHP) || maxHP === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum HP query is invalid!**");
            }

            if (minHP > maxHP) {
                return message.channel.send("❎ **| I'm sorry, your HP range query is invalid (minimum HP is more than maximum HP)!**");
            }

            url += `hp=(${minHP},${maxHP})&`;
            continue;
        }

        // CS (approach rate)
        if (arg.startsWith("cs=")) {
            const csEntry = arg.substring(length).split("-").map(e => Math.max(0, parseFloat(parseFloat(e).toFixed(2))));
            if (csEntry.length !== 2) {
                return message.channel.send("❎ **| I'm sorry, your CS range query is invalid! Query format is `min_CS-max_CS`.**");
            }

            const minCS = csEntry[0];
            if (isNaN(minCS) || minCS === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your minimum CS query is invalid!**");
            }
            
            const maxCS = csEntry[1];
            if (isNaN(maxCS) || maxCS === Infinity) {
                return message.channel.send("❎ **| I'm sorry, your maximum CS query is invalid!**");
            }

            if (minCS > maxCS) {
                return message.channel.send("❎ **| I'm sorry, your CS range query is invalid (minimum CS is more than maximum CS)!**");
            }

            url += `cs=(${minCS},${maxCS})&`;
            continue;
        }

        // sort order
        if (arg.startsWith("order=")) {
            let sort = arg.substring(length).trim().toLowerCase();
            url += `query_order=`
            if (sort.startsWith("-")) {
                url += "-";
                sort = sort.substring(1);
            }
            switch (sort) {
                case "date":
                    url += "date&";
                    break;
                case "sr":
                    url += "difficulty";
                    break;
                case "favorite":
                    url += "favorites";
                    break;
                case "pc":
                    url += "play_count";
                    break;
                case "ar":
                    url += "difficulty_ar";
                    break;
                case "od":
                    url += "difficulty_od";
                    break;
                case "cs":
                    url += "difficulty_cs";
                    break;
                case "hp":
                    url += "difficulty_hp";
                    break;
                case "ar":
                    url += "difficulty_ar";
                    break;
                case "bpm":
                    url += "bpm";
                    break;
                default:
                    return message.channel.send(`❎ **| I'm sorry, \`${sort}\` is not a valid order query! Accepted order queries are \`date\`, \`sr\` (star rating), \`favorite\`, \`pc\` (play count), \`ar\`, \`od\`, \`cs\`, \`hp\`, and \`bpm\` (all are case insensitive).**`);
            }
            url += "&";
        }
    }

    url = encodeURI(url);

    request(url, {}, async (err, response, data) => {
        if (err || response.statusCode !== 200) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!search. Please try again later!**");
        }
        let content;
        try {
            content = JSON.parse(data);
        } catch (e) {
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!search. Please try again later!**");
        }

        const resultCount = content.beatmaps.length;
        if (resultCount === 0) {
            return message.channel.send("❎ **| I'm sorry, your search does not return any result!**");
        }
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 15000);
        url = url.replace("query", "search");

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const color = message.member.roles.color ? message.member.roles.color.hexColor : "#000000";
        let page = 1;
        let embed = await createEmbed(content, page, footer, index, color);
        embed.setAuthor(`Beatmap search result for ${message.author.username} (click to view search result in osu!search)`, message.author.avatarURL({dynamic: true}), url);

        const max_page = Math.ceil(content.beatmaps.length / 2);
        message.channel.send({embed: embed}).then(msg => {
            msg.react("⏮️").then(() => {
				msg.react("⬅️").then(() => {
					msg.react("➡️").then(() => {
						msg.react("⏭️").catch(console.error);
					});
				});
            });
            
            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
			let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
			let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});
            
            backward.on('collect', async () => {
				if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 1;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = await createEmbed(content, page, footer, index, color);
                embed.setAuthor(`Beatmap search result for ${message.author.username} (click to view search result in osu!search)`, message.author.avatarURL({dynamic: true}), url);
				msg.edit({embed: embed}).catch(console.error);
			});

			back.on('collect', async () => {
				if (page === 1) page = max_page;
				else page--;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = await createEmbed(content, page, footer, index, color);
                embed.setAuthor(`Beatmap search result for ${message.author.username} (click to view search result in osu!search)`, message.author.avatarURL({dynamic: true}), url);
				msg.edit({embed: embed}).catch(console.error);
			});

			next.on('collect', async () => {
				if (page === max_page) page = 1;
				else page++;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = await createEmbed(content, page, footer, index, color);
                embed.setAuthor(`Beatmap search result for ${message.author.username} (click to view search result in osu!search)`, message.author.avatarURL({dynamic: true}), url);
				msg.edit({embed: embed}).catch(console.error);
			});

			forward.on('collect', async () => {
				if (page === max_page) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = max_page;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = await createEmbed(content, page, footer, index, color);
                embed.setAuthor(`Beatmap search result for ${message.author.username} (click to view search result in osu!search)`, message.author.avatarURL({dynamic: true}), url);
				msg.edit({embed: embed}).catch(console.error);
			});

			backward.on("end", () => {
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
            });
        });
    });
};

module.exports.config = {
    name: "mapsearch",
    description: "Searches for beatmaps.\n\nIn artist, title, creator, difficulty name, or source parameter, replace spaces with `%20` and separate multiple genres, languages, and ranking status with commas.",
    usage: "mapsearch [artist=<artist> title=<title> creator=<creator> diffname=<diff name> genre=<genre> language=<language> status=<status> startdate=<start date> enddate=<end date> minbpm=<min bpm> maxbpm=<max bpm> minlength=<min length> maxlength=<max length> maxfav=<max fav> minpc=<min pc> maxpc=<max pc> sr=<min sr>-<max sr> ar=<min ar>-<max ar> od=<min od>-<max od> hp=<min hp>-<max hp> cs=<min cs>-<max cs> order=<order>]",
    detail: "`artist`: Song artist [String]\n`creator`: Beatmap creator [String]\n`diff name`: Difficulty name [String]\n`genre`: Song genre. Accepted: \`Anime\`, \`VideoGame\`, \`Novelty\`, \`Electronic\`, \`Pop\`, \`Rock\`, \`HipHop\`, \`Other\`, and \`Any\` (case insensitive) [String]\n`language`: Language to search. Accepted: \`JP\`, \`Ins\` (Instrumental), \`ENG\`, \`KR\`, \`CN\`, \`DE\`, \`ES\`, \`IT\`, \`FR\`, \`Other\`, and \`Any\` (case insensitive) [String]\n`max/min ar`: Maximum/minimum AR [Float]\n`max/min bpm`: Maximum/minimum BPM [Float]\n`max/min cs`: Maximum/minimum CS [Float]\n`max/min fav`: Maximum/minimum favorite count [Integer]\n`max/min hp`: Maximum/minimum HP [Float]\n`max/min length`: Maximum/minimum map length in seconds [Integer]\n`max/min od`: Maximum/minimum OD [Float]\n`max/min pc`: Maximum/minimum play count [Integer]\n`max/min sr`: Maximum/minimum star rating [Float]\n`order`: Order to sort search result. Put `-` in front of argument for ascending sort, such as `-date`. Accepted: \`date\`, \`sr\` (star rating), \`favorite\`, \`pc\` (play count), \`ar\`, \`od\`, \`cs\`, \`hp\`, and \`bpm\` (case-insensitive) [String]\n`end/start date`: Maximum/minimum date in `YYYY-MM-DD` format [String]\n`status`: Ranking status to search. Accepted: \`R\` (Ranked), \`Q\` (Qualified), \`L\` (Loved), and \`U\` (Unranked) [String]\n`title`: Song title [String]",
    permission: "None"
};