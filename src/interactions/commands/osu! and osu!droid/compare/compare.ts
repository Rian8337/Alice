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
import { CompareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/compare/CompareLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MapInfo, Modes } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: CompareLocalization = new CompareLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const cachedBeatmapHash: string | undefined =
        BeatmapManager.getChannelLatestBeatmap(interaction.channelId);

    if (!cachedBeatmapHash) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmap")
            ),
        });
    }

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

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
                }
            );

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject
                        )
                    ),
                });
            }

            player = await Player.getInformation(bindInfo.uid);
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound")
            ),
        });
    }

    const score: Score | null = await Score.getFromHash(
        player.uid,
        cachedBeatmapHash
    );

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || discordid || username
                        ? "userScoreNotFound"
                        : "selfScoreNotFound"
                )
            ),
        });
    }

    const scoreAttribs: CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.scoreID,
        Modes.droid,
        PPCalculationMethod.live
    );

    const embed: EmbedBuilder = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        scoreAttribs,
        undefined,
        localization.language
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("comparePlayDisplay"),
            player.username
        ),
        embeds: [embed],
    };

    if (score.accuracy.nmiss > 0) {
        score.replay ??= new ReplayAnalyzer({ scoreID: score.scoreID });
        await ReplayHelper.analyzeReplay(score);

        if (!score.replay.data) {
            return InteractionHelper.reply(interaction, options);
        }

        const beatmapInfo: MapInfo<true> | null =
            await BeatmapManager.getBeatmap(score.hash, {
                checkFile: true,
            });

        if (beatmapInfo?.hasDownloadedBeatmap()) {
            MessageButtonCreator.createMissAnalyzerButton(
                interaction,
                options,
                beatmapInfo.beatmap,
                score.replay.data
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
    name: "compare",
    description: "Compares yours or a player's score among others.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "The Discord user to compare.",
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
    ],
    example: [
        {
            command: "compare",
            description: "will compare your score among others.",
        },
        {
            command: "compare",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will compare the score of an osu!droid account with uid 51076.",
        },
        {
            command: "compare",
            arguments: [
                {
                    name: "username",
                    value: "NeroYuki",
                },
            ],
            description:
                "will compare the score of an osu!droid account with username NeroYuki.",
        },
        {
            command: "compare",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will compare the score of Rian8337.",
        },
    ],
    permissions: [],
    cooldown: 5,
    scope: "ALL",
};
