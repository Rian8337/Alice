import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import {
    ApplicationCommandOptionType,
    InteractionReplyOptions,
} from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { GuildMember, EmbedBuilder, Snowflake } from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { RecentLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/recent/RecentLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MapInfo, Modes } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: RecentLocalization = new RecentLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");
    const considerNonOverwrite: boolean =
        interaction.options.getBoolean("considernonoverwrite") ?? true;

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | null = null;

    switch (true) {
        case !!uid:
            player = await Player.getInformation(uid!);

            uid ??= player?.uid;

            break;
        case !!username:
            player = await Player.getInformation(username!);

            uid ??= player?.uid;

            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                    },
                },
            );

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language,
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject,
                        ),
                    ),
                });
            }

            player = await Player.getInformation(bindInfo.uid);
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    const recentPlays: (Score | RecentPlay)[] = considerNonOverwrite
        ? await ScoreHelper.getRecentScores(player.uid, player.recentPlays)
        : player.recentPlays;

    if (recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays"),
            ),
        });
    }

    const index: number = interaction.options.getInteger("index") ?? 1;
    const score: Score | RecentPlay = recentPlays[index - 1];

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playIndexOutOfBounds"),
                index.toString(),
            ),
        });
    }

    BeatmapManager.setChannelLatestBeatmap(interaction.channelId, score.hash);

    const scoreAttribs: CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null =
        score instanceof Score
            ? await DPPProcessorRESTManager.getOnlineScoreAttributes(
                  score.scoreID,
                  Modes.droid,
                  PPCalculationMethod.live,
              )
            : score.droidAttribs ?? null;

    const embed: EmbedBuilder = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        scoreAttribs,
        score instanceof Score ? undefined : score.osuAttribs ?? null,
        localization.language,
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("recentPlayDisplay"),
            player.username,
        ),
        embeds: [embed],
    };

    if (score instanceof Score) {
        score.replay ??= new ReplayAnalyzer({ scoreID: score.scoreID });

        await ReplayHelper.analyzeReplay(score);

        if (!score.replay.data) {
            return InteractionHelper.reply(interaction, options);
        }

        const beatmapInfo: MapInfo<true> | null =
            await BeatmapManager.getBeatmap(score.hash);

        if (beatmapInfo?.hasDownloadedBeatmap()) {
            MessageButtonCreator.createRecentScoreButton(
                interaction,
                options,
                beatmapInfo.beatmap,
                score.replay.data,
            );
        } else {
            InteractionHelper.reply(interaction, options);
        }
    } else {
        InteractionHelper.reply(interaction, options);
    }
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "recent",
    description: "Shows the recent play of yourself or a player.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "The Discord user to show.",
        },
        {
            name: "uid",
            type: ApplicationCommandOptionType.Integer,
            description: "The uid of the player.",
            minValue: Constants.uidMinLimit,
        },
        {
            name: "username",
            type: ApplicationCommandOptionType.String,
            description: "The username of the player.",
            minLength: 2,
            maxLength: 20,
            autocomplete: true,
        },
        {
            name: "index",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play.",
            minValue: 1,
            maxValue: 50,
        },
        {
            name: "considernonoverwrite",
            type: ApplicationCommandOptionType.Boolean,
            description:
                "Whether to take non-overwritten plays into consideration. Defaults to true.",
        },
    ],
    example: [
        {
            command: "recent",
            description: "will show your most recent play.",
        },
        {
            command: "recent",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
                {
                    name: "index",
                    value: 5,
                },
            ],
            description: "will show the 5th most recent play of uid 51076.",
        },
        {
            command: "recent",
            arguments: [
                {
                    name: "username",
                    value: "NeroYuki",
                },
                {
                    name: "index",
                    value: 2,
                },
            ],
            description:
                "will show the 2nd most recent play of username NeroYuki.",
        },
        {
            command: "recent",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will show the most recent play of Rian8337.",
        },
    ],
    permissions: [],
    cooldown: 5,
    scope: "ALL",
};
