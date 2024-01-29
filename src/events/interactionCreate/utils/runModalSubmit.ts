import { Config } from "@alice-core/Config";
import { EventUtil } from "structures/core/EventUtil";
import { RunModalSubmitLocalization } from "@alice-localization/events/interactionCreate/runModalSubmit/RunModalSubmitLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { InteractionType, ModalSubmitInteraction } from "discord.js";
import { consola } from "consola";

export const run: EventUtil["run"] = async (
    client,
    interaction: ModalSubmitInteraction,
) => {
    if (interaction.type !== InteractionType.ModalSubmit) {
        return;
    }

    // 3 seconds should be enough to get the user's locale
    const localization = new RunModalSubmitLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const botOwnerExecution = CommandHelper.isExecutedByBotOwner(interaction);

    if (Config.isDebug && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("debugModeActive"),
            ),
            ephemeral: true,
        });
    }

    const commandName = interaction.customId.split("#")[0];
    const command = client.interactions.modalSubmit.get(commandName);

    if (!command) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound"),
            ),
            ephemeral: true,
        });
    }

    // Check for maintenance
    if (Config.maintenance && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                StringHelper.formatString(
                    localization.getTranslation("maintenanceMode"),
                    Config.maintenanceReason,
                ),
            ),
            ephemeral: true,
        });
    }

    // Log used command
    consola.info(
        `Modal: ${interaction.user.tag} (${
            interaction.channel!.isDMBased()
                ? "DM"
                : `#${interaction.channel!.name}`
        }): ${commandName}`,
    );

    interaction.ephemeral =
        (command.config?.replyEphemeral || Config.maintenance) ?? false;

    if (Config.isDebug && command.config?.instantDeferInDebug !== false) {
        // Attempt to instantly defer in debug mode (slower internet).
        await InteractionHelper.deferReply(interaction);
    }

    // Finally, run the command
    command.run(client, interaction).catch((e: Error) => {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("commandExecutionFailed"),
                e.message,
            ),
        });

        client.emit("error", e);
    });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for handling modal submissions from interactions. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
