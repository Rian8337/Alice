import { Config } from "@alice-core/Config";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MaintenanceLocalization } from "@alice-localization/commands/Bot Creators/MaintenanceLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (client, interaction) => {
    const reason: string = interaction.options.getString("reason") ?? "Unknown";

    Config.maintenance = !Config.maintenance;
    Config.maintenanceReason = reason;

    if (Config.maintenance) {
        client.user!.setActivity("Maintenance mode");
    } else {
        client.user!.setActivity(Config.activityList[0][0], {
            type: Config.activityList[0][1],
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            new MaintenanceLocalization(await CommandHelper.getLocale(interaction)).getTranslation("maintenanceToggle"),
            String(Config.maintenance),
            Config.maintenanceReason
        ),
    });
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "maintenance",
    description: "Toggles maintenance mode.",
    options: [
        {
            name: "reason",
            type: ApplicationCommandOptionTypes.STRING,
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
    permissions: ["BOT_OWNER"],
    scope: "ALL",
};
