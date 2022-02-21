import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AskCount } from "@alice-database/utils/aliceDb/AskCount";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { AskcountLocalization } from "@alice-localization/commands/Fun/AskcountLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: AskcountLocalization = new AskcountLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const askCount: AskCount | null =
        await DatabaseManager.aliceDb.collections.askCount.getUserAskCount(
            interaction.user.id
        );

    if (!askCount) {
        return interaction.editReply(
            MessageCreator.createReject(
                localization.getTranslation("haveNotAsked")
            )
        );
    }

    const count: number = askCount.count;

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("askCount"),
            count.toLocaleString()
        ),
    });
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
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
