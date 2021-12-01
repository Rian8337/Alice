import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Snowflake } from "discord.js";
import { Player } from "osu-droid";
import { recent5Strings } from "./recent5Strings";

export const run: Command["run"] = async (_, interaction) => {
    if (interaction.options.data.length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(recent5Strings.tooManyOptions),
        });
    }

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

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
            content: MessageCreator.createReject(recent5Strings.playerNotFound),
        });
    }

    if (player.recentPlays.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                recent5Strings.playerHasNoRecentPlays
            ),
        });
    }

    ScoreDisplayHelper.showRecentPlays(interaction, player);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "recent5",
    description: "Displays the 50 most recent plays of yourself or a player.",
    options: [
        {
            name: "page",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The page to display, ranging from 1 to 10. Defaults to 1.",
        },
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
    ],
    example: [
        {
            command: "recent5",
            description: "will display your 50 most recent plays.",
        },
        {
            command: "recent5",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will display the 50 most recent plays of an osu!droid account with uid 51076.",
        },
        {
            command: "recent5",
            arguments: [
                {
                    name: "username",
                    value: "NeroYuki",
                },
            ],
            description:
                "will display the 50 most recent plays of an osu!droid account with username NeroYuki.",
        },
        {
            command: "recent5",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will display the 50 most recent plays of Rian8337.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
