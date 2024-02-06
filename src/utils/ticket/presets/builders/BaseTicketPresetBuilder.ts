import { Language } from "@alice-localization/base/Language";
import { DatabaseSupportTicketPreset } from "@alice-structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@alice-utils/base/Manager";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "discord.js";

/**
 * The base of ticket preset builders.
 */
export abstract class BaseTicketPresetBuilder extends Manager {
    /**
     * The ticket preset.
     */
    readonly preset: DatabaseSupportTicketPreset;

    /**
     * @param preset The ticket preset.
     */
    constructor(preset: DatabaseSupportTicketPreset) {
        super();

        this.preset = preset;
    }

    /**
     * Builds the modal of the ticket preset.
     *
     * @param language The language to build the modal from. Defaults to English.
     */
    buildModal(language: Language = "en"): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(`ticket-create-with-preset#${this.preset.id}`)
            .setTitle(this.preset.title)
            .addComponents(
                this.getTextComponents(language).map((v) =>
                    new ActionRowBuilder<TextInputBuilder>().addComponents(v),
                ),
            );
    }

    protected abstract getTextComponents(
        language: Language,
    ): TextInputBuilder[];
}
