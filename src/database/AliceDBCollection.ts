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
import { GuildTagCollectionManager } from "./managers/aliceDb/GuildTagCollectionManager";
import { GuildPunishmentConfigCollectionManager } from "./managers/aliceDb/GuildPunishmentConfigCollectionManager";
import { NameChangeCollectionManager } from "./managers/aliceDb/NameChangeCollectionManager";
import { OsuBindCollectionManager } from "./managers/aliceDb/OsuBindCollectionManager";
import { PlayerInfoCollectionManager } from "./managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerSkinCollectionManager } from "./managers/aliceDb/PlayerSkinCollectionManager";
import { ProfileBackgroundCollectionManager } from "./managers/aliceDb/ProfileBackgroundCollectionManager";
import { VotingCollectionManager } from "./managers/aliceDb/VotingCollectionManager";
import { PrototypePPCollectionManager } from "./managers/aliceDb/PrototypePPCollectionManager";
import { ProfileBadgeCollectionManager } from "./managers/aliceDb/ProfileBadgeCollectionManager";
import { MusicCollectionManager } from "./managers/aliceDb/MusicCollectionManager";
import { IllegalMapCollectionManager } from "./managers/aliceDb/IllegalMapCollectionManager";
import { UserLocaleCollectionManager } from "./managers/aliceDb/UserLocaleCollectionManager";
import { WarningCollectionManager } from "./managers/aliceDb/WarningCollectionManager";
import { MultiplayerRoomCollectionManager } from "./managers/aliceDb/MultiplayerRoomCollectionManager";
import { RestoredPlayerCredentialsCollectionManager } from "./managers/aliceDb/RestoredPlayerCredentialsCollectionManager";
import { OldPPProfileCollectionManager } from "./managers/aliceDb/OldPPProfileCollectionManager";

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
     * The database collection for shared beatmaps.
     */
    readonly mapShare: MapShareCollectionManager;

    /**
     * The database collection for music collections.
     */
    readonly musicCollection: MusicCollectionManager;

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
    readonly guildTags: GuildTagCollectionManager;

    /**
     * The database collection for voting entries.
     */
    readonly voting: VotingCollectionManager;

    /**
     * The database collection for beatmaps that are considered illegal.
     */
    readonly illegalMap: IllegalMapCollectionManager;

    /**
     * The database collection for user locales.
     */
    readonly userLocale: UserLocaleCollectionManager;

    /**
     * The database collection for user warnings.
     */
    readonly userWarning: WarningCollectionManager;

    /**
     * The database collection for multiplayer rooms.
     */
    readonly multiplayerRoom: MultiplayerRoomCollectionManager;

    /**
     * The database collection for restored players' credentials.
     */
    readonly restoredPlayerCredentials: RestoredPlayerCredentialsCollectionManager;

    /**
     * The database collection for players' old dpp profiles.
     */
    readonly playerOldPPProfile: OldPPProfileCollectionManager;

    /**
     * @param aliceDb The database that is only used by this bot (my database).
     */
    constructor(aliceDb: Db) {
        this.askCount = new AskCountCollectionManager(
            aliceDb.collection("askcount")
        );
        this.clanAuction = new ClanAuctionCollectionManager(
            aliceDb.collection("auction")
        );
        this.birthday = new BirthdayCollectionManager(
            aliceDb.collection("birthday")
        );
        this.channelData = new ChannelDataCollectionManager(
            aliceDb.collection("channeldata")
        );
        this.challenge = new ChallengeCollectionManager(
            aliceDb.collection("challenge")
        );
        this.guildSettings = new GuildSettingsCollectionManager(
            aliceDb.collection("guildsettings")
        );
        this.emojiStatistics = new EmojiStatisticsCollectionManager(
            aliceDb.collection("emojistatistics")
        );
        this.loungeLock = new LoungeLockCollectionManager(
            aliceDb.collection("loungelock")
        );
        this.mapShare = new MapShareCollectionManager(
            aliceDb.collection("mapshare")
        );
        this.musicCollection = new MusicCollectionManager(
            aliceDb.collection("musiccollection")
        );
        this.nameChange = new NameChangeCollectionManager(
            aliceDb.collection("namechange")
        );
        this.osuBind = new OsuBindCollectionManager(
            aliceDb.collection("osubind")
        );
        this.playerInfo = new PlayerInfoCollectionManager(
            aliceDb.collection("playerpoints")
        );
        this.playerSkins = new PlayerSkinCollectionManager(
            aliceDb.collection("playerskins")
        );
        this.dppAPIKey = new DPPAPIKeyCollectionManager(
            aliceDb.collection("ppapikey")
        );
        this.profileBackgrounds = new ProfileBackgroundCollectionManager(
            aliceDb.collection("profilebackgrounds")
        );
        this.profileBadges = new ProfileBadgeCollectionManager(
            aliceDb.collection("profilebadges")
        );
        this.prototypePP = new PrototypePPCollectionManager(
            aliceDb.collection("prototypepp")
        );
        this.guildPunishmentConfig = new GuildPunishmentConfigCollectionManager(
            aliceDb.collection("punishmentconfig")
        );
        this.eightBallFilter = new EightBallFilterCollectionManager(
            aliceDb.collection("responsefilter")
        );
        this.guildTags = new GuildTagCollectionManager(
            aliceDb.collection("tags")
        );
        this.voting = new VotingCollectionManager(aliceDb.collection("voting"));
        this.illegalMap = new IllegalMapCollectionManager(
            aliceDb.collection("illegalmap")
        );
        this.userLocale = new UserLocaleCollectionManager(
            aliceDb.collection("userlocale")
        );
        this.userWarning = new WarningCollectionManager(
            aliceDb.collection("userwarning")
        );
        this.multiplayerRoom = new MultiplayerRoomCollectionManager(
            aliceDb.collection("multiplayerroom")
        );
        this.restoredPlayerCredentials =
            new RestoredPlayerCredentialsCollectionManager(
                aliceDb.collection("restoredplayercredentials")
            );
        this.playerOldPPProfile = new OldPPProfileCollectionManager(
            aliceDb.collection("playeroldpp")
        );
    }
}
