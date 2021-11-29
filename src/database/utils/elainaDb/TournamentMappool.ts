import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { MainBeatmapData } from "@alice-types/tournament/MainBeatmapData";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a mappool for tournament.
 */
export class TournamentMappool extends Manager implements DatabaseTournamentMappool {
    forcePR: boolean;
    poolid: string;
    map: MainBeatmapData[];
    readonly _id?: ObjectId;

    constructor(data: DatabaseTournamentMappool = DatabaseManager.elainaDb?.collections.tournamentMappool.defaultDocument ?? {}) {
        super();

        this._id = data._id;
        this.forcePR = data.forcePR;
        this.poolid = data.poolid;
        this.map = data.map ?? [];
    }
}