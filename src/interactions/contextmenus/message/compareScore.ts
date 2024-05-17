import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageContextMenuCommand } from "structures/core/MessageContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { CompareScoreLocalization } from "@alice-localization/interactions/contextmenus/message/compareScore/CompareScoreLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Modes } from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { GuildMember, InteractionReplyOptions } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: MessageContextMenuCommand["run"] = async (_, interaction) => {
    const localization = new CompareScoreLocalization(
        CommandHelper.getLocale(interaction),
    );

    const beatmapId = BeatmapManager.getBeatmapIDFromMessage(
        interaction.targetMessage,
    );

    if (!beatmapId) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            },
        );

    if (!bindInfo) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const beatmapInfo = await BeatmapManager.getBeatmap(beatmapId);

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const score = await DroidHelper.getScore(
        player instanceof Player ? player.uid : player.id,
        beatmapInfo.hash,
        [
            "id",
            "score",
            "filename",
            "hash",
            "mode",
            "combo",
            "mark",
            "perfect",
            "good",
            "bad",
            "miss",
            "date",
        ],
    );

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("scoreNotFound"),
            ),
        });
    }

    BeatmapManager.setChannelLatestBeatmap(
        interaction.channelId,
        beatmapInfo.hash,
    );

    const scoreAttribs = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score instanceof Score ? score.scoreID : score.id,
        Modes.droid,
        PPCalculationMethod.live,
    );

    const embed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player instanceof Player
            ? player.avatarURL
            : DroidHelper.getAvatarURL(player.id),
        (<GuildMember | null>interaction.member)?.displayColor,
        scoreAttribs,
        undefined,
        localization.language,
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("comparePlayDisplay"),
            player.username,
        ),
        embeds: [embed],
    };

    const replay = await ReplayHelper.analyzeReplay(score);

    if (!replay.data) {
        return InteractionHelper.reply(interaction, options);
    }

    await beatmapInfo.retrieveBeatmapFile();

    if (beatmapInfo?.hasDownloadedBeatmap()) {
        MessageButtonCreator.createRecentScoreButton(
            interaction,
            options,
            beatmapInfo.beatmap,
            replay.data,
        );
    } else {
        InteractionHelper.reply(interaction, options);
    }
};

export const config: MessageContextMenuCommand["config"] = {
    name: "Compare Score",
};
