import { GuildMember, MessageEmbed } from "discord.js";
import { DroidAPIRequestBuilder, RequestResponse } from "@rian8337/osu-base";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { gamestatsStrings } from "./gamestatsStrings";

export const run: Command["run"] = async (_, interaction) => {
    const apiRequestBuilder: DroidAPIRequestBuilder =
        new DroidAPIRequestBuilder().setEndpoint("usergeneral.php");

    const result: RequestResponse = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                gamestatsStrings.cannotRetrieveGameStatistics
            ),
        });
    }

    const data: number[] = result.data
        .toString("utf-8")
        .split("<br>")
        .map((v) => parseInt(v));

    const totalUserCount: number = data[1];
    const userCountAbove5Scores: number = data[3];
    const userCountAbove20Scores: number = data[5];
    const userCountAbove100Scores: number = data[7];
    const userCountAbove200Scores: number = data[9];
    const totalScoreCount: number = data[11];

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayHexColor,
    });

    embed
        .setTitle("Overall Game Statistics")
        .addField(
            "Registered Accounts",
            `**Total**: ${totalUserCount.toLocaleString()}\n` +
                `**More than 5 scores**: ${userCountAbove5Scores.toLocaleString()}\n` +
                `**More than 20 scores**: ${userCountAbove20Scores.toLocaleString()}\n` +
                `**More than 100 scores**: ${userCountAbove100Scores.toLocaleString()}\n` +
                `**More than 200 scores**: ${userCountAbove200Scores.toLocaleString()}`
        )
        .addField("Total Online Scores", totalScoreCount.toLocaleString());

    interaction.editReply({
        embeds: [embed],
    });
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "gamestats",
    description: "See osu!droid's overall statistics.",
    options: [],
    example: [],
    permissions: [],
    scope: "ALL",
};
