import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { DatabasePlayerSkin } from "@alice-interfaces/database/aliceDb/DatabasePlayerSkin";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake, User } from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

/**
 * A manager for the `playerskin` collection.
 */
export class PlayerSkinCollectionManager extends DatabaseCollectionManager<
    DatabasePlayerSkin,
    PlayerSkin
> {
    protected override readonly utilityInstance: new (
        data: DatabasePlayerSkin
    ) => PlayerSkin = PlayerSkin;

    override get defaultDocument(): DatabasePlayerSkin {
        return {
            discordid: "",
            skin: "",
        };
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
        return this.getOne({
            discordid: userOrId instanceof User ? userOrId.id : userOrId,
        });
    }

    /**
     * Inserts or updates a user's skin.
     *
     * @param id The ID of the user.
     * @param link The link to the skin.
     */
    insertNewSkin(id: Snowflake, link: string): Promise<OperationResult>;

    /**
     * Inserts or updates a user's skin.
     *
     * @param user The user.
     * @param link The link to the skin.
     */
    insertNewSkin(user: User, link: string): Promise<OperationResult>;

    insertNewSkin(
        userOrId: User | Snowflake,
        link: string
    ): Promise<OperationResult> {
        return this.updateOne(
            { discordid: userOrId instanceof User ? userOrId.id : userOrId },
            { $set: { skin: link } },
            { upsert: true }
        );
    }
}
