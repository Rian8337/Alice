import { Constants } from "@alice-core/Constants";
import { Command } from "@alice-interfaces/core/Command";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CommandUtilScope } from "@alice-types/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Language } from "@alice-localization/base/Language";
import { SettingsLocalization } from "@alice-localization/commands/Staff/SettingsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: SettingsLocalization = new SettingsLocalization(
        language
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(language);

    const commandName: string = interaction.options.getString("command", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const command: Command | undefined = client.commands.get(commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound")
            ),
        });
    }

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        command.config.permissions.some((v) => v === "BOT_OWNER")
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("cannotDisableCommand")
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
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInChannel(
                interaction.channel instanceof ThreadChannel
                    ? interaction.channel.parent!
                    : <TextChannel | NewsChannel>interaction.channel,
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
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInGuild(
                interaction.guildId!,
                commandName,
                -1
            );
            break;
        case "global":
            // Only allow bot owners to globally disable a command
            if (!CommandHelper.isExecutedByBotOwner(interaction)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            CommandUtilManager.setCommandCooldownGlobally(commandName, -1);
            break;
    }

    if (result && !result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("disableCommandFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("disableCommandSuccess"),
            commandName
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
