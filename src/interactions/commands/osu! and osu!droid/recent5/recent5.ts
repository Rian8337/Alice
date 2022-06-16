import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Snowflake } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Recent5Localization } from "@alice-localization/interactions/commands/osu! and osu!droid/recent5/Recent5Localization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: Recent5Localization = new Recent5Localization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.options.data.length > 1) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

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
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language
                        ).getTranslation(Constants.userNotBindedReject)
                    ),
                });
            }

            player = await Player.getInformation(bindInfo.uid);
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language
                        ).getTranslation(Constants.selfNotBindedReject)
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

    if (player.recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays")
            ),
        });
    }

    ScoreDisplayHelper.showRecentPlays(
        interaction,
        player,
        interaction.options.getInteger("page") ?? undefined
    );
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "recent5",
    description: "Displays the 50 most recent plays of yourself or a player.",
    options: [
        {
            name: "page",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The page to display, ranging from 1 to 10. Defaults to 1.",
            minValue: 1,
            maxValue: 10,
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
