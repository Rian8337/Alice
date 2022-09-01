import { Constants } from "@alice-core/Constants";
import { ApplicationCommandOptionType } from "discord.js";
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
            type: ApplicationCommandOptionType.Subcommand,
            description: "Adds a player into the tracking list.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the player.",
                    minValue: Constants.uidMinLimit,
                },
            ],
        },
        {
            name: "delete",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Deletes a player from the tracking list.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the player.",
                    minValue: Constants.uidMinLimit,
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
    permissions: ["BotOwner"],
    scope: "ALL",
};
