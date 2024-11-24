import { Config } from "@core/Config";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MaintenanceLocalization } from "@localization/interactions/commands/Bot Creators/maintenance/MaintenanceLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const reason: string = interaction.options.getString("reason") ?? "Unknown";

    Config.maintenance = !Config.maintenance;
    Config.maintenanceReason = reason;

    if (Config.maintenance) {
        client.user.setActivity("Maintenance mode");
    } else {
        client.user.setActivity(Config.activityList[0][0], {
            type: Config.activityList[0][1],
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new MaintenanceLocalization(
                CommandHelper.getLocale(interaction),
            ).getTranslation("maintenanceToggle"),
            String(Config.maintenance),
            Config.maintenanceReason,
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "maintenance",
    description: "Toggles maintenance mode.",
    options: [
        {
            name: "reason",
            type: ApplicationCommandOptionType.String,
            description:
                'The reason to toggle maintenance mode. Defaults to "Unknown".',
        },
    ],
    example: [
        {
            command: "maintenance reason:Discord API problem",
            description:
                'will toggle maintenance mode for "Discord API problem".',
        },
    ],
    permissions: ["BotOwner"],
};
