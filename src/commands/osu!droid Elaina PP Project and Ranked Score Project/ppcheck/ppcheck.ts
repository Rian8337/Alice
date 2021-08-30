import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Snowflake } from "discord.js";
import { ppcheckStrings } from "./ppcheckStrings";

export const run: Command["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(ppcheckStrings.tooManyOptions)
        });
    }

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null;

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!);
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                !!uid || !!username || !!discordid ? Constants.userNotBindedReject : Constants.selfNotBindedReject
            )
        });
    }

    DPPHelper.viewDPPList(
        interaction,
        bindInfo,
        NumberHelper.clamp(
            interaction.options.getInteger("page") ?? 1,
            1,
            Math.ceil(bindInfo.pp.size / 5)
        )
    );
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "ppcheck",
    description: "Checks yours or a player's droid pp (dpp) profile.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.USER,
            description: "The user to check."
        },
        {
            name: "uid",
            type: CommandArgumentType.INTEGER,
            description: "The uid of the player."
        },
        {
            name: "username",
            type: CommandArgumentType.STRING,
            description: "The username of the player."
        },
        {
            name: "page",
            type: CommandArgumentType.INTEGER,
            description: "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1."
        }
    ],
    example: [
        {
            command: "ppcheck",
            description: "will give a list of your submitted plays in droid pp system."
        },
        {
            command: "ppcheck user:@Rian8337#0001 index:5",
            description: "will give a list of Rian8337's submitted plays in droid pp system at page 5."
        },
        {
            command: "ppcheck user:132783516176875520",
            description: "will give a list of the user with that Discord ID's submitted plays in droid pp system."
        },
        {
            command: "ppcheck username:dgsrz index:7",
            description: "will give a list of that username's submitted plays in droid pp system at page 7."
        },
        {
            command: "ppcheck uid:11678",
            description: "will give a list of that uid's submitted plays in droid pp system."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};