import { PlayerSkin } from "@database/utils/aliceDb/PlayerSkin";
import { DatabasePlayerSkin } from "structures/database/aliceDb/DatabasePlayerSkin";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake, User } from "discord.js";

/**
 * A manager for the `playerskin` collection.
 */
export class PlayerSkinCollectionManager extends DatabaseCollectionManager<
    DatabasePlayerSkin,
    PlayerSkin
> {
    protected override readonly utilityInstance: new (
        data: DatabasePlayerSkin,
    ) => PlayerSkin = PlayerSkin;

    override get defaultDocument(): DatabasePlayerSkin {
        return {
            discordid: "",
            name: "",
            description: "",
            url: "",
        };
    }

    /**
     * Gets a skin by its name.
     *
     * @param name The name of the skin.
     * @returns The skin, `null` if not found.
     */
    getFromName(name: string): Promise<PlayerSkin | null> {
        return this.getOne({
            name: name,
        });
    }

    getRaw(): Promise<DatabasePlayerSkin[]> {
        return this.collection.find().toArray();
    }

    /**
     * Checks a skin name availability of a user.
     *
     * @param user The user.
     * @param name The name of the skin.
     * @returns Whether the name is available.
     */
    async checkSkinNameAvailability(
        user: User | Snowflake,
        name: string,
    ): Promise<boolean> {
        const skin: PlayerSkin | null = await this.getOne(
            {
                discordid: user instanceof User ? user.id : user,
                name: name,
            },
            {
                projection: {
                    _id: 1,
                },
            },
        );

        return skin !== null;
    }
}
