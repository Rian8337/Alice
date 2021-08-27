import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a tournament match.
 */
export class TournamentMatch extends Manager implements DatabaseTournamentMatch {
    matchid: string;
    channelId: Snowflake;
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
        this.channelId = data.channelId;
        this.name = data.name;
        this.team = data.team ?? [];
        this.player = data.player ?? [];
        this.status = data.status;
        this.result = data.result ?? [];
    }

    /**
     * Updates the match in match database.
     * 
     * This should only be called after changing everything needed
     * as this will perform a database operation.
     * 
     * @returns An object containing information about the operation.
     */
    updateMatch(): Promise<DatabaseOperationResult> {
        return DatabaseManager.elainaDb.collections.tournamentMatch.update(
            { matchid: this.matchid },
            {
                $set: {
                    channelId: this.channelId,
                    name: this.name,
                    player: this.player,
                    result: this.result,
                    status: this.status,
                    team: this.team
                }
            }
        );
    }
}