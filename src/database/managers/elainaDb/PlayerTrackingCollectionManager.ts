import { PlayerTracking } from "@alice-database/utils/elainaDb/PlayerTracking";
import { DatabasePlayerTracking } from "@alice-interfaces/database/elainaDb/DatabasePlayerTracking";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";

/**
 * A manager for the `tracking` collection.
 */
export class PlayerTrackingCollectionManager extends DatabaseCollectionManager<DatabasePlayerTracking, PlayerTracking> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabasePlayerTracking, PlayerTracking>;
    get defaultDocument(): DatabasePlayerTracking {
        return {
            uid: 0
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabasePlayerTracking>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabasePlayerTracking, PlayerTracking>> new PlayerTracking(client, this.defaultDocument).constructor
    }

    /**
     * Adds a player to the tracking list.
     * 
     * @param uid The uid of the player.
     * @returns An object containing information about the operation.
     */
    addPlayer(uid: number): Promise<DatabaseOperationResult> {
        return this.update({ uid: uid }, { $set: { uid: uid } }, { upsert: true });
    }

    /**
     * Removes a player from the tracking list.
     * 
     * @param uid The uid of the player.
     * @returns An object containing information about the operation.
     */
    removePlayer(uid: number): Promise<DatabaseOperationResult> {
        return this.delete({ uid: uid });
    }
}