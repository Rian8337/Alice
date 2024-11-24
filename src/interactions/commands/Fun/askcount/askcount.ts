import { DatabaseManager } from "@database/DatabaseManager";
import { AskCount } from "@database/utils/aliceDb/AskCount";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { AskcountLocalization } from "@localization/interactions/commands/Fun/askcount/AskcountLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: AskcountLocalization = new AskcountLocalization(
        CommandHelper.getLocale(interaction),
    );

    const askCount: AskCount | null =
        await DatabaseManager.aliceDb.collections.askCount.getUserAskCount(
            interaction.user.id,
        );

    if (!askCount) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("haveNotAsked"),
            ),
        });
    }

    const count: number = askCount.count;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("askCount"),
            count.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language),
            ),
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
};
