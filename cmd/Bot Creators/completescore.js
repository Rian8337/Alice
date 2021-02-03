const Discord = require('discord.js');
const { Db } = require('mongodb');
const osudroid = require('osu-droid');

/**
 * Calculates the level of a given score.
 * 
 * @param {number} score The score to calculate.
 * @returns {number} The level of the given score.
 */
function calculateLevel(score) {
    function scoreRequirement(level) {
        return Math.round(
            level <= 100 ? 
            (5000 / 3 * (4 * Math.pow(level, 3) - 3 * Math.pow(level, 2) - level) + 1.25 * Math.pow(1.8, level - 60)) / 1.128 :
            23875169174 + 15000000000 * (level - 100)
        );
    }

    let level = 1;
    while (scoreRequirement(level + 1) <= score) {
        ++level;
    }
    const nextLevelReq = scoreRequirement(level + 1) - scoreRequirement(level);
    const curLevelReq = score - scoreRequirement(level);
    level += curLevelReq / nextLevelReq;
    return level;
}
/**
 * @param {number} uid 
 * @param {number} page 
 */
function retrievePlays(uid, page) {
    return new Promise(async resolve => {
        console.log("Current page: " + page);

        const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
            .setEndpoint("scoresearchv2.php")
            .addParameter("uid", uid)
            .addParameter("page", page);

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            console.log("Empty response from osu!droid API");
            return resolve([]);
        }
        const entries = [];
        const lines = result.data.toString("utf-8").split('<br>');
        lines.shift();
        for (const line of lines) {
            entries.push(new osudroid.Score().fillInformation(line));
        }
        resolve(entries);
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    if (!args[0]) {
        return message.channel.send("❎ **| Hey, I don't know who to recalculate!**");
    }
    const ufind = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
    let page = 0;

    const binddb = maindb.collection("userbind");
    let query = {discordid: ufind};

    binddb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!userres) {
            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = userres.uid;
        const username = userres.username;
        const discordid = userres.discordid;

        const scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }

            await scoredb.deleteOne({uid});
            await scoredb.insertOne({
                uid,
                username,
                score: 0,
                playc: 0,
                scorelist: []
            });

            let totalScore = 0;
            while (true) {
                const entries = await retrievePlays(uid, page);
                ++page;
                if (entries.length === 0) {
                    break;
                }
                
                let score = 0;
                const scoreEntries = [];
                for await (const entry of entries) {
                    const mapinfo = await osudroid.MapInfo.getInformation({hash: entry.hash, file: false});
                    if (mapinfo.error) {
                        continue;
                    }
                    if (!mapinfo.title) {
                        continue;
                    }
                    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                        continue;
                    }
                    totalScore += entry.score;
                    score += entry.score;
                    scoreEntries.push([entry.score, entry.hash]);
                }

                await scoredb.updateOne({uid}, {
                    $inc: {
                        score,
                        playc: scoreEntries.length
                    },
                    $addToSet: {
                        scorelist: {
                            $each: scoreEntries
                        }
                    }
                });
            }

            const level = calculateLevel(totalScore);
            console.log(totalScore.toLocaleString());
            message.channel.send(`✅ **| ${message.author}, recalculated <@${discordid}>'s plays: ${totalScore.toLocaleString()} (level ${Math.floor(level)}).**`);
        });
    });
};

module.exports.config = {
    name: "completescore",
    description: "Recalculates all plays of an account.",
    usage: "completescore <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Bot Creators"
};