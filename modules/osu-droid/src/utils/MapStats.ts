import { mods } from './mods';
import { modes } from '../constants/modes';

/**
 * Holds general beatmap statistics for further modifications. 
 */
export class MapStats {
    /**
     * The circle size of the beatmap.
     */
    public cs?: number;

    /**
     * The approach rate of the beatmap.
     */
    public ar?: number;

    /**
     * The overall difficulty of the beatmap.
     */
    public od?: number;

    /**
     * The health drain rate of the beatmap.
     */
    public hp?: number;

    /**
     * The enabled modifications in osu!standard string.
     */
    public mods: string;

    /**
     * The bitwise enum of enabled modifications for osu!droid.
     */
    public droidMods: number;

    /**
     * The bitwise enum of enabled modifications for osu!standard.
     */
    public pcMods: number;

    /**
     * The speed multiplier applied from all modifications.
     */
    public speedMultiplier: number;

    /**
     * Whether or not this map statistics uses forced AR.
     */
    public isForceAR: boolean;

    public static readonly OD0_MS: number = 80;
    public static readonly OD10_MS: number = 20;
    public static readonly AR0_MS: number = 1800;
    public static readonly AR5_MS: number = 1200;
    public static readonly AR10_MS: number = 450;

    public static readonly OD_MS_STEP: number = (MapStats.OD0_MS - MapStats.OD10_MS) / 10;
    public static readonly AR_MS_STEP1: number = (MapStats.AR0_MS - MapStats.AR5_MS) / 5;
    public static readonly AR_MS_STEP2: number = (MapStats.AR5_MS - MapStats.AR10_MS) / 5;

    constructor(values: {
        cs?: number,
        ar?: number,
        od?: number,
        hp?: number,
        mods?: string,
        speedMultiplier?: number,
        isForceAR?: boolean
    } = {}) {
        this.cs = values.cs;
        this.ar = values.ar;
        this.od = values.od;
        this.hp = values.hp;
        this.mods = values.mods !== undefined ? values.mods.toUpperCase() : "";

        this.droidMods = this.mods ? mods.modbitsFromString(this.mods) : 0;
        this.pcMods = this.droidMods;

        // apply TD mod to droid bitwise enum if it hasn't
        // been applied
        if (!(this.droidMods & mods.osuMods.td)) {
            this.droidMods += mods.osuMods.td;
        }

        this.speedMultiplier = values.speedMultiplier || 1;
        this.isForceAR = values.isForceAR || false;
    }

