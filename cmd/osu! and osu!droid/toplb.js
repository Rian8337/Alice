const { Client, Message } = require('discord.js');
const osudroid = require('osu-droid');

/**
 * @param {number} page
 * @returns {Promise<string[]>}
 */
function retrieveLeaderboard(page) {
    return new Promise(async resolve => {
        const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
            .setEndpoint("top.php")
            .addParameter("page", page);

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            return resolve([]);
        }

        let data = result.data.toString("utf-8");
        const content = data.split("<br>");
        content.shift();
        resolve(content);
    });
}

/**
 * @param {string} s 
 * @param {number} l 
 */
function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

/**
 * @param {Map<number, string[]>} leaderboardCache 
 * @param {number} page 
 */
function editLeaderboard(leaderboardCache, page) {
    return new Promise(async resolve => {
        let output = "```c\n#     | Username             | UID    | Play Count | Accuracy | Score\n";

        const actualPage = Math.floor((page - 1) / 5);
        const pageRemainder = (page - 1) % 5;
        const cache = leaderboardCache.get(actualPage) ?? await retrieveLeaderboard(actualPage);
        leaderboardCache.set(actualPage, cache);

        for (let i = 20 * pageRemainder; i < Math.min(cache.length, 20 + 20 * pageRemainder); ++i) {
            const c = cache[i].split(" ");
            c.splice(1, 1);
            const accuracy = (parseInt(c[5]) / parseInt(c[4]) / 1000).toFixed(2);
            output += `${spaceFill((actualPage * 100 + i + 1).toString(), 6)} | ${spaceFill(c[1], 21)} | ${spaceFill(c[0], 7)} | ${spaceFill(c[4], 11)} | ${spaceFill(accuracy + "%", 9)} | ${parseInt(c[3]).toLocaleString()}\n`;
        }

        output += `Page: ${page}\`\`\``;
        resolve(output);
    });
}

/**
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
module.exports.run = async (client, message, args) => {
    let page = args[0] ? (Math.max(parseInt(args[0]), 1) || 1) : 1;

    const leaderboardCache = new Map();

    let output = await editLeaderboard(leaderboardCache, page);
    message.channel.send(output).then(msg => {
        msg.react("⏮️").then(() => {
            msg.react("⬅️").then(() => {
                msg.react("➡️").then(() => {
                    msg.react("⏭️").catch(console.error);
                });
            });
        });

        const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 150000});
        const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 150000});
        const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 150000});
        const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 150000});

        backward.on('collect', async () => {
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            if (page === 1) {
                return;
            }
            page = Math.max(1, page - 10);
            output = await editLeaderboard(leaderboardCache, page);
            msg.edit(output).catch(console.error);
        });

        back.on('collect', async () => {
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            if (page !== 1) {
                page--;
            } else {
                return;
            }
            output = await editLeaderboard(leaderboardCache, page);
            msg.edit(output).catch(console.error);
        });

        next.on('collect', async () => {
            page++;
            output = await editLeaderboard(leaderboardCache, page);
            msg.edit(output).catch(console.error);
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
            }
        });

        forward.on('collect', async () => {
            page += 10;
            output = await editLeaderboard(leaderboardCache, page);
            msg.edit(output).catch(console.error);
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
            }
        });

        backward.on("end", () => {
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
            }
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
        });
    });
};

module.exports.config = {
    name: "toplb",
    description: "Retrieves osu!droid's global score leaderboard.",
    usage: "toplb [page]",
    detail: "`page`: The page to view, defaults to 1 [Integer]",
    permission: "None"
};