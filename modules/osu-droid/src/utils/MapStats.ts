import { mods } from './mods';
import { modes } from '../constants/modes';
import { DroidHitWindow } from '../utils/HitWindow';

/**
 * Holds general beatmap statistics for further modifications. 
 */
export class MapStats {
    /**
     * The circle size of the beatmap.
     */
    cs?: number;

    /**
     * The approach rate of the beatmap.
     */
    ar?: number;

    /**
     * The overall difficulty of the beatmap.
     */
    od?: number;

    /**
     * The health drain rate of the beatmap.
     */
    hp?: number;

    /**
     * The enabled modifications in osu!standard string.
     */
    mods: string;

    /**
     * The bitwise enum of enabled modifications for osu!droid.
     */
    droidMods: number;

    /**
     * The bitwise enum of enabled modifications for osu!standard.
     */
    pcMods: number;

    /**
     * The speed multiplier applied from all modifications.
     */
    speedMultiplier: number;

    /**
     * Whether or not this map statistics uses forced AR.
     */
    isForceAR: boolean;

    static readonly OD0_MS: number = 80;
    static readonly OD10_MS: number = 20;
    static readonly AR0_MS: number = 1800;
    static readonly AR5_MS: number = 1200;
    static readonly AR10_MS: number = 450;

    static readonly OD_MS_STEP: number = (MapStats.OD0_MS - MapStats.OD10_MS) / 10;
    static readonly AR_MS_STEP1: number = (MapStats.AR0_MS - MapStats.AR5_MS) / 5;
    static readonly AR_MS_STEP2: number = (MapStats.AR5_MS - MapStats.AR10_MS) / 5;

    constructor(values: {
        /**
         * The circle size of the beatmap.
         */
        cs?: number,

        /**
         * The approach rate of the beatmap.
         */
        ar?: number,

        /**
         * The overall difficulty of the beatmap.
         */
        od?: number,

        /**
         * The health drain rate of the beatmap.
         */
        hp?: number,

        /**
         * Applied modifications in osu!standard format.
         */
        mods?: string,
        
        /**
         * The speed multiplier to calculate for.
         */
        speedMultiplier?: number,

        /**
         * Whether or not force AR is turned on.
         */
        isForceAR?: boolean
    } = {}) {
        this.cs = values.cs;
        this.ar = values.ar;
        this.od = values.od;
        this.hp = values.hp;
        this.mods = values.mods?.toUpperCase() || "";

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
        /**
         * The gamemode to calculate for. Defaults to `modes.osu`.
         */
        mode?: modes,

        /**
         * The applied modifications in osu!standard format.
         */
        mods?: string,

        /**
         * The speed multiplier to calculate for.
         */
        speedMultiplier?: number,

        /**
         * Whether or not force AR is turned on.
         */
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

        let statisticsMultiplier: number = 1;
        
        if (this.pcMods & mods.osuMods.dt) {
            this.speedMultiplier *= 1.5;
        }
        if (this.pcMods & mods.osuMods.ht) {
            this.speedMultiplier *= 0.75;
        }
        if (this.mods.includes("SU")) {
            this.speedMultiplier *= 1.25;
        }
        if (this.pcMods & mods.osuMods.hr) {
            statisticsMultiplier *= 1.4;
        }
        if (this.pcMods & mods.osuMods.ez) {
            statisticsMultiplier *= 0.5;
        }

        switch (params?.mode || modes.osu) {
            case modes.droid: {
                // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39)
                // TODO: remember to change this back after 1.6.8!
                if (this.droidMods & mods.osuMods.nc) {
                    this.speedMultiplier *= 1.39;
                }

                // CS and OD work differently in droid, therefore it
                // needs to be computed regardless of map-changing mods
                // and statistics multiplier
                if (this.od !== undefined) {
                    // apply EZ or HR to OD
                    this.od = Math.min(this.od * statisticsMultiplier, 10);

                    // convert original OD to droid OD
                    const droidToMS: number = new DroidHitWindow(this.od).hitWindowFor300(this.mods.includes("PR")) / this.speedMultiplier;
                    this.od = 5 - (droidToMS - 50) / 6;
                }

                // HR and EZ works differently in droid in terms of
                // CS modification (even CS in itself as well)
                //
                // if present mods are found, they need to be removed
                // from the bitwise enum of mods to prevent double
                // calculation
                if (this.cs !== undefined) {
                    let scale: number = ((720 / 480)
                        * (54.42 - this.cs * 4.48)
                        * 2 / 128)
                        + 0.5 * (11 - 5.2450170716245195) / 5;
                    if (this.droidMods & mods.osuMods.hr) {
                        this.droidMods -= mods.osuMods.hr;
                        scale -= 0.125;
                    }
                    if (this.droidMods & mods.osuMods.ez) {
                        this.droidMods -= mods.osuMods.ez;
                        scale += 0.125;
                    }
                    if (this.mods.includes("SC")) {
                        scale -= ((720 / 480)
                        * (54.42 - 4 * 4.48)
                        * 2 / 128);
                    }
                    // circle radius = 64 * scale
                    this.cs = Math.min(5 + (5 - 10 * scale) / 0.7, 10);
                }

                if (this.hp !== undefined) {
                    this.hp = Math.min(this.hp * statisticsMultiplier, 10);
                }

                if (this.ar !== undefined && !this.isForceAR) {
                    this.ar *= statisticsMultiplier;
                    if (this.mods.includes("RE")) {
                        if (this.droidMods & mods.osuMods.ez) {
                            this.ar *= 2;
                            this.ar -= 0.5;
                        }
                        this.ar -= 0.5;
                        this.ar -= this.speedMultiplier - 1;
                    }
                    this.ar = MapStats.modifyAR(this.ar, this.speedMultiplier, 1);
                }
                break;
            }
            case modes.osu: {
                if (!(this.pcMods & mods.osuMods.map_changing) && this.speedMultiplier === 1) {
                    break;
                }
                if (this.pcMods & mods.osuMods.nc) {
                    this.speedMultiplier *= 1.5;
                }

                if (this.cs !== undefined) {
                    if (this.pcMods & mods.osuMods.hr) {
                        this.cs *= 1.3;
                    }
                    if (this.pcMods & mods.osuMods.ez) {
                        this.cs *= 0.5;
                    }
                }

                if (this.hp !== undefined) {
                    this.hp = Math.min(this.hp * statisticsMultiplier, 10);
                }

                if (this.ar !== undefined && !this.isForceAR) {
                    this.ar = MapStats.modifyAR(this.ar, this.speedMultiplier, statisticsMultiplier);
                }
                
                if (this.od !== undefined) {
                    this.od = MapStats.modifyOD(this.od, this.speedMultiplier, statisticsMultiplier);
                }
                break;
            }
            default: throw new TypeError("Mode not supported");
        }
        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `CS: ${this.cs?.toFixed(2)}, AR: ${this.ar?.toFixed(2)}, OD: ${this.od?.toFixed(2)}, HP: ${this.hp?.toFixed(2)}`;
    }

    /**
     * Utility function to apply speed and flat multipliers to stats where speed changes apply for AR.
     * 
     * @param baseAR The base AR value.
     * @param speedMultiplier The speed multiplier to calculate.
     * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
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
     * 
     * @param baseOD The base OD value.
     * @param speedMultiplier The speed multiplier to calculate.
     * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
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