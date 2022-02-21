import { Manager } from "@alice-utils/base/Manager";
import { GuildPunishmentConfigCollectionManager } from "@alice-database/managers/aliceDb/GuildPunishmentConfigCollectionManager";
import {
    PunishmentManagerLocalization,
    PunishmentManagerStrings,
} from "@alice-localization/utils/managers/PunishmentManagerLocalization";
import { Language } from "@alice-localization/base/Language";

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
    protected static readonly logChannelNotFoundReject: keyof PunishmentManagerStrings =
        "cannotFindLogChannel";

    /**
     * Default rejection message if a server's log channel is not a text channel.
     */
    protected static readonly logChannelNotValidReject: keyof PunishmentManagerStrings =
        "invalidLogChannel";

    /**
     * Gets the localization of this manager.
     *
     * @param language The language to localize.
     */
    protected static getPunishmentManagerLocalization(
        language: Language
    ): PunishmentManagerLocalization {
        return new PunishmentManagerLocalization(language);
    }
}
