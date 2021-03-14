const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    }
    if (!message.isOwner && !message.member.roles.cache.has('551662273962180611')) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const whitelistDb = maindb.collection("mapwhitelist");
    
    const link = args[0];
    if (!link) {
        return message.channel.send("❎ **| Hey, please enter the beatmapset link or ID to whitelist!**");
    }

    const a = link.split("/");
    const beatmapsetID = parseInt(a[a.length - 1]);

    const apiRequestBuilder = new osudroid.OsuAPIRequestBuilder()
        .setEndpoint("get_beatmaps")
        .addParameter("s", beatmapsetID);

    const result = await apiRequestBuilder.sendRequest();
    if (result.statusCode !== 200) {
        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API now. Please try again later!**");
    }

    const data = JSON.parse(result.data.toString("utf-8"));
    if (data.length === 0) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the beatmapset that you have specified!**");
    }

    const osuBeatmaps = data.filter(v => parseInt(v.mode) === 0 && parseInt(v.approved) === osudroid.rankedStatus.GRAVEYARD && parseInt(mapinfo.difficultyrating) > 0);
    if (osuBeatmaps.length === 0) {
        return message.channel.send("❎ **| I'm sorry, the beatmapset that you have sent doesn't have a valid osu!standard gamemode beatmap that is graveyarded!**");
    }
    
    const mapinfos = [];
    osuBeatmaps.forEach(d => {
        mapinfos.push(new osudroid.MapInfo().fillMetadata(d));
    });

    const firstMapinfo = mapinfos[0];
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setThumbnail(`https://b.ppy.sh/thumb/${firstMapinfo.beatmapsetID}.jpg`)
        .setColor(firstMapinfo.statusColor())
        .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
        .setTitle(firstMapinfo.showStatistics("", 0))
        .setDescription(firstMapinfo.showStatistics("", 1))
        .setURL(`https://osu.ppy.sh/b/${firstMapinfo.beatmapID}`)
        .addField(firstMapinfo.showStatistics("", 2), firstMapinfo.showStatistics("", 3))
        .addField(firstMapinfo.showStatistics("", 4), `Star Rating:\n${mapinfos.map(v => {return `- ${v.version} - **${v.totalDifficulty.toFixed(2)}**\n`;})}`);

    message.channel.send(embed).catch(console.error);
    client.channels.cache.get("638671295470370827").send(embed).catch(console.error);

    for await (const mapinfo of mapinfos) {
        const updateQuery = {
            $set: {
                hashid: mapinfo.hash,
                mapname: mapinfo.fullTitle,
                diffstat: {
                    cs: mapinfo.cs,
                    ar: mapinfo.ar,
                    od: mapinfo.od,
                    hp: mapinfo.hp,
                    sr: parseFloat(mapinfo.totalDifficulty.toFixed(2))
                }
            }
        };

        await whitelistDb.deleteOne({mapid: mapinfo.beatmapID});
        await message.channel.send(`✅ **| Successfully unwhitelisted \`${mapinfo.fullTitle}\`.**`);
        client.channels.cache.get("638671295470370827").send(`✅ **| Successfully unwhitelisted \`${mapinfo.fullTitle}\`.**`).catch(console.error);
    }
};

module.exports.config = {
    name: "unwhitelistset",
    description: "Unwhitelists a beatmap set.",
    usage: "unwhitelistset <map set link/map set ID>",
    detail: "`map set link/map set ID`: The beatmap set link or ID to unwhitelist [String]",
    permission: "pp-project Map Validator"
};