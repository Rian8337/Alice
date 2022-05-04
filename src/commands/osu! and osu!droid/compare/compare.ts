import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { CompareLocalization } from "@alice-localization/commands/osu! and osu!droid/compare/CompareLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: CompareLocalization = new CompareLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const cachedBeatmapHash: string | undefined =
        BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    if (!cachedBeatmapHash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmap")
            ),
        });
    }

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | undefined;

    switch (true) {
        case !!uid:
            player = await Player.getInformation({ uid: uid! });
            uid = player.uid;
            break;
        case !!username:
            player = await Player.getInformation({ username: username! });
            uid = player.uid;
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        Constants.userNotBindedReject
                    ),
                });
            }

            player = await Player.getInformation({ uid: bindInfo.uid });
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        Constants.selfNotBindedReject
                    ),
                });
            }

            player = await Player.getInformation({ uid: bindInfo.uid });
    }

    if (!player.username) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound")
            ),
        });
    }

    const score: Score = await Score.getFromHash({
        uid: player.uid,
        hash: cachedBeatmapHash,
    });

    if (!score.title) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    !!uid || !!discordid || !!username
                        ? "userScoreNotFound"
                        : "selfScoreNotFound"
                )
            ),
        });
    }

    const embed: MessageEmbed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        localization.language
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("comparePlayDisplay"),
            player.username
        ),
        embeds: [embed],
    });
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "compare",
    description: "Compares yours or a player's score among others.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description: "The Discord user to compare.",
        },
        {
            name: "uid",
            type: ApplicationCommandOptionTypes.INTEGER,
            description: "The uid of the player.",
        },
        {
            name: "username",
            type: ApplicationCommandOptionTypes.STRING,
            description: "The username of the player.",
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
    scope: "ALL",
};
