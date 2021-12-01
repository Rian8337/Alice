import { Constants } from "@alice-core/Constants";
import { Command } from "@alice-interfaces/core/Command";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CommandUtilScope } from "@alice-types/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { NewsChannel, TextChannel } from "discord.js";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const commandName: string = interaction.options.getString("command", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const command: Command | undefined = client.commands.get(commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.commandNotFound
            ),
        });
    }

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        command.config.permissions.some((v) => v === "BOT_OWNER")
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.cannotDisableCommand
            ),
        });
    }

    let result: OperationResult | undefined;

    switch (scope) {
        case "channel":
            if (
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "MANAGE_CHANNELS",
                ])
            ) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.noPermissionReject
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInChannel(
                <TextChannel | NewsChannel>interaction.channel,
                commandName,
                -1
            );
            break;
        case "guild":
            if (
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "MANAGE_GUILD",
                ])
            ) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.noPermissionReject
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInGuild(
                interaction.guildId,
                commandName,
                -1
            );
            break;
        case "global":
            // Only allow bot owners to globally disable a command
            if (!CommandHelper.isExecutedByBotOwner(interaction)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.noPermissionReject
                    ),
                });
            }

            CommandUtilManager.setCommandCooldownGlobally(commandName, -1);
            break;
    }

    if (result && !result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.disableCommandFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.disableCommandSuccess,
            commandName
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
