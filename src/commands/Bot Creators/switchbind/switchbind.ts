import { GuildMember } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { switchbindStrings } from "./switchbindStrings";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: Command["run"] = async (client, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (!NumberHelper.isNumberInRange(uid, Constants.uidMinLimit, Constants.uidMaxLimit, true)) {
        return interaction.editReply({
            content: switchbindStrings.invalidUid
        });
    }

    const user: GuildMember = await (await client.guilds.fetch(Constants.mainServer)).members.fetch(interaction.options.getUser("user")!);

    const bindDb: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    const bindInfo: UserBind | null = await bindDb.getFromUid(uid);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(switchbindStrings.uidNotBinded)
        });
    }

    const result: OperationResult = await bindInfo.moveBind(uid, user.id);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(switchbindStrings.switchFailed, <string>result.reason)
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(switchbindStrings.switchSuccessful)
    });
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "switchbind",
    description: "Switches an osu!droid account bind from one Discord account to another.",
    options: [
        {
            name: "uid",
            required: true,
            type: ApplicationCommandOptionTypes.INTEGER,
            description: "The uid of the osu!droid account to switch."
        },
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to switch the bind to."
        }
    ],
    example: [
        {
            command: "switchbind uid:51076 user:@Rian8337#0001",
            arguments: [
                {
                    name: "uid",
                    value: 51076
                },
                {
                    name: "user",
                    value: "@Rian8337#0001"
                }
            ],
            description: "will switch the osu!droid account with uid 51076's bind to Rian8337."
        },
        {
            command: "switchbind uid:5475 user:132783516176875520",
            arguments: [
                {
                    name: "uid",
                    value: 5475
                },
                {
                    name: "user",
                    value: "132783516176875520"
                }
            ],
            description: "will switch the osu!droid account with uid 5475's bind to the Discord account with ID 132783516176875520."
        }
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL"
};