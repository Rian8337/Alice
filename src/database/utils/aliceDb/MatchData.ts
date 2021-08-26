import { Bot } from "@alice-core/Bot";
import { DatabaseMatchData } from "@alice-interfaces/database/aliceDb/DatabaseMatchData";
import { RoundScore } from "@alice-interfaces/match/MatchScore";
import { PlayerResult } from "@alice-interfaces/match/PlayerResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a tournament match's result.
 */
export class MatchData extends Manager implements DatabaseMatchData {
    matchid: string;
    players: string[];
    bans: string[];
    result: PlayerResult[]; // TODO: would like to change this into a collection in the future
    scores: RoundScore[];
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseMatchData) {
        super(client);

        this._id = data._id;
        this.matchid = data.matchid;
        this.players = data.players ?? [];
        this.bans = data.bans ?? [];
        this.result = data.result ?? [];
        this.scores = data.scores ?? [];
    }
}