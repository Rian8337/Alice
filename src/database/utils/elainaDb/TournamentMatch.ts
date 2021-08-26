import { Bot } from "@alice-core/Bot";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a tournament match.
 */
export class TournamentMatch extends Manager implements DatabaseTournamentMatch {
    matchid: string;
    name: string;
    team: [string, number][];
    player: [string, string][];
    status: "scheduled" | "on-going" | "completed";
    result: number[][];
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseTournamentMatch) {
        super(client);

        this._id = data._id;
        this.matchid = data.matchid;
        this.name = data.name;
        this.team = data.team ?? [];
        this.player = data.player ?? [];
        this.status = data.status;
        this.result = data.result ?? [];
    }
}