import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { DatabaseMusicCollection } from "@alice-interfaces/database/aliceDb/DatabaseMusicCollection";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { Snowflake, User, Collection as DiscordCollection } from "discord.js";

/**
 * A manager for the `musiccollection` collection.
 */
export class MusicCollectionManager extends DatabaseCollectionManager<
    DatabaseMusicCollection,
    MusicCollection
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseMusicCollection,
        MusicCollection
    >;

    override get defaultDocument(): DatabaseMusicCollection {
        return {
            createdAt: Date.now(),
            name: "",
            owner: "",
            videoIds: [],
        };
    }

    constructor(collection: MongoDBCollection<DatabaseMusicCollection>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseMusicCollection, MusicCollection>
        >new MusicCollection().constructor;
    }

    /**
     * Gets the music collections of a user.
     *
     * @param user The user.
     *
     * @returns The music collections owned by the user, mapped by the name.
     */
    getUserCollections(
        user: User
    ): Promise<DiscordCollection<string, MusicCollection>>;

    /**
     * Gets the music collections of a user.
     *
     * @param id The ID of the user.
     *
     * @returns The music collections owned by the user, mapped by the name.
     */
    getUserCollections(
        id: Snowflake
    ): Promise<DiscordCollection<string, MusicCollection>>;

    getUserCollections(
        userOrId: User | Snowflake
    ): Promise<DiscordCollection<string, MusicCollection>> {
        return this.get("name", {
            owner: userOrId instanceof User ? userOrId.id : userOrId,
        });
    }

    /**
     * Gets a music collection by its name.
     *
     * @param name The name of the music collection.
     * @returns The music collection with that name, `null` if not found.
     */
    getFromName(name: string): Promise<MusicCollection | null> {
        return this.getOne({ name: name });
    }
}
