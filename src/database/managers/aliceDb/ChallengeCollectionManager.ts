import { DatabaseCollectionManager } from "@database/managers/DatabaseCollectionManager";
import { Challenge } from "@database/utils/aliceDb/Challenge";
import { DatabaseChallenge } from "structures/database/aliceDb/DatabaseChallenge";
import { ChallengeType } from "structures/challenge/ChallengeType";

/**
 * A manager for the `challenge` collection.
 */
export class ChallengeCollectionManager extends DatabaseCollectionManager<
    DatabaseChallenge,
    Challenge
> {
    protected override readonly utilityInstance: new (
        data: DatabaseChallenge,
    ) => Challenge = Challenge;

    override get defaultDocument(): DatabaseChallenge {
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
                value: 0,
            },
            points: 0,
            status: "scheduled",
            timelimit: Math.floor(Date.now() / 1000),
        };
    }

    /**
     * Gets a challenge by its ID.
     *
     * @param id The ID of the challenge.
     * @returns The challenge, `null` if not found.
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
        return this.getOne({
            $and: [
                {
                    challengeid: {
                        $regex: new RegExp(
                            `${type === "weekly" ? "w" : "d"}\\d{1,}`,
                            "g",
                        ),
                    },
                },
                {
                    status: "ongoing",
                },
            ],
        });
    }

    /**
     * Gets a challenge by its hash.
     *
     * @param hash The hash of the challenge.
     * @returns The challenge, `null` if not found.
     */
    getFromHash(hash: string): Promise<Challenge | null> {
        return this.getOne({ hash: hash });
    }
}
