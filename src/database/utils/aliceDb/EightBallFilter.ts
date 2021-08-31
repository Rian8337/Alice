import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseEightBallFilter } from "@alice-interfaces/database/aliceDb/DatabaseEightBallFilter";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a filter for 8ball responses.
 */
export class EightBallFilter extends Manager implements DatabaseEightBallFilter {
    name: string;
    like: string[];
    hate: string[];
    badwords: string[];
    response: string[];
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseEightBallFilter = DatabaseManager.aliceDb.collections.eightBallFilter.defaultDocument) {
        super(client);

        this._id = data._id;
        this.name = data.name;
        this.like = data.like ?? [];
        this.hate = data.hate ?? [];
        this.badwords = data.badwords ?? [];
        this.response = data.response ?? [];
    }
}