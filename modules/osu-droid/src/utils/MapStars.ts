import { StandardDiff } from '../difficulty/StandardDiff';
import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from './MapStats';
import { modes } from '../constants/modes';
import { mods } from './mods';
import { Parser } from './Parser';

/**
 * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
 */
export class MapStars {
    /**
     * The osu!droid star rating of the beatmap.
     */
    public readonly droidStars: StandardDiff;

    /**
     * The osu!standard star rating of the beatmap.
     */
    public readonly pcStars: StandardDiff;

    constructor() {
        this.droidStars = new StandardDiff();
        this.pcStars = new StandardDiff();
    }
    /**
     * Calculates the star rating of a beatmap.
     * 
     * The beatmap will be automatically parsed using parser utilities.
     */
    calculate(params: {
        file: string,
        mods?: string
    }): MapStars {
        if (!params.file) {
            throw new TypeError("Please enter an osu file!");
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
            cs: droidMap.cs,
            ar: droidMap.ar,
            od: droidMap.od,
            hp: droidMap.hp,
            mods: mod
        }).calculate({mode: modes.droid});

        let droidMod: number = mods.modbitsFromString(mod);
        if (!(droidMod & mods.osuMods.td)) {
            droidMod += mods.osuMods.td;
        }
        droidMod -= droidMod & (mods.osuMods.hr | mods.osuMods.ez);
        const convertedDroidMod: string = mods.modbitsToString(droidMod);

        droidMap.cs = stats.cs as number;
        droidMap.ar = stats.ar as number;
        droidMap.od = stats.od as number;

        this.droidStars.calculate({mode: modes.droid, map: droidMap, mods: convertedDroidMod});
        this.pcStars.calculate({mode: modes.osu, map: pcMap, mods: mod});

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString() {
        return `${this.droidStars.toString()}\n${this.pcStars.toString()}`;
    }
}