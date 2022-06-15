import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseMusicCollection } from "@alice-interfaces/database/aliceDb/DatabaseMusicCollection";
import { Manager } from "@alice-utils/base/Manager";

/**
 * Represents a music collection.
 */
export class MusicCollection
    extends Manager
    implements DatabaseMusicCollection
{
    createdAt: number;
    name: string;
    owner: string;
    videoIds: string[];

    constructor(
        data: DatabaseMusicCollection = DatabaseManager.aliceDb?.collections
            .musicCollection.defaultDocument ?? {}
    ) {
        super();

        this.createdAt = data.createdAt;
        this.name = data.name;
        this.owner = data.owner;
        this.videoIds = data.videoIds ?? [];
    }

    /**
     * Updates this music collection into the database.
     *
     * @returns An object containing information about the operation.
     */
    updateCollection(): Promise<OperationResult> {
        return DatabaseManager.aliceDb.collections.musicCollection.updateOne(
            { owner: this.owner },
            {
                $set: {
                    name: this.name,
                    videoIds: this.videoIds,
                },
            }
        );
    }
}