    /**
     * Calculates map statistics with mods applied.
     */
    calculate(params?: {
        mode?: modes,
        mods?: string,
        speedMultiplier?: number,
        isForceAR?: boolean
    }): MapStats {
        if (params) {
            if (params.mods) {
                this.mods = params.mods;
            }
            if (params.speedMultiplier) {
                this.speedMultiplier = params.speedMultiplier;
            }
            if (params.isForceAR) {
                this.isForceAR = params.isForceAR;
            }
        }
        const mode: modes = params?.mode || modes.osu;
        const stats: MapStats = new MapStats(this);

        let statisticsMultiplier: number = 1;
        
        if (stats.pcMods & mods.osuMods.dt) {
            stats.speedMultiplier *= 1.5;
        }
        if (stats.pcMods & mods.osuMods.ht) {
            stats.speedMultiplier *= 0.75;
        }
        if (stats.mods.includes("SU")) {
            stats.speedMultiplier *= 1.25;
        }
        if (stats.pcMods & mods.osuMods.hr) {
            statisticsMultiplier *= 1.4;
        }
        if (stats.pcMods & mods.osuMods.ez) {
            statisticsMultiplier *= 0.5;
        }

        switch (mode) {
            case modes.droid: {
                // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39)
                // TODO: remember to change this back after 1.6.8!
                if (stats.droidMods & mods.droidMods.c) {
                    stats.speedMultiplier *= 1.39;
                }

                // CS and OD work differently in droid, therefore it
                // needs to be computed regardless of map-changing mods
                // and statistics multiplier
                if (stats.od !== undefined) {
                    // apply EZ or HR to OD
                    stats.od = Math.min(stats.od * statisticsMultiplier, 10);

                    // convert original OD to droid OD
                    let droidToMS: number = 75 + 5 * (5 - stats.od);
                    if (stats.mods.includes("PR")) {
                        droidToMS = 55 + 6 * (5 - stats.od);
                    }

                    // separate handling for speed-changing OD due to
                    // bug in modifyOD function and the way droid OD
                    // works
                    droidToMS /= stats.speedMultiplier;
                    stats.od = 5 - (droidToMS - 50) / 6;
                }

                // HR and EZ works differently in droid in terms of
                // CS modification, instead of CS *= 1.3 or CS *= 0.5,
                // it is incremented or decremented
                //
                // if present mods are found, they need to be removed
                // from the bitwise enum of mods to prevent double
                // calculation
                if (stats.cs !== undefined) {
                    if (stats.droidMods & mods.droidMods.r) {
                        stats.droidMods -= mods.droidMods.r;
                        ++stats.cs;
                    }
                    if (stats.droidMods & mods.droidMods.e) {
                        stats.droidMods -= mods.droidMods.e;
                        --stats.cs;
                    }
                    if (!stats.mods.includes("SC")) {
                        stats.cs -= 4;
                    }
                    stats.cs = Math.min(stats.cs, 10);
                }

                if (stats.hp !== undefined) {
                    stats.hp = Math.min(stats.hp * statisticsMultiplier, 10);
                }

                if (stats.ar !== undefined && !stats.isForceAR) {
                    stats.ar *= statisticsMultiplier;
                    if (stats.mods.includes("RE")) {
                        if (stats.droidMods & mods.droidMods.e) {
                            stats.ar *= 2;
                            stats.ar -= 0.5;
                        }
                        stats.ar -= 0.5;
                        stats.ar -= stats.speedMultiplier - 1;
                    }
                    stats.ar = MapStats.modifyAR(stats.ar, stats.speedMultiplier, 1);
                }
                break;
            }
            case modes.osu: {
                if (!(stats.pcMods & mods.osuMods.map_changing) && stats.speedMultiplier === 1) {
                    break;
                }
                if (stats.pcMods & mods.osuMods.nc) {
                    stats.speedMultiplier *= 1.5;
                }

                if (stats.cs !== undefined) {
                    if (stats.pcMods & mods.osuMods.hr) {
                        stats.cs *= 1.3;
                    }
                    if (stats.pcMods & mods.osuMods.ez) {
                        stats.cs *= 0.5;
                    }
                    stats.cs = Math.min(stats.cs, 10);
                }

                if (stats.hp !== undefined) {
                    stats.hp = Math.min(stats.hp * statisticsMultiplier, 10);
                }

                if (stats.ar !== undefined && !stats.isForceAR) {
                    stats.ar = MapStats.modifyAR(stats.ar, stats.speedMultiplier, statisticsMultiplier);
                }
                
                if (stats.od !== undefined) {
                    stats.od = MapStats.modifyOD(stats.od, stats.speedMultiplier, statisticsMultiplier);
                }
                break;
            }
            default: throw new TypeError("Mode not supported");
        }
        return stats;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `CS: ${this.cs?.toFixed(2)}, AR: ${this.ar?.toFixed(2)}, OD: ${this.od?.toFixed(2)}, HP: ${this.hp?.toFixed(2)}`
    }

    /**
     * Utility function to apply speed and flat multipliers to stats where speed changes apply for AR.
     */
    static modifyAR(baseAR: number, speedMultiplier: number, statisticsMultiplier: number): number {
        let ar: number = baseAR;
        ar *= statisticsMultiplier;
        let arMS: number = (
            ar < 5.0 ?
                this.AR0_MS - this.AR_MS_STEP1 * ar
                : this.AR5_MS - this.AR_MS_STEP2 * (ar - 5)
        );
        arMS = Math.min(this.AR0_MS, Math.max(this.AR10_MS, arMS));
        arMS /= speedMultiplier;
        ar = (
            arMS > this.AR5_MS ?
                (this.AR0_MS - arMS) / this.AR_MS_STEP1
                : 5 + (this.AR5_MS - arMS) / this.AR_MS_STEP2
        );
        return ar;
    }

    /**
     * Utility function to apply speed and flat multipliers to stats where speed changes apply for OD.
     */
    static modifyOD(baseOD: number, speedMultiplier: number, statisticsMultiplier: number): number {
        let od: number = baseOD;
        od *= statisticsMultiplier;
        let odMS: number = this.OD0_MS - Math.ceil(this.OD_MS_STEP * od);
        odMS = Math.min(this.OD0_MS, Math.max(this.OD10_MS, odMS));
        odMS /= speedMultiplier;
        od = (this.OD0_MS - odMS) / this.OD_MS_STEP;
        return od;
    }
}