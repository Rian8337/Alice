import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { unbindStrings } from "./unbindStrings";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { Constants } from "@alice-core/Constants";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";

export const run: Command["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (!NumberHelper.isNumberInRange(uid, Constants.uidMinLimit, Constants.uidMaxLimit, true)) {
        return interaction.editReply({
            content: unbindStrings.invalidUid
        });
    }

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    const bindInfo: UserBind | null = await dbManager.getFromUid(uid);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(unbindStrings.uidNotBinded)
        });
    }

    const result: DatabaseOperationResult = await bindInfo.unbind(uid);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unbindStrings.unbindFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            unbindStrings.unbindSuccessful, uid.toString()
        )
    });
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "unbind",
    description: "Unbinds an osu!droid account.",
    options: [
        {
            name: "uid",
            required: true,
            type: CommandArgumentType.INTEGER,
            description: "The uid to unbind."
        }
    ],
    example: [
        {
            command: "unbind 51076",
            description: "will unbind the osu!droid account with uid 51076 if it is binded to a Discord account."
        }
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL"
};