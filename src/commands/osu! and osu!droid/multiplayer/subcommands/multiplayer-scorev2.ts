import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
            interaction.channelId
        );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomDoesntExistInChannel")
            ),
        });
    }

    if (!room.settings.beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapPicked")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        room.settings.beatmap.id
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const misses: number = interaction.options.getInteger("misses", true);

    const scorePortionScoreV2: number =
        ScoreHelper.calculateScorePortionScoreV2(
            interaction.options.getInteger("score", true),
            misses,
            beatmap.map!.maxDroidScore(
                new MapStats({
                    mods: ModUtil.pcStringToMods(room.settings.requiredMods),
                })
            ),
            interaction.options.getBoolean("hiddenpenalty")
                ? ModUtil.pcStringToMods("HDDT")
                : [],
            room.settings.scorePortion
        );

    const accuracyPortionScoreV2: number =
        ScoreHelper.calculateAccuracyPortionScoreV2(
            interaction.options.getNumber("accuracy", true),
            misses,
            1 - room.settings.scorePortion
        );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("scorev2Value"),
            (scorePortionScoreV2 + accuracyPortionScoreV2).toLocaleString(
                BCP47
            ),
            scorePortionScoreV2.toLocaleString(BCP47),
            accuracyPortionScoreV2.toLocaleString(BCP47)
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
