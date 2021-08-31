import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMapLengthInfo } from "@alice-interfaces/database/aliceDb/DatabaseTournamentMapLengthInfo";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a mappool length for tournament.
 */
export class TournamentMapLengthInfo extends Manager implements DatabaseTournamentMapLengthInfo {
    poolid: string;
    map: [string, string | number][];
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseTournamentMapLengthInfo = DatabaseManager.aliceDb.collections.tournamentMapLengthInfo.defaultDocument) {
        super(client);

        this._id = data._id;
        this.poolid = data.poolid;
        this.map = data.map ?? [];
    }
}