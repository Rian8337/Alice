import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandUtilScope } from "@alice-types/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import {
    Collection,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const event: string = interaction.options.getString("event", true);

    const utility: string = interaction.options.getString("utility", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const eventUtilities: Collection<string, EventUtil> | undefined =
        client.eventUtilities.get(event);

    if (!eventUtilities) {
        return interaction.editReply({
            content: MessageCreator.createReject(settingsStrings.eventNotFound),
        });
    }

    const util: EventUtil | undefined = eventUtilities.get(utility);

    if (!util) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.eventUtilityNotFound
            ),
        });
    }

    if (
        !CommandHelper.userFulfillsCommandPermission(
            interaction,
            util.config.togglePermissions
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    switch (scope) {
        case "channel":
            await CommandUtilManager.enableUtilityInChannel(
                interaction.channel instanceof ThreadChannel
                    ? interaction.channel.parent!
                    : <TextChannel | NewsChannel>interaction.channel,
                event,
                utility
            );
            break;
        case "guild":
            await CommandUtilManager.enableUtilityInGuild(
                interaction.guildId!,
                event,
                utility
            );
            break;
        case "global":
            // Only allow bot owners to globally enable an event utility
            if (!CommandHelper.isExecutedByBotOwner(interaction)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.noPermissionReject
                    ),
                });
            }
            CommandUtilManager.enableUtilityGlobally(event, utility);
            break;
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.eventUtilityToggleSuccess,
            "enabled",
            utility,
            event
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
