import { StarRating } from '../difficulty/StarRating';
import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from '../utils/MapStats';
import { modes } from '../constants/modes';
import { Parser } from '../beatmap/Parser';

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class MapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    readonly droidStars: StarRating = new StarRating();

    /**
     * The osu!standard star rating of the beatmap.
     */
    readonly pcStars: StarRating = new StarRating();

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
        mods?: string,

        /**
         * Custom map statistics to apply speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }): MapStars {
        if (!params.file) {
            throw new Error("Please enter an osu file!");
        }
        
        const parser: Parser = new Parser();
        try {
            parser.parse(params.file);
        } catch (e) {
            console.log("Invalid osu file");
            return this;
        }

        // Copy original parser without having to parse a new beatmap, this way
        // droidMap and pcMap will not reference to the same parser instance
        const droidMap: Beatmap = Object.create(parser).map;
        const pcMap: Beatmap = Object.create(parser).map;

        const mod: string = params.mods || "";

        const stats: MapStats = new MapStats({
            speedMultiplier: params.stats?.speedMultiplier || 1,
            isForceAR: params.stats?.isForceAR || false,
            oldStatistics: params.stats?.oldStatistics || false
        });

        this.droidStars.calculate({mode: modes.droid, map: droidMap, mods: mod, stats});
        this.pcStars.calculate({mode: modes.osu, map: pcMap, mods: mod, stats});

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droidStars.toString()}\n${this.pcStars.toString()}`;
    }
}