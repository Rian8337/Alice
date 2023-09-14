import { BaseMessageOptions, Snowflake, TextChannel } from "discord.js";
import { MapInfo, RankedStatus } from "@rian8337/osu-base";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseMapWhitelist } from "structures/database/elainaDb/DatabaseMapWhitelist";
import { OperationResult } from "structures/core/OperationResult";
import { Constants } from "@alice-core/Constants";
import { Manager } from "@alice-utils/base/Manager";
import { WhitelistStatus } from "structures/dpp/WhitelistStatus";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { UpdateFilter } from "mongodb";
import { WhitelistManagerLocalization } from "@alice-localization/utils/managers/WhitelistManager/WhitelistManagerLocalization";
import { Language } from "@alice-localization/base/Language";

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
        this.whitelistLogChannel = <TextChannel>(
            await (
                await this.client.guilds.fetch(Constants.mainServer)
            ).channels.fetch("1068886504866324620")
        );
    }

    /**
     * Blacklists a beatmap.
     *
     * @param beatmap The beatmap to blacklist.
     * @param reason The reason for blacklisting the beatmap.
     * @param language The locale of the user who attemped to blacklist the beatmap. Defaults to English.
     * @returns An object containing information about the operation.
     */
    static async blacklist(
        beatmap: MapInfo,
        reason: string,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: WhitelistManagerLocalization =
            this.getLocalization(language);

        if (await this.isBlacklisted(beatmap.beatmapID)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapIsBlacklisted"),
            );
        }

        await DatabaseManager.elainaDb.collections.mapBlacklist.insert({
            beatmapID: beatmap.beatmapID,
            reason: reason,
        });

        await DPPHelper.deletePlays(beatmap.hash);

        const embedOptions: BaseMessageOptions =
            EmbedCreator.createBeatmapEmbed(beatmap, undefined, language);

        await this.whitelistLogChannel.send({
            content: MessageCreator.createAccept(
                `Successfully blacklisted \`${beatmap.fullTitle}\`.`,
            ),
            ...embedOptions,
        });

        return this.createOperationResult(true);
    }

    /**
     * Unblacklists a beatmap.
     *
     * @param beatmap The beatmap to unblacklist.
     * @param language The locale of the user who attempted to unblacklist the beatmap. Defaults to English.
     * @returns An object containing information about the operation.
     */
    static async unblacklist(
        beatmap: MapInfo,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: WhitelistManagerLocalization =
            this.getLocalization(language);

        if (!(await this.isBlacklisted(beatmap.beatmapID))) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapIsNotGraveyarded"),
            );
        }

        await DatabaseManager.elainaDb.collections.mapBlacklist.deleteOne({
            beatmapID: beatmap.beatmapID,
        });

        const embedOptions: BaseMessageOptions =
            EmbedCreator.createBeatmapEmbed(beatmap, undefined, language);

        await this.whitelistLogChannel.send({
            content: MessageCreator.createAccept(
                `Successfully unblacklisted \`${beatmap.fullTitle}\`.`,
            ),
            ...embedOptions,
        });

        return this.createOperationResult(true);
    }

    /**
     * Whitelists a beatmap.
     *
     * @param beatmaps The beatmap to whitelist.
     * @param language The locale of the user who attempted to blacklist the beatmap. Defaults to English.
     * @returns An object containing information about the operation.
     */
    static async whitelist(
        beatmap: MapInfo,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: WhitelistManagerLocalization =
            this.getLocalization(language);

        if (!this.isEligibleForWhitelist(beatmap.approved)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapIsNotGraveyarded"),
            );
        }

        if (beatmap.totalDifficulty === null) {
            return this.createOperationResult(
                false,
                localization.getTranslation("invalidBeatmapDifficulty"),
            );
        }

        const updateQuery: UpdateFilter<DatabaseMapWhitelist> = {
            $set: {
                hashid: beatmap.hash,
                mapname: beatmap.fullTitle,
                diffstat: {
                    cs: beatmap.cs,
                    ar: beatmap.ar,
                    od: beatmap.od,
                    hp: beatmap.hp,
                    sr: parseFloat(beatmap.totalDifficulty.toFixed(2)),
                    bpm: beatmap.bpm,
                },
            },
        };

        await DatabaseManager.elainaDb.collections.mapWhitelist.updateOne(
            { mapid: beatmap.beatmapID },
            updateQuery,
            { upsert: true },
        );

        const embedOptions: BaseMessageOptions =
            EmbedCreator.createBeatmapEmbed(beatmap, undefined, language);

        await this.whitelistLogChannel.send({
            content: MessageCreator.createAccept(
                `Successfully whitelisted \`${beatmap.fullTitle}\`.`,
            ),
            ...embedOptions,
        });

        return this.createOperationResult(true);
    }

    /**
     * Unwhitelists a beatmap.
     *
     * @param beatmap The beatmap to unwhitelist.
     * @param language The locale of the user who attempted to unwhitelist the beatmap.
     * @returns An object containing information about the operation.
     */
    static async unwhitelist(
        beatmap: MapInfo,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: WhitelistManagerLocalization =
            this.getLocalization(language);

        if (!this.isEligibleForWhitelist(beatmap.approved)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapIsNotGraveyarded"),
            );
        }

        await DatabaseManager.elainaDb.collections.mapWhitelist.deleteOne({
            mapid: beatmap.beatmapID,
        });

        await DPPHelper.deletePlays(beatmap.hash);

        const embedOptions: BaseMessageOptions =
            EmbedCreator.createBeatmapEmbed(beatmap, undefined, language);

        await this.whitelistLogChannel.send({
            content: MessageCreator.createAccept(
                `Successfully unwhitelisted \`${beatmap.fullTitle}\`.`,
            ),
            ...embedOptions,
        });

        return this.createOperationResult(true);
    }

    /**
     * Checks if a beatmap is whitelisted.
     *
     * @param hash The MD5 hash of the beatmap.
     * @returns Whether the beatmap is whitelisted.
     */
    static async getBeatmapWhitelistStatus(
        hash: string,
    ): Promise<WhitelistStatus> {
        const entry: MapWhitelist | null =
            await DatabaseManager.elainaDb.collections.mapWhitelist.getOne(
                { hashid: hash },
                { projection: { hashid: 1 } },
            );

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
    static beatmapNeedsWhitelisting(status: RankedStatus): boolean {
        return (
            status === RankedStatus.qualified || status <= RankedStatus.pending
        );
    }

    /**
     * Checks if a beatmap is blacklisted.
     *
     * @param beatmapID The ID of the beatmap.
     * @returns Whether the beatmap is blacklisted.
     */
    static async isBlacklisted(beatmapID: number): Promise<boolean> {
        return !!(await DatabaseManager.elainaDb.collections.mapBlacklist.getOne(
            { beatmapID: beatmapID },
        ));
    }

    /**
     * Checks if a beatmap's ranked status is eligible to be whitelisted.
     *
     * @param status The ranked status.
     * @returns Whether the beatmap with the ranked status is eligible.
     */
    private static isEligibleForWhitelist(status: RankedStatus): boolean {
        return status === RankedStatus.graveyard;
    }

    /**
     * Gets the localization of this manager.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): WhitelistManagerLocalization {
        return new WhitelistManagerLocalization(language);
    }
}
