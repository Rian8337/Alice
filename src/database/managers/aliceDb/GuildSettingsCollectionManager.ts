import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildSettings } from "@alice-database/utils/aliceDb/GuildSettings";
import { DatabaseGuildSettings } from "@alice-interfaces/database/aliceDb/DatabaseGuildSettings";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `guildsettings` collection.
 */
export class GuildSettingsCollectionManager extends DatabaseCollectionManager<
    DatabaseGuildSettings,
    GuildSettings
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseGuildSettings,
        GuildSettings
    >;

    override get defaultDocument(): DatabaseGuildSettings {
        return {
            channelSettings: [],
            disabledCommands: [],
            disabledEventUtils: [],
            id: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseGuildSettings>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseGuildSettings, GuildSettings>
        >new GuildSettings().constructor;
    }

    /**
     * Gets the settings of a guild.
     *
     * @param guildId The ID of the guild.
     * @returns The guild setting, `null` if not found.
     */
    getGuildSetting(guildId: Snowflake): Promise<GuildSettings | null> {
        return this.getOne({ id: guildId });
    }
}
