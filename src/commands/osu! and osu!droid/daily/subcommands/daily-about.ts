import { Constants } from "@alice-core/Constants";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildEmoji, GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember> interaction.member).displayColor }
    );

    const coin: GuildEmoji = client.emojis.resolve(Constants.aliceCoinEmote)!;

    embed.setTitle("osu!droid Daily/Weekly Challenges")
        .setThumbnail("https://image.frl/p/beyefgeq5m7tobjg.jpg")
        .setDescription(`This is a system that provides daily and weekly challenges for you to complete. Gain points and ${coin}Alice coins as you complete challenges!`)
        .addField("How does it work?", `Every day, there will be a new daily challenge to complete. Each challenges grant a different amount of points depending on how hard the challenge is. You can get points and ${coin}Alice coins by passing the challenge. There will be a few bonuses that allows you to gain more points and ${coin}Alice coins, too! Each challenge bonus level converts to 2 challenge points, which also converts to ${coin}\`4\` Alice coins.\n\nThe weekly bounty challenge, which is only available once per week, grants more points and ${coin}Alice coins as this challenge is considerably harder than any daily challenges. That's also why you have a week to complete it, too!`)
        .addField("How can I submit challenges?", `There will be a separate beatmap set for you to download in case you have played the original map. In fact, you **must** download the set in order to submit your play.\n\nOnce you complete a challenge, use the \`a!daily\` command to submit your play for daily challenges or \`a!daily bounty\` for weekly challenges. You can also specify the bonus type you want to submit for daily challenges. For more information, use \`a!help daily\`.`)
        .addField("How can I use my points and Alice coins?", `As of now, there is no use for points and ${coin}Alice coins. Originally, ${coin}Alice coins were made for another upcoming project, so stay tuned for that.`)
        .addField("Is there a leaderboard for points and Alice coins?", `There is no leaderboard for ${coin}Alice coins, however there is a leaderboard for points. You can use \`a!daily lb\` to view the leaderboard. For more information, use \`a!help daily\`.`)
        .addField("I have more questions that are not mentioned in here!", "You can ask <@386742340968120321> for more information about daily and weekly challenges.");

    interaction.editReply({
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};