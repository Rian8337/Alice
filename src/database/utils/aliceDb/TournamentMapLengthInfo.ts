import { Bot } from "@alice-core/Bot";
import { DatabaseTournamentMapLengthInfo } from "@alice-interfaces/database/aliceDb/DatabaseTournamentMapLengthInfo";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Collection } from "discord.js";

/**
 * Represents a mappool length for tournament.
 */
export class TournamentMapLengthInfo extends Manager implements DatabaseTournamentMapLengthInfo {
    poolid: string;
    map: [string, string | number][];
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseTournamentMapLengthInfo) {
        super(client);

        this._id = data._id;
        this.poolid = data.poolid;
        this.map = data.map ?? [];
    }
}