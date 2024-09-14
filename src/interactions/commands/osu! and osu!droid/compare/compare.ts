import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
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
import { GuildMember } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { CompareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/compare/CompareLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { Modes } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { OfficialDatabaseUser } from "@alice-database/official/schema/OfficialDatabaseUser";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization = new CompareLocalization(
        CommandHelper.getLocale(interaction),
    );

    const cachedBeatmapHash = BeatmapManager.getChannelLatestBeatmap(
        interaction.channelId,
    );

    if (!cachedBeatmapHash) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmap"),
            ),
        });
    }

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const discordid = interaction.options.getUser("user")?.id;
    let uid = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;
    let player: Pick<OfficialDatabaseUser, "id" | "username"> | Player | null =
        null;

    switch (true) {
        case !!uid:
            player = await DroidHelper.getPlayer(uid!, ["id", "username"]);

            uid ??=
                player instanceof Player ? player.uid : (player?.id ?? null);

            break;
        case !!username:
            if (!StringHelper.isUsernameValid(username)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("playerNotFound"),
                    ),
                });
            }

            player = await DroidHelper.getPlayer(username, ["id", "username"]);

            uid ??=
                player instanceof Player ? player.uid : (player?.id ?? null);

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

            player = await DroidHelper.getPlayer(bindInfo.uid, [
                "id",
                "username",
            ]);
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    uid = player instanceof Player ? player.uid : player.id;

    const score = await DroidHelper.getScore(uid, cachedBeatmapHash, [
        "id",
        "uid",
        "filename",
        "hash",
        "mode",
        "score",
        "combo",
        "mark",
        "perfect",
        "good",
        "bad",
        "miss",
        "date",
    ]);

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || discordid || username
                        ? "userScoreNotFound"
                        : "selfScoreNotFound",
                ),
            ),
        });
    }

    const scoreAttribs = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.uid,
        score.hash,
        Modes.droid,
        PPCalculationMethod.live,
    );

    const embed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player instanceof Player
            ? player.avatarURL
            : DroidHelper.getAvatarURL(player.id),
        (<GuildMember | null>interaction.member)?.displayColor,
        scoreAttribs?.attributes,
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

    const beatmapInfo = await BeatmapManager.getBeatmap(score.hash, {
        checkFile: true,
    });

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
