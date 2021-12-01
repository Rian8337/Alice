import { Constants } from "@alice-core/Constants";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { playertrackStrings } from "./playertrackStrings";

export const run: Command["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit,
            true
        )
    ) {
        return interaction.editReply({
            content: playertrackStrings.incorrectUid,
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "playertrack",
    description: "Manages the player tracking function.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Adds a player into the tracking list.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the player.",
                },
            ],
        },
        {
            name: "delete",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Deletes a player from the tracking list.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the player.",
                },
            ],
        },
    ],
    example: [
        {
            command: "playertrack add uid:51076",
            description: "will add uid 51076 into player tracking list.",
        },
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL",
};
