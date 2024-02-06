import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseSupportTicketPreset } from "@alice-structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@alice-utils/base/Manager";
import { AccountRebindTicketPresetProcessor } from "@alice-utils/ticket/presets/AccountRebindTicketPresetProcessor";
import { BaseTicketPresetProcessor } from "@alice-utils/ticket/presets/BaseTicketPresetProcessor";
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
     * Creates a processor for this ticket preset.
     */
    createProcessor(): BaseTicketPresetProcessor {
        switch (this.id) {
            case 1:
                return new AccountRebindTicketPresetProcessor();
            default:
                throw new Error(
                    "Unable to determine a processor for this ticket preset.",
                );
        }
    }
}
