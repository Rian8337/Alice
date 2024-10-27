import { DatabaseManager } from "@database/DatabaseManager";
import { Challenge } from "@database/utils/aliceDb/Challenge";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { MapInfo } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true),
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound"),
            ),
        });
    }

    if (!challenge.isScheduled) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeIsOngoing"),
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true),
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided"),
            ),
        });
    }

    const beatmap: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapId,
        { checkFile: false },
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    if (challenge.beatmapid !== beatmapId) {
        await InteractionHelper.deferReply(interaction);

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.updateOne(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        beatmapid: beatmap.beatmapId,
                        hash: "",
                    },
                },
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("modifyBeatmapFailed"),
                    result.reason!,
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("modifyBeatmapSuccess"),
            challenge.challengeid,
            beatmap.fullTitle,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
