import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Snowflake } from "discord.js";
import { PPcheckLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/ppcheck/PPcheckLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: PPcheckLocalization = new PPcheckLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null;

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!, {
                projection: {
                    _id: 0,
                    uid: 1,
                    username: 1,
                    pp: 1,
                    pptotal: 1,
                },
            });
            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!, {
                projection: {
                    _id: 0,
                    uid: 1,
                    username: 1,
                    pp: 1,
                    pptotal: 1,
                },
            });
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                        username: 1,
                        pp: 1,
                        pptotal: 1,
                    },
                }
            );
    }

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    !!uid || !!username || !!discordid
                        ? Constants.userNotBindedReject
                        : Constants.selfNotBindedReject
                )
            ),
        });
    }

    DPPHelper.displayDPPList(
        interaction,
        bindInfo,
        interaction.options.getInteger("page") ?? 1
    );
};

export const category: SlashCommand["category"] = CommandCategory.PP;

export const config: SlashCommand["config"] = {
    name: "ppcheck",
    description: "Checks yours or a player's droid pp (dpp) profile.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to check.",
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
            name: "page",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1.",
            minValue: 1,
            maxValue: 15,
        },
    ],
    example: [
        {
            command: "ppcheck",
            description:
                "will give a list of your submitted plays in droid pp system.",
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "page",
                    value: 5,
                },
            ],
            description:
                "will give a list of Rian8337's submitted plays in droid pp system at page 5.",
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will give a list of the user with that Discord ID's submitted plays in droid pp system.",
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "username",
                    value: "dgsrz",
                },
                {
                    name: "page",
                    value: 7,
                },
            ],
            description:
                "will give a list of that username's submitted plays in droid pp system at page 7.",
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "uid",
                    value: 11678,
                },
            ],
            description:
                "will give a list of that uid's submitted plays in droid pp system.",
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};
