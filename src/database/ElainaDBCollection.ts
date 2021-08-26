import { Db } from "mongodb";
import { ClanCollectionManager } from "./managers/elainaDb/ClanCollectionManager";
import { MapBlacklistCollectionManager } from "./managers/elainaDb/MapBlacklistCollectionManager";
import { TournamentMappoolCollectionManager } from "./managers/elainaDb/TournamentMappoolCollectionManager";
import { TournamentMatchCollectionManager } from "./managers/elainaDb/TourrnamentMatchCollectionManager";
import { MapWhitelistCollectionManager } from "./managers/elainaDb/MapWhitelistCollectionManager";
import { DPPBanCollectionManager } from "./managers/elainaDb/DPPBanCollectionManager";
import { PlayerTrackingCollectionManager } from "./managers/elainaDb/PlayerTrackingCollectionManager";
import { UserBindCollectionManager } from "./managers/elainaDb/UserBindCollectionManager";
import { Bot } from "@alice-core/Bot";

/**
 * Contains collections from Elaina DB.
 */
export class ElainaDBCollection {
    /**
     * The database collection for clans.
     */
    readonly clan: ClanCollectionManager;

    /**
     * The database collection for blacklisted beatmaps (dpp-related).
     */
    readonly mapBlacklist: MapBlacklistCollectionManager;

    /**
     * The database collection for tournament mappools.
     */
    readonly tournamentMappool: TournamentMappoolCollectionManager;

    /**
     * The database collection for tournament match information.
     */
    readonly tournamentMatch: TournamentMatchCollectionManager;

    /**
     * The database collection for whitelisted beatmaps (dpp-related).
     */
    readonly mapWhitelist: MapWhitelistCollectionManager;

    /**
     * The database collection for dpp ban information of users.
     */
    readonly dppBan: DPPBanCollectionManager;

    /**
     * The database collection for players who are being tracked for recent plays.
     */
    readonly playerTracking: PlayerTrackingCollectionManager;

    /**
     * The database collection for Discord users who have their osu!droid account(s) binded.
     */
    readonly userBind: UserBindCollectionManager;

    /**
     * @param client The instance of the bot.
     * @param elainaDb The database that is shared with the old bot (Nero's database).
     */
    constructor(client: Bot, elainaDb: Db) {
        this.clan = new ClanCollectionManager(client, elainaDb.collection("clandb"));
        this.mapBlacklist = new MapBlacklistCollectionManager(client, elainaDb.collection("mapblacklist"));
        this.tournamentMappool = new TournamentMappoolCollectionManager(client, elainaDb.collection("mapinfo"));
        this.tournamentMatch = new TournamentMatchCollectionManager(client, elainaDb.collection("matchinfo"));
        this.mapWhitelist = new MapWhitelistCollectionManager(client, elainaDb.collection("mapwhitelist"));
        this.dppBan = new DPPBanCollectionManager(client, elainaDb.collection("ppban"));
        this.playerTracking = new PlayerTrackingCollectionManager(client, elainaDb.collection("tracking"));
        this.userBind = new UserBindCollectionManager(client, elainaDb.collection("userbind"));
    }
}