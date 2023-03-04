import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AskCount } from "@alice-database/utils/aliceDb/AskCount";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { AskcountLocalization } from "@alice-localization/interactions/commands/Fun/askcount/AskcountLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: AskcountLocalization = new AskcountLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const askCount: AskCount | null =
        await DatabaseManager.aliceDb.collections.askCount.getUserAskCount(
            interaction.user.id
        );

    if (!askCount) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("haveNotAsked")
            ),
        });
    }

    const count: number = askCount.count;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("askCount"),
            count.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.fun;

export const config: SlashCommand["config"] = {
    name: "askcount",
    description: "See how many times you have asked me.",
    options: [],
    example: [
        {
            command: "askcount",
            description: "will tell you how many times you have asked me.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
