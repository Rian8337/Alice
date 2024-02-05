import { DatabaseSupportTicketPreset } from "@alice-structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "mongodb";

export class SupportTicketPreset
    extends Manager
    implements DatabaseSupportTicketPreset
{
    readonly id: number;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly _id?: ObjectId;

    constructor(data: DatabaseSupportTicketPreset) {
        super();

        this._id = data._id;
        this.id = data.id;
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
    }
}
