import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { SettingsLocalization } from "@alice-localization/commands/Staff/SettingsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
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

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: SettingsLocalization = new SettingsLocalization(language);

    const event: string = interaction.options.getString("event", true);

    const utility: string = interaction.options.getString("utility", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const eventUtilities: Collection<string, EventUtil> | undefined =
        client.eventUtilities.get(event);

    if (!eventUtilities) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("eventNotFound")),
        });
    }

    const util: EventUtil | undefined = eventUtilities.get(utility);

    if (!util) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("eventUtilityNotFound")
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
            content: MessageCreator.createReject(new ConstantsLocalization(language).getTranslation(Constants.noPermissionReject)),
        });
    }

    switch (scope) {
        case "channel":
            await CommandUtilManager.disableUtilityInChannel(
                interaction.channel instanceof ThreadChannel
                    ? interaction.channel.parent!
                    : <TextChannel | NewsChannel>interaction.channel,
                event,
                utility
            );
            break;
        case "guild":
            await CommandUtilManager.disableUtilityInGuild(
                interaction.guildId!,
                event,
                utility
            );
            break;
        case "global":
            // Only allow bot owners to globally disable an event utility
            if (!CommandHelper.isExecutedByBotOwner(interaction)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(language).getTranslation(Constants.noPermissionReject)
                    ),
                });
            }
            CommandUtilManager.disableUtilityGlobally(event, utility);
            break;
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("eventUtilityDisableSuccess"),
            utility,
            event
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
