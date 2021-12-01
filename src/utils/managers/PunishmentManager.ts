import { Manager } from "@alice-utils/base/Manager";
import { GuildPunishmentConfigCollectionManager } from "@alice-database/managers/aliceDb/GuildPunishmentConfigCollectionManager";

/**
 * A manager for punishments handed to users.
 */
export abstract class PunishmentManager extends Manager {
    /**
     * The database collection that is responsible for holding guild
     * punishment configurations.
     */
    protected static punishmentDb: GuildPunishmentConfigCollectionManager;

    /**
     * Default rejection message if a server's log channel is not found.
     */
    protected static readonly logChannelNotFoundReject: string =
        "Unable to find the server log channel";

    /**
     * Default rejection message if a server's log channel is not a text channel.
     */
    protected static readonly logChannelNotValidReject: string =
        "The server's log channel is not a text channel";
}
