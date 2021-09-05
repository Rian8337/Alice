import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseMapShare } from "@alice-interfaces/database/aliceDb/DatabaseMapShare";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a shared beatmap.
 */
export class MapShare extends Manager implements DatabaseMapShare {
    beatmap_id: number;
    hash: string;
    submitter: string;
    id: Snowflake;
    date: number;
    summary: string;
    status: "accepted" | "denied" | "pending" | "posted";
    readonly _id?: ObjectId;

    constructor(data: DatabaseMapShare = DatabaseManager.aliceDb?.collections.mapShare.defaultDocument ?? {}) {
        super();

        this._id = data._id;
        this.beatmap_id = data.beatmap_id;
        this.hash = data.hash;
        this.submitter = data.submitter;
        this.id = data.id;
        this.date = data.date;
        this.summary = data.summary;
        this.status = data.status;
    }

    // TODO: methods to deny/post/accept/whatever
}