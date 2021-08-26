import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { DatabaseUserBind } from "@alice-interfaces/database/elainaDb/DatabaseUserBind";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";
import { MapInfo, Player, Score } from "osu-droid";
import { Clan } from "./Clan";

/**
 * Represents a Discord user who has at least one osu!droid account binded.
 */
export class UserBind extends Manager {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The UID of the osu!droid account binded to the user.
     */
    uid: number;

    /**
     * The username of the osu!droid account binded to the user.
     */
    username: string;

    /**
     * The total droid performance points (dpp) that the user has.
     */
    pptotal: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

    /**
     * The droid performance points entries of the user, mapped by hash.
     */
    pp: Collection<string, PPEntry>;

    /**
     * The clan the user is currently in.
     */
    clan?: string;

    /**
     * The UID of osu!droid accounts that are binded to the user.
     * 
     * A user can only bind up to 2 osu!droid accounts, therefore
     * the maximum length of this array will never exceed 2.
     */
    previous_bind: number[];

    /**
     * The epoch time at which the user can join another clan, in seconds.
     */
    joincooldown?: number;

    /**
     * The last clan that the user was in.
     */
    oldclan?: string;

    /**
     * The epoch time at which the user can rejoin his/her old clan, in seconds.
     */
    oldjoincooldown?: number;

    /**
     * Whether the user has asked for droid performance points and ranked score recalculation.
     */
    hasAskedForRecalc: boolean;

    /**
     * Whether the ongoing dpp scan is completed for this user.
     */
    dppScanComplete?: boolean;

