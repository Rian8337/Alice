import {
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { RecalcTicketPresetProcessorLocalization } from "@localization/utils/ticket/presets/RecalcTicketPresetProcessor/RecalcTicketPresetProcessorLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ModalTicketPresetProcessor } from "./ModalTicketPresetProcessor";
import { ModalRepliableInteraction } from "@structures/core/ModalRepliableInteraction";
import { DatabaseSupportTicketPreset } from "@structures/database/aliceDb/DatabaseSupportTicketPreset";
import { ProcessedSupportTicketPreset } from "@structures/utils/ProcessedSupportTicketPreset";
import { Language } from "@localization/base/Language";
import { DatabaseManager } from "@database/DatabaseManager";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { Constants } from "@core/Constants";

/**
 * The ticket preset processor for dpp recalculations.
 */
export class RecalcTicketPresetProcessor extends ModalTicketPresetProcessor {
    override async processModalSubmission(
        interaction: ModalSubmitInteraction,
    ): Promise<ProcessedSupportTicketPreset> {
        const reason = interaction.fields.getTextInputValue("reason");

        return {
            title: "Discord Account dpp Recalculation Request",
            description: `I would like to request a Discord account dpp recalculation with the following reason:\n\n${reason}`,
        };
    }

    protected override async processInitialInteraction(
        interaction: ModalRepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<unknown> {
        const localization = this.getLocalization(
            CommandHelper.getLocale(interaction),
        );

        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
                { projection: { _id: 0, discordid: 1, hasAskedForRecalc: 1 } },
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    new ConstantsLocalization(
                        localization.language,
                    ).getTranslation(Constants.userNotBindedReject),
                ),
            });
        }

        if (await bindInfo.isDPPBanned()) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("dppBanned"),
                ),
            });
        }

        const modal = this.createModal(
            preset,
            new TextInputBuilder()
                .setCustomId("reason")
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1250)
                .setPlaceholder(
                    localization.getTranslation("modalReasonPlaceholder"),
                )
                .setLabel(localization.getTranslation("modalReasonLabel")),
        );

        await interaction.showModal(modal);
    }

    private getLocalization(language: Language) {
        return new RecalcTicketPresetProcessorLocalization(language);
    }
}
