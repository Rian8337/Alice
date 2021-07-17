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

    const bindDb = maindb.collection("userbind");
    const whitelistDb = maindb.collection("mapwhitelist");
    
    const link = args[0];
    if (!link) {
        return message.channel.send("❎ **| Hey, please enter the beatmap link or ID to whitelist!**");
    }
    const hash = args[1];

    let query = {};
    // Normal mode
    if (link) {
        const a = link.split("/");
        query = {beatmapID: parseInt(a[a.length - 1])};
    }

    // Override mode (use for fixed maps)
    if (hash) {
        query = {hash};
    }
    query.file = false;

    const mapinfo = await osudroid.MapInfo.getInformation(query);
    if (mapinfo.error || !mapinfo.title || !mapinfo.objects) {
        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API now. Please try again later!**");
    }
    if (mapinfo.approved !== osudroid.rankedStatus.GRAVEYARD) {
        return message.channel.send("❎ **| I'm sorry, this map is not graveyarded!**");
    }

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}.jpg`)
        .setColor(mapinfo.statusColor())
        .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
        .setTitle(mapinfo.showStatistics("", 0))
        .setDescription(mapinfo.showStatistics("", 1))
        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .addField(mapinfo.showStatistics("", 2), mapinfo.showStatistics("", 3))
        .addField(mapinfo.showStatistics("", 4), `Star Rating: ${mapinfo.totalDifficulty}`);

    message.channel.send(embed);
    client.channels.cache.get("638671295470370827").send(embed).catch(console.error);

    await whitelistDb.deleteOne({mapid: mapinfo.beatmapID});

    // Clear beatmap from users' pp entries
    const bindInformations = await bindDb.find({ "pp.hash": mapinfo.hash }).toArray();

    for await (const bindInfo of bindInformations) {
        bindInfo.pp.splice(bindInfo.pp.findIndex(v => v.hash === mapinfo.hash), 1);

        const totalPP = bindInfo.pp.reduce((a, v, i) => a + v.pp * Math.pow(0.95, i), 0);
        await bindDb.updateOne({ discordid: bindInfo.discordid }, { $set: { pp: bindInfo.pp, pptotal: totalPP }, $inc: { playc: -1 } });
    }

    message.channel.send(`✅ **| Successfully unwhitelisted \`${mapinfo.fullTitle}\`.**`);
    client.channels.cache.get("638671295470370827").send(`✅ **| Successfully unwhitelisted \`${mapinfo.fullTitle}\`.**`).catch(console.error);
};

module.exports.config = {
    name: "unwhitelist",
    description: "Unwhitelists a beatmap.",
    usage: "unwhitelist <map link/map ID>",
    detail: "`map link/map ID`: The beatmap link or ID to unwhitelist [String]",
    permission: "pp-project Map Validator"
};