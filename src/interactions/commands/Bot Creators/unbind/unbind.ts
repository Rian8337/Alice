import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommandOptionType } from "discord.js";
import { Constants } from "@alice-core/Constants";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "structures/core/OperationResult";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UnbindLocalization } from "@alice-localization/interactions/commands/Bot Creators/unbind/UnbindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: UnbindLocalization = new UnbindLocalization(
        CommandHelper.getLocale(interaction),
    );

    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit,
            true,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: localization.getTranslation("invalidUid"),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const bindInfo: UserBind | null = await dbManager.getFromUid(uid, {
        projection: { _id: 0, previous_bind: 1, uid: 1 },
    });

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidNotBinded"),
            ),
        });
    }

    const result: OperationResult = await bindInfo.unbind(
        uid,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unbindFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unbindSuccessful"),
            uid.toString(),
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "unbind",
    description: "Unbinds an osu!droid account.",
    options: [
        {
            name: "uid",
            required: true,
            type: ApplicationCommandOptionType.Integer,
            description: "The uid to unbind.",
            minValue: Constants.uidMinLimit,
        },
    ],
    example: [
        {
            command: "unbind uid:51076",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will unbind the osu!droid account with uid 51076 if it is bound to a Discord account.",
        },
    ],
    permissions: ["BotOwner"],
    scope: "ALL",
};
