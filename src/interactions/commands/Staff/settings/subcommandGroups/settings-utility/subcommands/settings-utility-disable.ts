import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { CommandUtilScope } from "@alice-types/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import {
    Collection,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const event: string = interaction.options.getString("event", true);

    const utility: string = interaction.options.getString("utility", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const eventUtilities: Collection<string, EventUtil> | undefined =
        client.eventUtilities.get(event);

    if (!eventUtilities) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("eventNotFound")
            ),
        });
    }

    const util: EventUtil | undefined = eventUtilities.get(utility);

    if (!util) {
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.noPermissionReject
                )
            ),
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
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language
                        ).getTranslation(Constants.noPermissionReject)
                    ),
                });
            }
            CommandUtilManager.disableUtilityGlobally(event, utility);
            break;
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("eventUtilityDisableSuccess"),
            utility,
            event
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
