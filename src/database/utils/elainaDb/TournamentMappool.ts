import { Bot } from "@alice-core/Bot";
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

    constructor(client: Bot, data: DatabaseTournamentMappool) {
        super(client);

        this._id = data._id;
        this.forcePR = data.forcePR;
        this.poolid = data.poolid;
        this.map = data.map ?? [];
    }
}