import { Db } from "mongodb";
import { AskCountCollectionManager } from "./managers/aliceDb/AskCountCollectionManager";
import { BirthdayCollectionManager } from "./managers/aliceDb/BirthdayCollectionManager";
import { ChallengeCollectionManager } from "./managers/aliceDb/ChallengeCollectionManager";
import { ChannelDataCollectionManager } from "./managers/aliceDb/ChannelDataCollectionManager";
import { GuildSettingsCollectionManager } from "./managers/aliceDb/GuildSettingsCollectionManager";
import { ClanAuctionCollectionManager } from "./managers/aliceDb/ClanAuctionCollectionManager";
import { EightBallFilterCollectionManager } from "./managers/aliceDb/EightBallFilterCollectionManager";
import { EmojiStatisticsCollectionManager } from "./managers/aliceDb/EmojiStatisticsCollectionManager";
import { LoungeLockCollectionManager } from "./managers/aliceDb/LoungeLockCollectionManager";
import { MapShareCollectionManager } from "./managers/aliceDb/MapShareCollectionManager";
import { DPPAPIKeyCollectionManager } from "./managers/aliceDb/DPPAPIKeyCollectionManager";
import { GuildTagsCollectionManager } from "./managers/aliceDb/GuildTagsCollectionManager";
import { GuildPunishmentConfigCollectionManager } from "./managers/aliceDb/GuildPunishmentConfigCollectionManager";
import { MatchDataCollectionManager } from "./managers/aliceDb/MatchDataCollectionManager";
import { NameChangeCollectionManager } from "./managers/aliceDb/NameChangeCollectionManager";
import { OsuBindCollectionManager } from "./managers/aliceDb/OsuBindCollectionManager";
import { PlayerInfoCollectionManager } from "./managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerSkinCollectionManager } from "./managers/aliceDb/PlayerSkinCollectionManager";
import { TournamentMapLengthInfoCollectionManager } from "./managers/aliceDb/TournamentMapLengthInfoCollectionManager";
import { RankedScoreCollectionManager } from "./managers/aliceDb/RankedScoreCollectionManager";
import { ProfileBackgroundCollectionManager } from "./managers/aliceDb/ProfileBackgroundCollectionManager";
import { VotingCollectionManager } from "./managers/aliceDb/VotingCollectionManager";
import { PrototypePPCollectionManager } from "./managers/aliceDb/PrototypePPCollectionManager";
import { ProfileBadgeCollectionManager } from "./managers/aliceDb/ProfileBadgeCollectionManager";
import { Bot } from "@alice-core/Bot";

/**
 * Contains collections from Alice DB.
 */
export class AliceDBCollection {
    /**
     * The database collection manager for information about how many times a user has asked the bot via 8ball.
     */
    readonly askCount: AskCountCollectionManager;

    /**
     * The database collection for clan auctions.
     */
    readonly clanAuction: ClanAuctionCollectionManager;

    /**
     * The database collection manager for user birthday dates.
     */
    readonly birthday: BirthdayCollectionManager;

    /**
     * The database collection for data about channel activities in specific times.
     */
    readonly channelData: ChannelDataCollectionManager;

    /**
     * The database collection for guilds' settings.
     */
    readonly guildSettings: GuildSettingsCollectionManager;

    /**
     * The database collection for daily or weekly challenges.
     */
    readonly challenge: ChallengeCollectionManager;

    /**
     * The database collection for guilds' emoji statistics.
     */
    readonly emojiStatistics: EmojiStatisticsCollectionManager;

    /**
     * The database collection for Discord users' lounge lock.
     */
    readonly loungeLock: LoungeLockCollectionManager;

    /**
     * The database collection for tournament beatmaps' lengths for each difficulty.
     */
    readonly tournamentMapLengthInfo: TournamentMapLengthInfoCollectionManager;

    /**
     * The database collection for shared beatmaps.
     */
    readonly mapShare: MapShareCollectionManager;

    /**
     * The database collection for tournament match results.
     */
    readonly matchData: MatchDataCollectionManager;

    /**
     * The database collection for name changes.
     */
    readonly nameChange: NameChangeCollectionManager;

    /**
     * The database collection for Discord users who have their osu! account binded.
     */
    readonly osuBind: OsuBindCollectionManager;

