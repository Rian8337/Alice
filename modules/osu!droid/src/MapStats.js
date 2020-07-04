const mods = require('./mods');

class MapStats {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} [values.cs] The circle size of the beatmap.
     * @param {number} [values.ar] The approach rate of the beatmap.
     * @param {number} [values.od] The overall difficulty of the beatmap.
     * @param {number} [values.hp] The health drain rate of the beatmap.
     * @param {string} [values.mods] The enabled modifications in osu!standard string. This will be automatically converted to droid modbits (TouchDevice mod will be automatically applied if haven't already) and PC modbits.
     */
    constructor(values = {}) {
        /**
         * @type {number|undefined}
         * @description The circle size of the beatmap.
         */
        this.cs = values.cs;

        /**
         * @type {number|undefined}
         * @description The approach rate of the beatmap.
         */
        this.ar = values.ar;

        /**
         * @type {number|undefined}
         * @description The overall difficulty of the beatmap.
         */
        this.od = values.od;

        /**
         * @type {number|undefined}
         * @description The health drain rate of the beatmap.
         */
        this.hp = values.hp;

        /**
         * @type {string}
         * @description The enabled modifications in osu!standard string.
         */
        this.mods = values.mods;
        if (this.mods === undefined) {
            this.mods = ''
        }

        this.mods = this.mods.toUpperCase();

        /**
         * @type {number}
         * @description The bitwise enum of enabled modifications for osu!droid.
         */
        this.droid_mods = this.mods ? mods.modbits_from_string(this.mods) : 0;

        /**
         * @type {number}
         * @description The bitwise enum of enabled modifications for osu!standard.
         */
        this.pc_mods = this.droid_mods;

        // apply TD mod to droid bitwise enum if it hasn't
        // been applied
        if (!(this.droid_mods & mods.td)) {
            this.droid_mods += mods.td;
        }
        this.speed_multiplier = 1;
    }

    /**
     * Calculates map statistics with mods applied.
     *
     * @param {Object} params
     * @param {string} [params.mode=osu] Whether to convert for droid statistics or PC statistics.
     * @param {string} [params.mods] Applied modifications in osu!standard string. Can be omitted if ths has been applied in the constructor.
     * @returns {MapStats} A new MapStats instance containing calculated map statistics.
     */
    calculate(params = {}) {
        if (params.mods) {
            this.mods = params.mods;
        }
        let mode = params.mode || "osu";
        let stats = new MapStats(this);
        let od_ar_hp_multiplier = 1;
        if ((stats.droid_mods & mods.d) | (stats.pc_mods & mods.dt)) {
            stats.speed_multiplier = 1.5;
        }
        if ((stats.droid_mods & mods.t) | (stats.pc_mods & mods.ht)) {
            stats.speed_multiplier *= 0.75;
        }
        if (stats.mods.includes("SU")) {
            stats.speed_multiplier = 1.25;
        }
        if ((stats.droid_mods & mods.r) | (stats.pc_mods & mods.hr)) {
            od_ar_hp_multiplier = 1.4;
        }
        if ((stats.droid_mods & mods.e) | (stats.pc_mods & mods.ez)) {
            od_ar_hp_multiplier *= 0.5;
        }
        switch (mode) {
            case "osu!droid":
            case "droid": {
                // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39)
                if (stats.droid_mods & mods.c) {
                    stats.speed_multiplier = 1.39;
                }

                if (stats.mods.includes("RE")) {
                    od_ar_hp_multiplier *= 0.5;
                }

                // CS and OD work differently in droid, therefore it
                // needs to be computed regardless of map-changing mods
                // and od_ar_hp_multiplier
                if (stats.od !== undefined) {

                    // apply EZ or HR to OD
                    stats.od *= od_ar_hp_multiplier;
                    stats.od = Math.min(stats.od, 10);

                    // convert original OD to droid OD
                    let droid_to_MS = 75 + 5 * (5 - stats.od);
                    if (stats.mods.includes("PR")) {
                        droid_to_MS = 55 + 6 * (5 - stats.od);
                    }

                    // separate handling for speed-changing OD due to
                    // bug in modify_od function and the way droid OD
                    // works
                    droid_to_MS /= stats.speed_multiplier;
                    stats.od = 5 - (droid_to_MS - 50) / 6;
                }

                // HR and EZ works differently in droid in terms of
                // CS modification, instead of CS *= 1.3 or CS *= 0.5,
                // it is incremented or decremented
                //
                // if present mods are found, they need to be removed
                // from the bitwise enum of mods to prevent double
                // calculation
                if (stats.cs !== undefined) {
                    if (stats.droid_mods & mods.r) {
                        stats.droid_mods -= mods.r;
                        ++stats.cs;
                    }
                    if (stats.droid_mods & mods.e || stats.mods.includes("RE")) {
                        stats.droid_mods -= mods.e;
                        --stats.cs;
                    }
                    if (!stats.mods.includes("SC")) stats.cs -= 4;
                    stats.cs = Math.min(10, stats.cs);
                }

                if (stats.hp !== undefined) {
                    stats.hp *= od_ar_hp_multiplier;
                    stats.hp = Math.min(10, stats.hp);
                }

                if (stats.ar !== undefined) {
                    if (stats.mods.includes("RE")) {
                        if (stats.droid_mods & (mods.d | mods.c)) {
                            --stats.ar;
                        } else if (stats.mods.includes("SU")) {
                            stats.ar -= 0.75;
                        } else {
                            stats.ar -= 0.5;
                        }
                        stats.ar = modify_ar(stats.ar, stats.speed_multiplier, 1);
                    } else {
                        stats.ar = modify_ar(stats.ar, stats.speed_multiplier, od_ar_hp_multiplier);
                    }
                }
                break
            }
            case "osu!":
            case "osu": {
                if (!(stats.pc_mods & mods.map_changing) && !stats.mods.includes("SU")) {
                    return stats;
                }
                if (stats.pc_mods & mods.nc) {
                    stats.speed_multiplier = 1.5;
                }
                if (stats.cs !== undefined) {
                    if (stats.pc_mods & mods.hr) {
                        stats.cs *= 1.3;
                    }
                    if (stats.pc_mods & mods.ez) {
                        stats.cs *= 0.5;
                    }
                    stats.cs = Math.min(10, stats.cs)
                }
                if (stats.hp !== undefined) {
                    stats.hp *= od_ar_hp_multiplier;
                    stats.hp = Math.min(10, stats.hp)
                }
                if (stats.ar !== undefined) {
                    stats.ar = modify_ar(stats.ar, stats.speed_multiplier, od_ar_hp_multiplier);
                }
                if (stats.od !== undefined) {
                    stats.od = modify_od(stats.od, stats.speed_multiplier, od_ar_hp_multiplier);
                }
                break
            }
            default: throw new TypeError("Mode not supported")
        }
        return stats
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `CS: ${this.cs.toFixed(2)}, AR: ${this.ar.toFixed(2)}, OD: ${this.od.toFixed(2)}, HP: ${this.hp.toFixed(2)}`
    }
}

