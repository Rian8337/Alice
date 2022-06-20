import { Constants } from "@alice-core/Constants";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { GuildMember, MessageEmbed, MessageOptions } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { WhitelistLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project and Ranked Score Project/whitelist/WhitelistLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            WhitelistManager.whitelistRole
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.noPermissionReject
                )
            ),
        });
    }

    const beatmapLink: string = interaction.options.getString("beatmap", true);

    if (!beatmapLink) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided")
            ),
        });
    }

    const beatmapID: number = BeatmapManager.getBeatmapID(beatmapLink)[0];
    let beatmapsetID: number = BeatmapManager.getBeatmapsetID(beatmapLink)[0];

    if (!beatmapID && !beatmapsetID) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapIDorSetIDFound")
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
    await InteractionHelper.deferReply(interaction);

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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapsFound")
            ),
        });
    }

    const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(
        beatmaps[0],
        undefined,
        localization.language
    );

    const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

    embed
        .spliceFields(0, embed.fields.length)
        .addField(
            beatmaps[0].showStatistics(6),
            `${localization.getTranslation("starRating")}:\n${beatmaps
                .map(
                    (v) =>
                        `- [${v.version}](https://osu.ppy.sh/b/${
                            v.beatmapID
                        }) - **${v.totalDifficulty.toFixed(2)}**`
                )
                .join("\n")}`
        );

    const whitelistResponseStrings: string[] = [];

    for (const beatmap of beatmaps) {
        const unwhitelistResult: OperationResult =
            await WhitelistManager.unwhitelist(beatmap, localization.language);

        if (!unwhitelistResult.success) {
            whitelistResponseStrings.push(
                MessageCreator.createReject(
                    localization.getTranslation("unwhitelistFailed"),
                    beatmap.fullTitle,
                    unwhitelistResult.reason!
                )
            );
            continue;
        }

        whitelistResponseStrings.push(
            MessageCreator.createAccept(
                localization.getTranslation("unwhitelistSuccess"),
                beatmap.fullTitle
            )
        );
    }

    InteractionHelper.reply(interaction, {
        content: whitelistResponseStrings.join("\n"),
        ...embedOptions,
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["SPECIAL"],
};
