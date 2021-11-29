import { MessageOptions, Snowflake, TextChannel } from "discord.js";
import { UpdateQuery } from "mongodb";
import { MapInfo, rankedStatus } from "osu-droid";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Constants } from "@alice-core/Constants";
import { Manager } from "@alice-utils/base/Manager";
import { WhitelistStatus } from "@alice-types/dpp/WhitelistStatus";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";

/**
 * A manager for whitelisted and blacklisted beatmaps.
 */
export abstract class WhitelistManager extends Manager {
    /**
     * The log channel for whitelist.
     */
    static whitelistLogChannel: TextChannel;

    /**
     * The ID of the role that permits whitelisting actions.
     */
    static readonly whitelistRole: Snowflake = "551662273962180611";

    /**
     * Initializes the manager.
     */
    static override async init(): Promise<void> {
        this.whitelistLogChannel = <TextChannel> await (await this.client.guilds.fetch(Constants.testingServer)).channels.fetch("638671295470370827");
    }

    /**
     * Blacklists a beatmap.
     * 
     * @param beatmap The beatmap to blacklist.
     * @param reason The reason for blacklisting the beatmap.
     * @returns An object containing information about the operation.
     */
    static async blacklist(beatmap: MapInfo, reason: string): Promise<OperationResult> {
        if (await this.isBlacklisted(beatmap.beatmapID)) {
            return this.createOperationResult(false, "Beatmap is already blacklisted");
        }

        await DatabaseManager.elainaDb.collections.mapBlacklist.insert({
            beatmapID: beatmap.beatmapID,
            reason: reason
        });

        await DPPHelper.deletePlays(beatmap.hash);

        const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(beatmap);

        await this.whitelistLogChannel.send(
            { content: MessageCreator.createAccept(`Successfully blacklisted \`${beatmap.fullTitle}\`.`), ...embedOptions }
        );

        return this.createOperationResult(true);
    }

    /**
     * Unblacklists a beatmap.
     * 
     * @param beatmap The beatmap to unblacklist.
     * @returns An object containing information about the operation.
     */
    static async unblacklist(beatmap: MapInfo): Promise<OperationResult> {
        if (!await this.isBlacklisted(beatmap.beatmapID)) {
            return this.createOperationResult(false, "Beatmap is not blacklisted");
        }

        await DatabaseManager.elainaDb.collections.mapBlacklist.delete({ beatmapID: beatmap.beatmapID });

        const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(beatmap);

        await this.whitelistLogChannel.send(
            { content: MessageCreator.createAccept(`Successfully unblacklisted \`${beatmap.fullTitle}\`.`), ...embedOptions }
        );

        return this.createOperationResult(true);
    }

    /**
     * Whitelists a beatmap.
     * 
     * @param beatmaps The beatmap to whitelist.
     * @returns An object containing information about the operation.
     */
    static async whitelist(beatmap: MapInfo): Promise<OperationResult> {
        if (!this.isEligibleForWhitelist(beatmap)) {
            return this.createOperationResult(false, "Beatmap is not graveyarded");
        }

        const updateQuery: UpdateQuery<DatabaseMapWhitelist> = {
            $set: {
                hashid: beatmap.hash,
                mapname: beatmap.fullTitle,
                diffstat: {
                    cs: beatmap.cs,
                    ar: beatmap.ar,
                    od: beatmap.od,
                    hp: beatmap.hp,
                    sr: parseFloat(beatmap.totalDifficulty.toFixed(2)),
                    bpm: beatmap.bpm
                }
            }
        };

        await DatabaseManager.elainaDb.collections.mapWhitelist.update(
            { mapid: beatmap.beatmapID }, updateQuery, { upsert: true }
        );

        const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(beatmap);

        await this.whitelistLogChannel.send(
            { content: MessageCreator.createAccept(`Successfully whitelisted \`${beatmap.fullTitle}\`.`), ...embedOptions }
        );

        return this.createOperationResult(true);
    }

    /**
     * Unwhitelists a beatmap.
     * 
     * @param beatmap The beatmap to unwhitelist.
     * @returns An object containing information about the operation.
     */
    static async unwhitelist(beatmap: MapInfo): Promise<OperationResult> {
        if (!this.isEligibleForWhitelist(beatmap)) {
            return this.createOperationResult(false, "Beatmap is not graveyarded");
        }

        await DatabaseManager.elainaDb.collections.mapWhitelist.delete({ mapid: beatmap.beatmapID });

        await DPPHelper.deletePlays(beatmap.hash);

        const embedOptions: MessageOptions = EmbedCreator.createBeatmapEmbed(beatmap);

        await this.whitelistLogChannel.send(
            { content: MessageCreator.createAccept(`Successfully unwhitelisted \`${beatmap.fullTitle}\`.`), ...embedOptions }
        );

        return this.createOperationResult(true);
    }

    /**
     * Checks if a beatmap is whitelisted.
     * 
     * @param hash The MD5 hash of the beatmap.
     * @returns Whether the beatmap is whitelisted.
     */
    static async getBeatmapWhitelistStatus(hash: string): Promise<WhitelistStatus> {
        const entry: MapWhitelist | null = await DatabaseManager.elainaDb.collections.mapWhitelist.getOne({ hashid: hash }, { projection: { hashid: 1 } });

        if (!entry) {
            return "not whitelisted";
        }

        if (entry.hashid === hash) {
            return "updated";
        } else {
            return "whitelisted";
        }
    }

    /**
     * Determines whether a beatmap needs to be whitelisted
     * to be submitted into the droid pp system.
     * @param status 
     */
    static beatmapNeedsWhitelisting(status: rankedStatus): boolean {
        return status === rankedStatus.QUALIFIED || status <= rankedStatus.PENDING;
    }

    /**
     * Checks if a beatmap is blacklisted.
     * 
     * @param beatmapID The ID of the beatmap.
     * @returns Whether the beatmap is blacklisted.
     */
    static async isBlacklisted(beatmapID: number): Promise<boolean> {
        return !!await DatabaseManager.elainaDb.collections.mapBlacklist.getOne({ beatmapID: beatmapID });
    }

    /**
     * Checks if a beatmap is eligible to be whitelisted.
     * 
     * @param beatmap The beatmap.
     * @returns Whether the beatmap is eligible.
     */
    private static isEligibleForWhitelist(beatmap: MapInfo): boolean {
        return beatmap.approved === rankedStatus.GRAVEYARD;
    }
}