// (Internal)
// osu!standard stats constants
const OD0_MS = 80;
const OD10_MS = 20;
const AR0_MS = 1800.0;
const AR5_MS = 1200.0;
const AR10_MS = 450.0;

const OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
const AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
const AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;

/**
 * (Internal)
 * 
 * Utility function to apply speed and flat multipliers to stats where speed changes apply (AR).
 *
 * @param {number} base_ar The base AR of the beatmap.
 * @param {number} speed_mul The speed multiplier based on speed-changing mods.
 * @param {number} multiplier The general multiplier based on map-changing mods (EZ/HR).
 * @returns {number} The applied AR.
 */
function modify_ar(base_ar, speed_mul, multiplier) {
    let ar = base_ar;
    ar *= multiplier;
    let arms = (
        ar < 5.0 ?
            AR0_MS-AR_MS_STEP1 * ar
            : AR5_MS - AR_MS_STEP2 * (ar - 5)
    );
    arms = Math.min(AR0_MS, Math.max(AR10_MS, arms));
    arms /= speed_mul;

    ar = (
        arms > AR5_MS ?
            (AR0_MS - arms) / AR_MS_STEP1
            : 5 + (AR5_MS - arms) / AR_MS_STEP2
    );
    return ar
}

/**
 * (Internal)
 * 
 * Utility function to apply speed and flat multipliers to stats where speed changes apply (OD).
 *
 * @param {number} base_od The base OD of the beatmap.
 * @param {number} speed_mul The speed multiplier based on speed-changing mods.
 * @param {number} multiplier The general multiplier based on map-changing mods (EZ/HR).
 * @returns {number} The applied OD.
 */
function modify_od(base_od, speed_mul, multiplier) {
    let od = base_od;
    od *= multiplier;
    let odms = OD0_MS - Math.ceil(OD_MS_STEP * od);
    odms = Math.min(OD0_MS, Math.max(OD10_MS, odms));
    odms /= speed_mul;
    od = (OD0_MS - odms) / OD_MS_STEP;
    return od
}

module.exports = MapStats;