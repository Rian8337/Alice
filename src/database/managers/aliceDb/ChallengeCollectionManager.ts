import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { DatabaseChallenge } from "@alice-interfaces/database/aliceDb/DatabaseChallenge";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `challenge` collection.
 */
export class ChallengeCollectionManager extends DatabaseCollectionManager<DatabaseChallenge, Challenge> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseChallenge, Challenge>;

    get defaultDocument(): DatabaseChallenge {
        return {
            beatmapid: 0,
            bonus: [],
            challengeid: "",
            constrain: "",
            featured: "",
            hash: "",
            link: ["", ""],
            pass: {
                id: "pp",
                value: 0
            },
            points: 0,
            status: "scheduled",
            timelimit: Math.floor(Date.now() / 1000)
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseChallenge>) {
        super(collection);

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseChallenge, Challenge>> new Challenge().constructor
    }

    /**
     * Gets a challenge by its ID.
     * 
     * @param id The ID of the challenge.
     */
    getById(id: string): Promise<Challenge | null> {
        return this.getOne({ challengeid: id });
    }

    /**
     * Gets the ongoing challenge of the specified type.
     * 
     * @param type The type of the challenge.
     * @returns The ongoing challenge, `null` if there are no ongoing challenges of such type.
     */
    getOngoingChallenge(type: ChallengeType): Promise<Challenge | null> {
        return this.getOne({$and: [
            {
                challengeid: {
                    $regex: new RegExp((type === "weekly" ? "w" : "d") + "\d{1,}", "g")
                }
            },
            {
                status: "ongoing"
            }
        ]})
    }
}