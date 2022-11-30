import { CachedDifficultyAttributes } from "@alice-structures/difficultyattributes/CachedDifficultyAttributes";
import { DifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributes as RebalanceDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { access, mkdir, writeFile } from "fs/promises";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Collection } from "discord.js";
import { MapInfo, Mod, Modes } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";

/**
 * A cache manager for difficulty attributes.
 */
export abstract class DifficultyAttributesCacheManager<
    T extends DifficultyAttributes | RebalanceDifficultyAttributes
> {
    /**
     * The type of the attribute.
     */
    protected abstract readonly attributeType: PPCalculationMethod;

    /**
     * The gamemode at which the difficulty attribute is stored for.
     */
    protected abstract readonly mode: Modes;

    /**
     * The difficulty attributes cache.
     */
    private readonly cache: Collection<number, CachedDifficultyAttributes<T>> =
        new Collection();

    /**
     * The cache that needs to be saved to disk.
     */
    private readonly cacheToSave: Collection<
        number,
        CachedDifficultyAttributes<T>
    > = new Collection();

    private ensuredDirectoryExists: boolean = false;

    private get folderPath(): string {
        let attributeTypeFolder: string;
        let gamemodeFolder: string;

        switch (this.attributeType) {
            case PPCalculationMethod.live:
                attributeTypeFolder = "live";
                break;
            case PPCalculationMethod.rebalance:
                attributeTypeFolder = "rebalance";
                break;
            case PPCalculationMethod.old:
                attributeTypeFolder = "old";
                break;
        }

        switch (this.mode) {
            case Modes.droid:
                gamemodeFolder = "droid";
                break;
            case Modes.osu:
                gamemodeFolder = "osu";
                break;
        }

        return join(
            process.cwd(),
            "..",
            "osu-difficulty-cache",
            attributeTypeFolder,
            gamemodeFolder
        );
    }

    constructor() {
        try {
            const fileNames: string[] = readdirSync(this.folderPath);

            for (const fileName of fileNames) {
                const cache: CachedDifficultyAttributes<T> = JSON.parse(
                    readFileSync(join(this.folderPath, fileName), {
                        encoding: "utf-8",
                    })
                );
                const beatmapId = parseInt(fileName);

                this.cache.set(beatmapId, cache);
            }
        } catch {
            // If it falls into here, the directory hasn't been created.
            // It will be created later when we want to save the cache to disk, so we can ignore the error.
        }

        setInterval(async () => await this.saveToDisk(), 30 * 1000);
    }

    /**
     * Gets all difficulty attributes cache of a beatmap.
     *
     * @param beatmapInfo The information about the beatmap.
     */
    getBeatmapAttributes(
        beatmapInfo: MapInfo
    ): CachedDifficultyAttributes<T> | null {
        return this.getCache(beatmapInfo);
    }

    /**
     * Gets a specific difficulty attributes cache of a beatmap.
     *
     * @param beatmapInfo The information about the beatmap.
     * @param attributeName The name of the attribute.
     */
    getDifficultyAttributes(
        beatmapInfo: MapInfo,
        attributeName: string
    ): CacheableDifficultyAttributes<T> | null {
        return (
            this.getCache(beatmapInfo)?.difficultyAttributes[attributeName] ??
            null
        );
    }

    /**
     * Adds an attribute to the beatmap difficulty cache.
     *
     * @param beatmapInfo The information about the beatmap.
     * @param difficultyAttributes The difficulty attributes to add.
     * @param strainGraphImage The image of the strain graph.
     * @param oldStatistics Whether the difficulty attributes uses old statistics (pre-1.6.8 pre-release).
     * @param customSpeedMultiplier The custom speed multiplier that was used to generate the attributes.
     * @param customForceAR The custom force AR that was used to generate the attributes.
     * @returns The difficulty attributes that were cached.
     */
    addAttribute(
        beatmapInfo: MapInfo,
        difficultyAttributes: T,
        oldStatistics: boolean = false,
        customSpeedMultiplier: number = 1,
        customForceAR?: number
    ): CacheableDifficultyAttributes<T> {
        const cache: CachedDifficultyAttributes<T> = this.getBeatmapAttributes(
            beatmapInfo
        ) ?? {
            lastUpdate: Date.now(),
            difficultyAttributes: {},
        };

        const attributeName: string = this.getAttributeName(
            difficultyAttributes.mods,
            oldStatistics,
            customSpeedMultiplier,
            customForceAR
        );

        cache.difficultyAttributes[attributeName] = {
            ...difficultyAttributes,
            mods: undefined,
        };

        this.cache.set(beatmapInfo.beatmapID, cache);
        this.cacheToSave.set(beatmapInfo.beatmapID, cache);

        return cache.difficultyAttributes[attributeName];
    }

    /**
     * Constructs an attribute name based on the given parameters.
     *
     * @param mods The mods to construct with.
     * @param oldStatistics Whether the attribute uses old statistics (pre-1.6.8 pre-release).
     * @param customSpeedMultiplier The custom speed multiplier to construct with.
     * @param customForceAR The custom force AR to construct with.
     */
    getAttributeName(
        mods: Mod[] = [],
        oldStatistics: boolean = false,
        customSpeedMultiplier: number = 1,
        customForceAR?: number
    ): string {
        let attributeName: string = "";

        switch (this.mode) {
            case Modes.droid:
                attributeName += StringHelper.sortAlphabet(
                    mods.reduce((a, m) => {
                        if (!m.isApplicableToDroid()) {
                            return a;
                        }

                        return a + m.droidString;
                    }, "") || "-"
                );
                break;
            case Modes.osu:
                attributeName += mods.reduce((a, m) => {
                    if (!m.isApplicableToOsu()) {
                        return a;
                    }

                    return a | m.bitwise;
                }, 0);
        }

        if (customSpeedMultiplier !== 1) {
            attributeName += ` - ${customSpeedMultiplier.toFixed(2)}x`;
        }

        if (customForceAR) {
            attributeName += ` - AR${customForceAR}`;
        }

        if (oldStatistics) {
            attributeName += " - oldStatistics";
        }

        return attributeName;
    }

    /**
     * Saves the cache that needs to be saved to the disk.
     */
    private async saveToDisk(): Promise<void> {
        await this.ensureDirectoryExists();

        for (const [beatmapId, cache] of this.cacheToSave) {
            await writeFile(
                join(this.folderPath, `${beatmapId}.json`),
                JSON.stringify(cache)
            );
        }

        this.cacheToSave.clear();
    }

    /**
     * Ensures that a directory for the cache exists.
     */
    private async ensureDirectoryExists(): Promise<void> {
        if (this.ensuredDirectoryExists) {
            return;
        }

        this.ensuredDirectoryExists = true;

        try {
            await access(this.folderPath);
        } catch {
            await mkdir(this.folderPath, { recursive: true });
        }
    }

    /**
     * Gets a specific difficulty attributes cache of a beatmap.
     *
     * Includes logic to invalidate the beatmap's cache if it's no longer valid.
     *
     * @param beatmapInfo The information about the beatmap.
     */
    private getCache(
        beatmapInfo: MapInfo
    ): CachedDifficultyAttributes<T> | null {
        const cache: CachedDifficultyAttributes<T> | undefined = this.cache.get(
            beatmapInfo.beatmapID
        );

        if (!cache) {
            return null;
        }

        if (cache.lastUpdate < beatmapInfo.lastUpdate.getTime()) {
            this.invalidateCache(beatmapInfo.beatmapID);
            return null;
        }

        return cache;
    }

    /**
     * Invalidates a difficulty attributes cache.
     *
     * @param beatmapId The ID of the beatmap to invalidate.
     */
    private invalidateCache(beatmapId: number): void {
        const cache: CachedDifficultyAttributes<T> | undefined =
            this.cache.get(beatmapId);

        if (!cache) {
            return;
        }

        cache.lastUpdate = Date.now();
        cache.difficultyAttributes = {};

        this.cacheToSave.set(beatmapId, cache);
    }
}
