import { Constants } from "@alice-core/Constants";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js";
import { MapInfo } from "osu-droid";
import { whitelistStrings } from "../whitelistStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            WhitelistManager.whitelistRole
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    const beatmapLink: string = interaction.options.getString("beatmap", true);

    if (!beatmapLink) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                whitelistStrings.noBeatmapProvided
            ),
        });
    }

    const beatmapID: number = BeatmapManager.getBeatmapID(beatmapLink)[0];
    let beatmapsetID: number = BeatmapManager.getBeatmapsetID(beatmapLink)[0];

    if (!beatmapID && !beatmapsetID) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                whitelistStrings.noBeatmapIDorSetIDFound
            ),
        });
    }

    // It is possible for the user to use beatmap ID and it gets interpreted as beatmapset ID
    // This check will cover that use case
    if (beatmapID === beatmapsetID) {
        // Prioritize beatmap ID over beatmapset ID like command usage example
        beatmapsetID = 0;
    }

    // Collect beatmaps first
    const beatmaps: MapInfo[] = [];

    if (beatmapsetID) {
        beatmaps.push(
            ...(await BeatmapManager.getBeatmaps(beatmapsetID, false))
        );
    } else {
        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            beatmapID,
            false
        );

        if (beatmapInfo) {
            beatmaps.push(beatmapInfo);
        }
    }

    if (beatmaps.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                whitelistStrings.noBeatmapsFound
            ),
        });
    }

    const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(
        beatmaps[0]
    );

    const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

    embed
        .spliceFields(0, embed.fields.length)
        .addField(
            beatmaps[0].showStatistics(4),
            `Star Rating:\n${beatmaps
                .map(
                    (v) =>
                        `- [${v.version}](https://osu.ppy.sh/b/${
                            v.beatmapID
                        }) - **${v.totalDifficulty.toFixed(2)}**`
                )
                .join("\n")}`
        );

    const whitelistResponseStrings: string[] = [];

    for await (const beatmap of beatmaps) {
        const unwhitelistResult: OperationResult =
            await WhitelistManager.unwhitelist(beatmap);

        if (!unwhitelistResult.success) {
            whitelistResponseStrings.push(
                MessageCreator.createReject(
                    whitelistStrings.unwhitelistFailed,
                    beatmap.fullTitle,
                    unwhitelistResult.reason!
                )
            );
            continue;
        }

        whitelistResponseStrings.push(
            MessageCreator.createAccept(
                whitelistStrings.unwhitelistSuccess,
                beatmap.fullTitle
            )
        );
    }

    interaction.editReply({
        content: whitelistResponseStrings.join("\n"),
        ...embedOptions,
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
