import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AskCount } from "@alice-database/utils/aliceDb/AskCount";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { askcountStrings } from "./askcountStrings";

export const run: Command["run"] = async (_, interaction) => {
    const askCount: AskCount | null =
        await DatabaseManager.aliceDb.collections.askCount.getUserAskCount(
            interaction.user.id
        );

    if (!askCount) {
        return interaction.editReply(
            MessageCreator.createReject(askcountStrings.haveNotAsked)
        );
    }

    const count: number = askCount.count;

    interaction.editReply({
        content: MessageCreator.createAccept(
            askcountStrings.askCount,
            count.toLocaleString(),
            count === 1 ? "time" : "times"
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
