import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseProfileBadge } from "@alice-interfaces/database/aliceDb/DatabaseProfileBadge";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a profile badge.
 */
export class ProfileBadge extends Manager implements DatabaseProfileBadge {
    id: string;
    name: string;
    description: string;
    type: "dpp" | "score_total" | "score_ranked" | "star_fc" | "unclaimable";
    requirement: number;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseProfileBadge = DatabaseManager.aliceDb?.collections
            .profileBadges.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.requirement = data.requirement;
    }
}
