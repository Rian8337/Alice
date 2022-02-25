import { GuildMember, MessageEmbed } from "discord.js";
import { DroidAPIRequestBuilder, RequestResponse } from "@rian8337/osu-base";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GamestatsLocalization } from "@alice-localization/commands/osu! and osu!droid/GamestatsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: GamestatsLocalization = new GamestatsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const apiRequestBuilder: DroidAPIRequestBuilder =
        new DroidAPIRequestBuilder().setEndpoint("usergeneral.php");

    const result: RequestResponse = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("cannotRetrieveGameStatistics")
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
        .setTitle(localization.getTranslation("overallGameStats"))
        .addField(
            localization.getTranslation("registeredAccounts"),
            `**${localization.getTranslation(
                "totalRegisteredAccounts"
            )}**: ${totalUserCount.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )}\n` +
                `**${localization.getTranslation(
                    "moreThan5ScoresAcc"
                )}**: ${userCountAbove5Scores.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n` +
                `**${localization.getTranslation(
                    "moreThan20ScoresAcc"
                )}**: ${userCountAbove20Scores.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n` +
                `**${localization.getTranslation(
                    "moreThan100ScoresAcc"
                )}**: ${userCountAbove100Scores.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n` +
                `**${localization.getTranslation(
                    "moreThan200ScoresAcc"
                )}**: ${userCountAbove200Scores.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}`
        )
        .addField(
            localization.getTranslation("totalScores"),
            totalScoreCount.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        );

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
