import { Bot } from "@alice-core/Bot";
import { DatabaseTournamentMapLengthInfo } from "@alice-interfaces/database/aliceDb/DatabaseTournamentMapLengthInfo";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Collection } from "discord.js";

/**
 * Represents a mappool length for tournament.
 */
export class TournamentMapLengthInfo extends Manager {
    /**
     * The ID of the mappool.
     */
    poolid: string;

    /**
     * The beatmaps in the mappool, mapped by pick name.
     */
    map: Collection<string, number>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseTournamentMapLengthInfo) {
        super(client);

        this._id = data._id;
        this.poolid = data.poolid;
        this.map = new Collection(data.map?.map(v => [v[0], parseInt(<string> v[1])]) ?? []);
    }
}