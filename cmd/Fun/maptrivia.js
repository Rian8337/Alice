const Discord = require('discord.js');
const request = require('request');
const { MapInfo } = require('osu-droid');
const cd = new Set();

/**
 * @param {number} dateLimit 
 * @param {number} level
 */
function retrieveBeatmaps(dateLimit, level, cb) {
    const finalDate = new Date(dateLimit + Math.floor(Math.random() * (new Date().getTime() - dateLimit)));

    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${process.env.OSU_API_KEY}&since=${finalDate.getUTCFullYear()}-${(finalDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${finalDate.getUTCDate().toString().padStart(2, "0")}&m=0`;
    console.log(url);
    request(url, (err, response, data) => {
        if (err || response.statusCode !== 200) {
            return cb([]);
        }

        const apiResponse = JSON.parse(data);
        if (apiResponse.length === 0) {
            return cb([]);
        }

        /**
         * @type {MapInfo[]}
         */
        const mapList = [];
        apiResponse.forEach(r => {
            const metadata = new MapInfo();
            metadata.fillMetadata(r);
            if (!mapList.find(map => map.beatmapsetID === metadata.beatmapsetID)) {
                mapList.push(metadata);
            }
        });
        cb(mapList.filter(v => v.plays <= 1000000 - 60000 * level || v.favorites <= 3000 - 185 * level).sort((a, b) => {
            // bracketing for readability
            return (a.artist.length + a.title.length) - (b.artist.length + b.title.length);
        }));
    });
}

function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":");
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
module.exports.run = async (client, message) => {
    if (cd.has(message.channel.id)) {
        return message.channel.send("❎ **| Hey, there is an ongoing map trivia in this channel! Please play that one instead!**");
    }

    cd.add(message.channel.id);
    const dateBase = 1199145600000; // January 1st, 2008 0:00 UTC

    /**
     * @type {MapInfo[]}
     */
    const mapCache = [];
    let attempt = 0;

    let level = 1;
    const leaderboard = [];
    const lives = [];

    retrieveBeatmaps(dateBase, level, function createCollector(maps = []) {
        if (attempt === 5 && mapCache.length === 0) {
            return message.channel.send("❎ **| I'm sorry, I'm unable to retrieve a beatmap!**");
        }

        if (maps.length === 0 && mapCache.length === 0) {
            ++attempt;
            return retrieveBeatmaps(dateBase, level, createCollector);
        }
        
        attempt = 0;
        if (mapCache.length === 0) {
            mapCache.push(...maps);
        }
    
        const beatmap = mapCache.shift();

        const tempArtist = beatmap.artist.replace(/\W|_/g, "");
        const tempTitle = beatmap.title.replace(/\W|_/g, "");

        // shuffle between 25-75% of title and artist
        let artistBlankAmount = Math.max(Math.ceil(tempArtist.length / 4), Math.floor(Math.min(level * tempArtist.length / 20, tempArtist.length * 3 / 4)));
        let titleBlankAmount = Math.max(Math.ceil(tempTitle.length / 4), Math.floor(Math.min(level * tempTitle.length / 20, tempTitle.length * 3 / 4)));

        const regex = /^[a-zA-Z0-9]+$/;
        const shuffledArtist = beatmap.artist.split("");
        const shuffledTitle = beatmap.title.split("");

        while (artistBlankAmount-- > 0) {
            const index = Math.floor(Math.random() * beatmap.artist.length);
            const char = shuffledArtist[index];
            if (!regex.test(char) || char.includes("`-`")) {
                ++artistBlankAmount;
                continue;
            }
    
            let replacementString = "`-`";
            if (index > 0 && shuffledArtist[index - 1].includes("`-`")) {
                replacementString = " " + replacementString;
            }
    
            if (index < beatmap.artist.length - 1 && shuffledArtist[index + 1].includes("`-`")) {
                replacementString += " ";
            }
    
            shuffledArtist[index] = replacementString;
        }
    
        while (titleBlankAmount-- > 0) {
            const index = Math.floor(Math.random() * beatmap.title.length);
            const char = shuffledTitle[index];
            if (!regex.test(char) || char.includes("`-`")) {
                ++titleBlankAmount;
                continue;
            }
    
            let replacementString = "`-`";
            if (index > 0 && shuffledTitle[index - 1].includes("`-`")) {
                replacementString = " " + replacementString;
            }
    
            if (index < beatmap.title.length - 1 && shuffledTitle[index + 1].includes("`-`")) {
                replacementString += " ";
            }
    
            shuffledTitle[index] = replacementString;
        }

        let guessedArtist = shuffledArtist.join("");
        let guessedTitle = shuffledTitle.join("");
    
        let embed = new Discord.MessageEmbed()
            .setAuthor("Beatmap Hint")
            .setTitle(`Level ${level}`)
            .setDescription(`**Artist:** ${guessedArtist}\n**Title**: ${guessedTitle}\n**Mapper**: ${beatmap.creator}${beatmap.source ? `\n**Source**: ${beatmap.source}` : ""}`)
            .setColor("#fccf03")
            .setThumbnail(`https://b.ppy.sh/thumb/${beatmap.beatmapsetID}l.jpg`)
            .setImage(`https://assets.ppy.sh/beatmaps/${beatmap.beatmapsetID}/covers/cover.jpg`);

        // for 10 letters, give 1 minute
        const time = Math.ceil(Math.max(shuffledArtist.length, shuffledTitle.length) / 10) * 60000;

        message.channel.send(`❗**| Guess this beatmap! You have ${time / 1000} seconds!**`, {embed: embed}).then(msg => {
            let currentMessage = msg;
            const collector = message.channel.createMessageCollector(m => m.content.toLowerCase().startsWith("g:") || m.content.toLowerCase().startsWith("guess:"), {time: time});
            const correctList = [];
            const guessedChars = [];
            collector.on("collect", async m => {
                const live = lives.find(l => l.id === m.author.id);
                if (live && live.amount === 0) {
                    return message.channel.send(`❎ **| ${m.author}, you are not permitted to guess for this round anymore!**`);
                }

                let guessedChar = m.content.substring(m.content.indexOf(":") + 1);
                if (!guessedChar) {
                    return;
                }

                guessedChar = guessedChar.trim().toLowerCase();
                if (guessedChar.length > 1) {
                    return;
                }

                if (guessedChars.find(s => s === guessedChar)) {
                    return message.channel.send(`❎ **| ${m.author}, that character has been guessed by someone else!**`);
                }
                guessedChars.push(guessedChar);

                let isFound = false;
                if (beatmap.artist.toLowerCase().includes(guessedChar)) {
                    for (let i = 0; i < beatmap.artist.length; ++i) {
                        const char = beatmap.artist.charAt(i);
                        if (char.toLowerCase() === guessedChar) {
                            isFound = true;
                            shuffledArtist[i] = char;
                        }
                    }
                }

                if (beatmap.title.toLowerCase().includes(guessedChar)) {
                    for (let i = 0; i < beatmap.title.length; ++i) {
                        const char = beatmap.title.charAt(i);
                        if (char.toLowerCase() === guessedChar) {
                            isFound = true;
                            shuffledTitle[i] = char;
                        }
                    }
                }

                if (isFound) {
                    message.channel.send(`✅ **| ${m.author}, you have guessed a correct character!**`);
                    const index = correctList.findIndex(v => v.id === m.author.id);

                    shuffledArtist.forEach((s, i) => {
                        if (!s.includes("`-`")) {
                            return;
                        }

                        if (i > 0 && !shuffledArtist[i - 1].includes("`-`")) {
                            s = s.trimLeft();
                        }

                        if (i < shuffledArtist.length - 1 && !shuffledArtist[i + 1].includes("`-`")) {
                            s = s.trimRight();
                        }
                    });
                    
                    shuffledTitle.forEach((s, i) => {
                        if (!s.includes("`-`")) {
                            return;
                        }

                        if (i > 0 && !shuffledTitle[i - 1].includes("`-`")) {
                            s = s.trimLeft();
                        }

                        if (i < shuffledTitle.length - 1 && !shuffledTitle[i + 1].includes("`-`")) {
                            s = s.trimRight();
                        }
                    });

                    const score = level / 10;
                    if (index !== -1) {
                        correctList[index].score += score;
                    } else {
                        correctList.push({
                            id: m.author.id,
                            score: score
                        });
                    }

                    guessedArtist = shuffledArtist.join("");
                    guessedTitle = shuffledTitle.join("");
                    currentMessage.delete();

                    if (guessedArtist === beatmap.artist && guessedTitle === beatmap.title) {
                        ++level;
                        return collector.stop();
                    }

                    embed = new Discord.MessageEmbed()
                        .setAuthor("Beatmap Hint")
                        .setDescription(`**Artist:** ${guessedArtist}\n**Title**: ${guessedTitle}\n**Mapper**: ${beatmap.creator}${beatmap.source ? `\n**Source**: ${beatmap.source}` : ""}`)
                        .setColor("#fccf03")
                        .setThumbnail(`https://b.ppy.sh/thumb/${beatmap.beatmapsetID}l.jpg`)
                        .setImage(`https://assets.ppy.sh/beatmaps/${beatmap.beatmapsetID}/covers/cover.jpg`);
                    
                    currentMessage = await message.channel.send(`❗**| Guess this beatmap! You have ${((msg.createdTimestamp + time - Date.now()) / 1000).toFixed(2)} seconds!**`, {embed: embed});
                } else {
                    let livesAmount = 9;
                    const liveIndex = lives.findIndex(l => l.id === m.author.id);
                    if (liveIndex !== -1) {
                        livesAmount = --lives[liveIndex].amount;
                    } else {
                        lives.push({
                            id: m.author.id,
                            amount: livesAmount
                        });
                    }
                    message.channel.send(`❎ **| ${m.author}, you have guessed an incorrect character! You have ${livesAmount} live(s) left.**`);
                }
            });

            collector.on("end", () => {
                embed = new Discord.MessageEmbed()
                    .setAuthor("Beatmap Information", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
                    .setTitle(`${beatmap.artist} - ${beatmap.title} by ${beatmap.creator}`)
                    .setURL(`https://osu.ppy.sh/s/${beatmap.beatmapsetID}`)
                    .setDescription(`${beatmap.showStatistics("", 1)}\n${beatmap.showStatistics("", 4)}`)
                    .setColor(beatmap.statusColor())
                    .setThumbnail(`https://b.ppy.sh/thumb/${beatmap.beatmapsetID}l.jpg`);

                if (guessedArtist !== beatmap.artist || guessedTitle !== beatmap.title) {
                    message.channel.send("❗**| No one guessed the beatmap! Here is the beatmap's information.**", {embed: embed});

                    leaderboard.sort((a, b) => {return b.score - a.score;});
                    let leaderboardString = "";
                    for (let i = 0; i < 10; ++i) {
                        if (!leaderboard[i]) {
                            break;
                        }
                        leaderboardString += `**#${i+1}**: <@${leaderboard[i].id}>: ${leaderboard[i].score.toFixed(2)}\n`;
                    }

                    embed = new Discord.MessageEmbed()
                        .setAuthor("Game Information")
                        .setColor("#037ffc")
                        .setDescription(`**Starter**: ${message.author}\n**Time started**: ${message.createdAt.toUTCString()}\n**Duration**: ${timeConvert(Math.floor((Date.now() - message.createdTimestamp) / 1000))}\n**Level**: ${level}`);

                    if (leaderboardString) {
                        embed.addField("Leaderboard", leaderboardString);
                    }

                    cd.delete(message.channel.id);
                    return message.channel.send("✅ **| Game ended!**", {embed: embed});
                }
                
                for (const correct of correctList) {
                    const index = leaderboard.findIndex(a => a.id === correct.id);
                    if (index === -1) {
                        leaderboard.push({
                            id: correct.id,
                            score: correct.score
                        });
                    } else {
                        leaderboard[index].score += correct.score;
                    }
                }
                
                message.channel.send(`✅ **| Everyone got the beatmap correct (${(Date.now() - msg.createdTimestamp) / 1000} seconds)!**`, {embed: embed});
                createCollector();
            });
        });
    });
};

module.exports.config = {
    name: "maptrivia",
    description: "Test your beatmap knowledge by taking a beatmap guessing trivia that progressively gets harder!\n\nTo guess a character, write `g:<character>` or `guess:<character>` (both are case insensitive). Note that only alphanumeric (letters and numbers) characters are randomized in this challenge. Don't even bother to guess with symbols!\n\nEvery person has 10 lives to start with.",
    usage: "maptrivia",
    detail: "None",
    permission: "None"
};