import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Language } from "@alice-localization/base/Language";
import { DatabaseSupportTicketPreset } from "@alice-structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@alice-utils/base/Manager";
import { AccountRebindTicketPresetBuilder } from "@alice-utils/ticket/presets/builders/AccountRebindTicketPresetBuilder";
import { BaseTicketPresetBuilder } from "@alice-utils/ticket/presets/builders/BaseTicketPresetBuilder";
import { AccountRebindTicketPresetValidator } from "@alice-utils/ticket/presets/validators/AccountRebindTicketPresetValidator";
import { BaseTicketPresetValidator } from "@alice-utils/ticket/presets/validators/BaseTicketPresetValidator";
import { ModalBuilder, RepliableInteraction } from "discord.js";
import { ObjectId } from "mongodb";

export class SupportTicketPreset
    extends Manager
    implements DatabaseSupportTicketPreset
{
    readonly id: number;
    readonly name: string;
    readonly title: string;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseSupportTicketPreset = DatabaseManager.aliceDb?.collections
            .supportTicketPreset.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.id = data.id;
        this.name = data.name;
        this.title = data.title;
    }

    /**
     * Validates whether an interaction can use this preset.
     *
     * @param interaction The interaction.
     * @returns Whether the interaction can use the preset.
     */
    async validate(interaction: RepliableInteraction): Promise<boolean> {
        let ticketPresetValidator: BaseTicketPresetValidator;

        switch (this.id) {
            case 1:
                ticketPresetValidator =
                    new AccountRebindTicketPresetValidator();
                break;
            default:
                return true;
        }

        return ticketPresetValidator.validate(interaction);
    }

    /**
     * Builds the modal of this ticket preset.
     *
     * @param language The language to build the modal on. Defaults to English.
     */
    buildModal(language: Language = "en"): ModalBuilder {
        let ticketPresetBuilder: BaseTicketPresetBuilder;

        switch (this.id) {
            case 1:
                ticketPresetBuilder = new AccountRebindTicketPresetBuilder(
                    this,
                );
                break;
            default:
                throw new Error(
                    "Unable to find modal builder for this preset.",
                );
        }

        return ticketPresetBuilder.buildModal(language);
    }
}
