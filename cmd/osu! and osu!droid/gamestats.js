const Discord = require('discord.js');
const { DroidAPIRequestBuilder } = require('osu-droid');
const { avatar_list } = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
module.exports.run = async (client, message) => {
    const apiRequestBuilder = new DroidAPIRequestBuilder()
        .setEndpoint("usergeneral.php");

    const result = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return message.channel.send("❎ **| I'm sorry, I cannot retrieve game statistics!**");
    }

    const data = result.data.toString("utf-8").split("<br>");
    
    const totalUserCount = parseInt(data[1]);
    const userCountAbove5Scores = parseInt(data[3]);
    const userCountAbove20Scores = parseInt(data[5]);
    const userCountAbove100Scores = parseInt(data[7]);
    const userCountAbove200Scores = parseInt(data[9]);
    const totalScoreCount = parseInt(data[11]);

    const index = Math.floor(Math.random() * avatar_list.length);
    const embed = new Discord.MessageEmbed()
        .setColor(message.member?.roles.color?.hexColor || "#000000")
        .setFooter("Alice Synthesis Thirty", avatar_list[index])
        .setAuthor("Overall Game Statistics")
        .addField("Registered accounts", `Total: **${totalUserCount.toLocaleString()}**\nMore than 5 scores: **${userCountAbove5Scores.toLocaleString()}**\nMore than 20 scores: **${userCountAbove20Scores.toLocaleString()}**\nMore than 100 scores: **${userCountAbove100Scores.toLocaleString()}**\nMore than 200 scores: **${userCountAbove200Scores.toLocaleString()}**`)
        .addField("Total online scores", totalScoreCount.toLocaleString());

    message.channel.send({embed: embed});
};

module.exports.config = {
    name: "gamestats",
    description: "See osu!droid's overall statistics!",
    usage: "gamestats",
    detail: "None",
	permission: "None"
};