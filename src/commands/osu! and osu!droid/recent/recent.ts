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
import { Player } from "osu-droid";
import { recentStrings } from "./recentStrings";

export const run: Command["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(recentStrings.tooManyOptions),
        });
    }

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
                return interaction.editReply({
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
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.selfNotBindedReject
                    ),
                });
            }

            player = await Player.getInformation({ uid: bindInfo.uid });
    }

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(recentStrings.playerNotFound),
        });
    }

    if (player.recentPlays.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                recentStrings.playerHasNoRecentPlays
            ),
        });
    }

    const index: number = interaction.options.getInteger("index") ?? 1;

    if (!player.recentPlays[index - 1]) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                recentStrings.playIndexOutOfBounds,
                index.toString()
            ),
        });
    }

    BeatmapManager.setChannelLatestBeatmap(
        interaction.channel!.id,
        player.recentPlays[index - 1].hash
    );

    const embed: MessageEmbed = await EmbedCreator.createRecentPlayEmbed(
        player.recentPlays[index - 1],
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            recentStrings.recentPlayDisplay,
            player.username
        ),
        embeds: [embed],
    });
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "recent",
    description: "Shows the recent play of yourself or a player.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description: "The Discord user to show.",
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
        {
            name: "index",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play.",
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
    scope: "ALL",
};
