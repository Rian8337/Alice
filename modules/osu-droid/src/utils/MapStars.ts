import { StandardDiff } from '../difficulty/StandardDiff';
import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from './MapStats';
import { modes } from '../constants/modes';
import { Parser } from './Parser';

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class MapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    public readonly droidStars: StandardDiff = new StandardDiff();

    /**
     * The osu!standard star rating of the beatmap.
     */
    public readonly pcStars: StandardDiff = new StandardDiff();

    /**
     * Calculates the star rating of a beatmap.
     * 
     * The beatmap will be automatically parsed using parser utilities.
     */
    calculate(params: {
        file: string,
        mods?: string,
        stats?: MapStats
    }): MapStars {
        if (!params.file) {
            throw new Error("Please enter an osu file!");
        }
        const droidParser: Parser = new Parser();
        const pcParser: Parser = new Parser();
        try {
            droidParser.parse(params.file);
            pcParser.parse(params.file);
        } catch (e) {
            console.log("Invalid osu file");
            return this;
        }
        const droidMap: Beatmap = droidParser.map;
        const pcMap: Beatmap = pcParser.map;

        const mod: string = params.mods || "";

        const stats: MapStats = new MapStats({
            speedMultiplier: params.stats?.speedMultiplier || 1,
            isForceAR: params.stats?.isForceAR || false
        });

        this.droidStars.calculate({mode: modes.droid, map: droidMap, mods: mod, stats: stats});
        this.pcStars.calculate({mode: modes.osu, map: pcMap, mods: mod, stats: stats});

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droidStars.toString()}\n${this.pcStars.toString()}`;
    }
}