    /**
     * Whether the ongoing dpp recalculation is completed for this user.
     */
    dppRecalcComplete?: boolean;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseUserBind) {
        super(client);

        this._id = data._id;
        this.discordid = data.discordid;
        this.uid = data.uid;
        this.username = data.username;
        this.pptotal = data.pptotal;
        this.playc = data.playc;
        this.pp = ArrayHelper.arrayToCollection(data.pp ?? [], "hash");
        this.clan = data.clan;
        this.previous_bind = data.previous_bind ?? [];
        this.joincooldown = data.joincooldown;
        this.oldclan = data.oldclan;
        this.oldjoincooldown = data.oldjoincooldown;
        this.hasAskedForRecalc = data.hasAskedForRecalc;
        this.dppScanComplete = data.dppScanComplete;
        this.dppRecalcComplete = data.dppRecalcComplete;
    }

    /**
     * Checks whether this player is dpp-banned.
     */
    async isDPPBanned(): Promise<boolean> {
        for await (const uid of this.previous_bind) {
            if (await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(uid)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Scans the dpp list of this player, removing those that are outdated.
     * 
     * @returns An object containing information about the operation.
     */
    async scanDPP(): Promise<DatabaseOperationResult> {
        if (await this.isDPPBanned()) {
            // Reset everything if user is banned.
            this.pp = new Collection();
            this.pptotal = 0;

            return DatabaseManager.elainaDb.collections.userBind.update(
                { discordid: this.discordid },
                {
                    $set: {
                        pp: [],
                        pptotal: 0,
                        dppScanComplete: true
                    }
                }
            );
        }

        for await (const ppEntry of this.pp.values()) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(ppEntry.hash, false);

            await HelperFunctions.sleep(0.2);

            if (!beatmapInfo) {
                this.pp.delete(ppEntry.hash);
                continue;
            }

            if (
                WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved) &&
                await WhitelistManager.getBeatmapWhitelistStatus(beatmapInfo.hash) !== "whitelisted"
            ) {
                this.pp.delete(ppEntry.hash);
                continue;
            }

            if (await WhitelistManager.isBlacklisted(beatmapInfo.beatmapID)) {
                this.pp.delete(ppEntry.hash);
                continue;
            }
        }

        // Even if there are no deletions, still update to keep track of scan progress.
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(this.pp);

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    pptotal: this.pptotal,
                    pp: [...this.pp.values()],
                    dppScanComplete: true
                }
            }
        );
    }

    /**
     * Sets the dpp list for the player to a new list.
     * 
     * @param list The new list.
     * @param playCountIncrement The amount to increment towards play count.
     * @returns An object containing information about the operation.
     */
    async setNewDPPValue(list: Collection<string, PPEntry>, playCountIncrement: number): Promise<DatabaseOperationResult> {
        this.pp = list.clone();

        this.pp.sort((a, b) => {
            return b.pp - a.pp;
        });

        this.playc += Math.max(0, playCountIncrement);

        const finalPP: number = DPPHelper.calculateFinalPerformancePoints(list);

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    pptotal: finalPP,
                    pp: [...this.pp.values()]
                },
                $inc: {
                    playc: Math.max(0, playCountIncrement)
                }
            }
        );
    }

    /**
     * Moves the bind of a binded osu!droid account in this Discord account to another
     * Discord account.
     * 
     * @param uid The uid of the osu!droid account.
     * @param to The ID of the Discord account to move to.
     * @returns An object containing information about the operation.
     */
    async moveBind(uid: number, to: Snowflake): Promise<DatabaseOperationResult> {
        if (!this.previous_bind.includes(uid)) {
            return this.createOperationResult(false, "uid is not binded to this Discord account");
        }

        if (this.discordid === to) {
            return this.createOperationResult(false, "cannot rebind to the same Discord account");
        }

        const otherBindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(to);

        const otherPreviousBind: number[] = otherBindInfo?.previous_bind ?? [];

        if (otherPreviousBind.length >= 2) {
            return this.createOperationResult(false, "bind limit reached in other Discord account");
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);
        }

        const player: Player = await Player.getInformation({ uid: this.uid });

        if (!player.username) {
            this.previous_bind.push(uid);

            return this.createOperationResult(false, "player not found");
        }

        this.username = player.username;

        otherPreviousBind.push(uid);

        await DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: to },
            {
                $set: {
                    uid: uid,
                    username: player.username,
                    previous_bind: otherPreviousBind
                },
                $setOnInsert: {
                    hasAskedForRecalc: false,
                    pptotal: 0,
                    playc: 0,
                    pp: [],
                    clan: ""
                }
            },
            { upsert: true }
        );

        if (this.previous_bind.length === 0) {
            await DatabaseManager.elainaDb.collections.userBind.delete({ discordid: this.discordid });
        }

        return DatabaseManager.aliceDb.collections.playerInfo.update(
            { uid: uid },
            {
                $set: {
                    discordid: to
                }
            }
        );
    }

    /**
     * Binds an osu!droid account to this Discord account.
     * 
     * @param uid The uid of the osu!droid account.
     * @returns An object containing information about the operation.
     */
    async bind(uid: number): Promise<DatabaseOperationResult>;

    /**
     * Binds an osu!droid account to this Discord account.
     * 
     * @param username The username of the osu!droid account.
     * @returns An object containing information about the operation.
     */
    async bind(username: string): Promise<DatabaseOperationResult>;

    /**
     * Binds an osu!droid account to this Discord account.
     * 
     * @param player The `Player` instance of the osu!droid account.
     * @returns An object containing information about the operation.
     */
    async bind(player: Player): Promise<DatabaseOperationResult>;

    async bind(uidOrUsernameOrPlayer: string | number | Player): Promise<DatabaseOperationResult> {
        const player: Player = uidOrUsernameOrPlayer instanceof Player ?
            uidOrUsernameOrPlayer :
            await Player.getInformation(typeof uidOrUsernameOrPlayer === "string" ? { username: uidOrUsernameOrPlayer } : { uid: uidOrUsernameOrPlayer });

        if (!player.username) {
            return this.createOperationResult(false, "player with such uid or username is not found");
        }

        if (!this.isUidBinded(player.uid)) {
            if (this.previous_bind.length >= 2) {
                return this.createOperationResult(false, "account bind limit reached");
            }

            // Check if account has played verification map
            const score: Score = await Score.getFromHash({ uid: player.uid, hash: "0eb866a0f36ce88b21c5a3d4c3d76ab0" });

            if (!score.title) {
                return this.createOperationResult(false, "account has not played verification map. Please use `/userbind verifymap` to get the verification map");
            }

            this.previous_bind.push(player.uid);
        }

        this.uid = player.uid;
        this.username = player.username;

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    username: this.username,
                    uid: this.uid,
                    previous_bind: this.previous_bind
                }
            }
        );
    }

    /**
     * Unbinds an osu!droid account from this Discord account.
     * 
     * @param uid The uid of the osu!droid account.
     * @returns An object containing information about the operation.
     */
    async unbind(uid: number): Promise<DatabaseOperationResult> {
        if (!this.isUidBinded(uid)) {
            return this.createOperationResult(false, "uid is not binded to this Discord account");
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.previous_bind.length === 0) {
            // Kick the user from any clan
            if (this.clan) {
                const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromName(this.clan);

                if (clan) {
                    await clan.removeMember(this.discordid);

                    if (!clan.exists) {
                        await clan.notifyLeader("Hey, your Discord account has been unbinded from any osu!droid accounts! Therefore, your clan has been disbanded!");
                    }
                }
            }

            return DatabaseManager.elainaDb.collections.userBind.delete({ discordid: this.discordid });
        }

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);
        }

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    uid: this.uid,
                    username: this.username
                },
                $pull: {
                    previous_bind: uid
                }
            }
        );
    }

    /**
     * Sets the clan of this Discord account.
     * 
     * @param name The name of the clan.
     */
    async setClan(name: string): Promise<DatabaseOperationResult> {
        this.clan = name;

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    clan: this.clan
                }
            }
        );
    }

    /**
     * Determines whether a uid has been binded to this Discord account.
     * 
     * @param uid The uid to determine.
     */
    isUidBinded(uid: number): boolean {
        return this.previous_bind.includes(uid);
    }
}