import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TicketLocalization } from "@alice-localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new TicketLocalization(
        CommandHelper.getLocale(interaction),
    );

    const presetName = interaction.options.getString("preset");

    if (presetName) {
        const preset =
            await DatabaseManager.aliceDb.collections.supportTicketPreset.getOne(
                { name: presetName },
                { projection: { _id: 0, title: 1, description: 1 } },
            );

        if (!preset) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("presetNotFound"),
                ),
            });
        }

        return preset.createProcessor().process(interaction, preset);
    }

    ModalCreator.createModal(
        interaction,
        "ticket-create",
        localization.getTranslation("ticketCreateModalTitle"),
        new TextInputBuilder()
            .setCustomId("title")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setPlaceholder(
                localization.getTranslation("ticketModalTitlePlaceholder"),
            )
            .setLabel(localization.getTranslation("ticketModalTitleLabel")),
        new TextInputBuilder()
            .setCustomId("description")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setPlaceholder(
                localization.getTranslation(
                    "ticketModalDescriptionPlaceholder",
                ),
            )
            .setLabel(
                localization.getTranslation("ticketModalDescriptionLabel"),
            ),
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 30,
    instantDeferInDebug: false,
};