    /**
     * The database collection for information about Discord users regarding the bot
     * (amount of Alice coins and its streak, daily/weekly challenges status, profile
     * picture format, etc).
     */
    readonly playerInfo: PlayerInfoCollectionManager;

    /**
     * The database collection for osu!droid accounts' ranked score.
     */
    readonly rankedScore: RankedScoreCollectionManager;

    /**
     * The database collection for Discord users' osu!/osu!droid skin.
     */
    readonly playerSkins: PlayerSkinCollectionManager;

    /**
     * The database collection for droid performance point (dpp) API keys.
     */
    readonly dppAPIKey: DPPAPIKeyCollectionManager;

    /**
     * The database collection for profile backgrounds that are applicable
     * to profile commands.
     */
    readonly profileBackgrounds: ProfileBackgroundCollectionManager;

    /**
     * The database collection for profile badges.
     */
    readonly profileBadges: ProfileBadgeCollectionManager;

    /**
     * The database collection for prototype droid performance point (dpp) entries of osu!droid players.
     */
    readonly prototypePP: PrototypePPCollectionManager;

    /**
     * The database collection for guilds' punishment configuration.
     */
    readonly guildPunishmentConfig: GuildPunishmentConfigCollectionManager;

    /**
     * The database collection for filter for 8ball responses.
     */
    readonly eightBallFilter: EightBallFilterCollectionManager;
    
    /**
     * The database collection for guild tags.
     */
    readonly guildTags: GuildTagsCollectionManager;

    /**
     * The database collection for voting entries.
     */
    readonly voting: VotingCollectionManager;

    /**
     * @param client The instance of the bot.
     * @param aliceDb The database that is only used by this bot (my database).
     */
    constructor(client: Bot, aliceDb: Db) {
        this.askCount = new AskCountCollectionManager(client, aliceDb.collection("askcount"));
        this.clanAuction = new ClanAuctionCollectionManager(client, aliceDb.collection("auction"));
        this.birthday = new BirthdayCollectionManager(client, aliceDb.collection("birthday"));
        this.channelData = new ChannelDataCollectionManager(client, aliceDb.collection("channeldata"));
        this.challenge = new ChallengeCollectionManager(client, aliceDb.collection("dailychallenge"));
        this.guildSettings = new GuildSettingsCollectionManager(client, aliceDb.collection("guildsettings"));
        this.emojiStatistics = new EmojiStatisticsCollectionManager(client, aliceDb.collection("emojistatistics"));
        this.loungeLock = new LoungeLockCollectionManager(client, aliceDb.collection("loungelock"));
        this.tournamentMapLengthInfo = new TournamentMapLengthInfoCollectionManager(client, aliceDb.collection("mapinfolength"));
        this.mapShare = new MapShareCollectionManager(client, aliceDb.collection("mapshare"));
        this.matchData = new MatchDataCollectionManager(client, aliceDb.collection("matchdata"));
        this.nameChange = new NameChangeCollectionManager(client, aliceDb.collection("namechange"));
        this.osuBind = new OsuBindCollectionManager(client, aliceDb.collection("osubind"));
        this.playerInfo = new PlayerInfoCollectionManager(client, aliceDb.collection("playerpoints"));
        this.rankedScore = new RankedScoreCollectionManager(client, aliceDb.collection("playerscore"));
        this.playerSkins = new PlayerSkinCollectionManager(client, aliceDb.collection("playerskins"));
        this.dppAPIKey = new DPPAPIKeyCollectionManager(client, aliceDb.collection("ppapikey"));
        this.profileBackgrounds = new ProfileBackgroundCollectionManager(client, aliceDb.collection("profilebackgrounds"));
        this.profileBadges = new ProfileBadgeCollectionManager(client, aliceDb.collection("profilebadges"));
        this.prototypePP = new PrototypePPCollectionManager(client, aliceDb.collection("prototypepp"));
        this.guildPunishmentConfig = new GuildPunishmentConfigCollectionManager(client, aliceDb.collection("punishmentconfig"));
        this.eightBallFilter = new EightBallFilterCollectionManager(client, aliceDb.collection("responsefilter"));
        this.guildTags = new GuildTagsCollectionManager(client, aliceDb.collection("tags"));
        this.voting = new VotingCollectionManager(client, aliceDb.collection("voting"));
    }
}