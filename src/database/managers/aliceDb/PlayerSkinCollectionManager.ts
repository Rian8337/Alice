import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { DatabasePlayerSkin } from "@alice-interfaces/database/aliceDb/DatabasePlayerSkin";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake, User } from "discord.js";
import { Bot } from "@alice-core/Bot";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";

/**
 * A manager for the `playerskin` collection.
 */
export class PlayerSkinCollectionManager extends DatabaseCollectionManager<DatabasePlayerSkin, PlayerSkin> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabasePlayerSkin, PlayerSkin>;

    get defaultDocument(): DatabasePlayerSkin {
        return {
            discordid: "",
            skin: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabasePlayerSkin>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabasePlayerSkin, PlayerSkin>> new PlayerSkin(client, this.defaultDocument).constructor
    }

    /**
     * Gets a user's skin.
     * 
     * @param user The user to get the skin from.
     */
    getUserSkin(user: User): Promise<PlayerSkin | null>;

    /**
     * Gets a user's skin.
     * 
     * @param id The ID of the user to get the skin from.
     */
    getUserSkin(id: Snowflake): Promise<PlayerSkin | null>;

    getUserSkin(userOrId: User | Snowflake): Promise<PlayerSkin | null> {
        return this.getOne({ discordid: userOrId instanceof User ? userOrId.id : userOrId });
    }

    /**
     * Inserts or updates a user's skin.
     * 
     * @param id The ID of the user.
     * @param link The link to the skin.
     */
    insertNewSkin(id: Snowflake, link: string): Promise<DatabaseOperationResult>;

    /**
     * Inserts or updates a user's skin.
     * 
     * @param user The user.
     * @param link The link to the skin.
     */
    insertNewSkin(user: User, link: string): Promise<DatabaseOperationResult>;

    insertNewSkin(userOrId: User | Snowflake, link: string): Promise<DatabaseOperationResult> {
        return this.update({ discordid: userOrId instanceof User ? userOrId.id : userOrId }, { $set: { skin: link } });
    }
}