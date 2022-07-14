import { Constants } from "@alice-core/Constants";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayertrackLocalization } from "@alice-localization/interactions/commands/Bot Creators/playertrack/PlayertrackLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: PlayertrackLocalization = new PlayertrackLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit,
            true
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: localization.getTranslation("incorrectUid"),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        localization.language
    );
};

export const category: SlashCommand["category"] = CommandCategory.BOT_CREATORS;

export const config: SlashCommand["config"] = {
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
