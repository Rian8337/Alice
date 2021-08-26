import { Bot } from "@alice-core/Bot";
import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a profile background that is applicable to profile commands.
 */
export class ProfileBackground extends Manager implements DatabaseProfileBackground {
    readonly _id?: ObjectId;
    id: string;
    name: string;

    constructor(client: Bot, data: DatabaseProfileBackground) {
        super(client);

        this._id = data._id;
        this.id = data.id;
        this.name = data.name;
    }
}