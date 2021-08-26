import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from '../utils/MapStats';
import { Parser } from '../beatmap/Parser';
import { DroidStarRating } from '../difficulty/DroidStarRating';
import { OsuStarRating } from '../difficulty/OsuStarRating';
import { Mod } from '../mods/Mod';

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class MapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    readonly droidStars: DroidStarRating = new DroidStarRating();

    /**
     * The osu!standard star rating of the beatmap.
     */
    readonly pcStars: OsuStarRating = new OsuStarRating();

    /**
     * Calculates the star rating of a beatmap.
     * 
     * The beatmap will be automatically parsed using parser utilities.
     */
    calculate(params: {
        /**
         * The .osu file of the beatmap.
         */
        file: string,

        /**
         * Applied modifications in osu!standard format.
         */
        mods?: Mod[],

        /**
         * Custom map statistics to apply speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }): MapStars {
        if (!params.file) {
            throw new Error("Please enter an osu file!");
        }

        const mod: Mod[] = params.mods ?? [];

        // Wish JavaScript has an actual clone method...
        const droidParser: Parser = new Parser();
        const pcParser: Parser = new Parser();
        try {
            droidParser.parse(params.file, mod);
            pcParser.parse(params.file, mod);
        } catch (e) {
            console.log("Invalid osu file");
            return this;
        }

        const droidMap: Beatmap = droidParser.map;
        const pcMap: Beatmap = pcParser.map;

        const stats: MapStats = new MapStats({
            speedMultiplier: params.stats?.speedMultiplier || 1,
            isForceAR: params.stats?.isForceAR || false,
            oldStatistics: params.stats?.oldStatistics || false
        });

        this.droidStars.calculate({map: droidMap, mods: mod, stats});
        this.pcStars.calculate({map: pcMap, mods: mod, stats});

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droidStars.toString()}\n${this.pcStars.toString()}`;
    }
}