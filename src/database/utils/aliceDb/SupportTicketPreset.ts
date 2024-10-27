import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseSupportTicketPreset } from "@structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@utils/base/Manager";
import { AccountRebindTicketPresetProcessor } from "@utils/ticket/presets/AccountRebindTicketPresetProcessor";
import { BaseTicketPresetProcessor } from "@utils/ticket/presets/BaseTicketPresetProcessor";
import { RecalcTicketPresetProcessor } from "@utils/ticket/presets/RecalcTicketPresetProcessor";
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
     * Creates a processor based on the ID of a ticket preset.
     *
     * @param id The ID of the ticket preset.
     */
    static createProcessor(id: number): BaseTicketPresetProcessor {
        switch (id) {
            case 1:
                return new AccountRebindTicketPresetProcessor();
            case 2:
                return new RecalcTicketPresetProcessor();
            default:
                throw new Error(
                    "Unable to determine a processor for this ticket preset.",
                );
        }
    }

    /**
     * Creates a processor for this ticket preset.
     */
    createProcessor(): BaseTicketPresetProcessor {
        return SupportTicketPreset.createProcessor(this.id);
    }
}
