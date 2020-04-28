const Beatmap = require('./Beatmap');
const StandardDiffHitObject = require('./StandardDiffHitObject');
const MapStats = require('./MapStats');
const mods = require('./mods');
const object_types = require('./object_types');

// (internal)
// 2D point operations
function vec_sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function vec_mul(a, b) { return [a[0] * b[0], a[1] * b[1]]; }
function vec_len(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }
function vec_dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

// (internal)
// difficulty calculation constants
const DIFF_SPEED = 0;
const DIFF_AIM = 1;
const SINGLE_SPACING = 125.0;
const DECAY_BASE = [ 0.3, 0.15 ];
const WEIGHT_SCALING = [ 1400.0, 26.25 ];
const DECAY_WEIGHT = 0.9;
const STRAIN_STEP = 400.0;
const CIRCLESIZE_BUFF_THRESHOLD = 30.0;
const STAR_SCALING_FACTOR = 0.0675;
const PLAYFIELD_SIZE = [512.0, 384.0];
const PLAYFIELD_CENTER = vec_mul(PLAYFIELD_SIZE, [0.5, 0.5]);
const DROID_EXTREME_SCALING_FACTOR = 0.4;
const EXTREME_SCALING_FACTOR = 0.5;

// (internal)
// spacing weight constants for each difficulty type

// ~200BPM 1/4 streams
const MIN_SPEED_BONUS = 75.0;

// ~280BPM 1/4 streams - edit to fit droid
const DROID_MAX_SPEED_BONUS = 53.0;

// ~330BPM 1/4 streams
const MAX_SPEED_BONUS = 45.0;

const ANGLE_BONUS_SCALE = 90;
const AIM_TIMING_THRESHOLD = 107;
const SPEED_ANGLE_BONUS_BEGIN = 5 * Math.PI / 6;
const AIM_ANGLE_BONUS_BEGIN = Math.PI / 3;

class StandardDiff {
    constructor() {
        /**
         * @type {StandardDiffHitObject[]}
         * @description The objects of the beatmap in `StandardDiffHitObject` instance.
         */
        this.objects = [];
        this.reset();

        /**
         * @type {Beatmap|undefined}
         * @description The calculated beatmap in `Beatmap` instance.
         */
        this.map = undefined;

        /**
         * @type {string}
         * @description The modifications applied to the beatmap.
         */
        this.mods = '';

        /**
         * @type {number}
         * @description Interval threshold in milliseconds for singletaps.
         */
        this.singletap_threshold = 125
    }

    /**
     * Resets the current instance to its original state.
     */
    reset() {
        /**
         * @type {number}
         * @description The overall star rating of a calculated beatmap.
         */
        this.total = 0.0;

        /**
         * @type {number}
         * @description The aim star rating of a calculated beatmap.
         */
        this.aim = 0.0;

        /**
         * @type {number}
         * @description The aim difficulty of a calculated beatmap.
         */
        this.aim_difficulty = 0.0;

        /**
         * @type {number}
         * @description The length bonus given by aim difficulty.
         */
        this.aim_length_bonus = 0.0;

        /**
         * @type {number}
         * @description The speed star rating of a calculated beatmap.
         */
        this.speed = 0.0;

        /**
         * @type {number}
         * @description The speed difficulty of a calculated beatmap.
         */
        this.speed_difficulty = 0.0;

        /**
         * @type {number}
         * @description The length bonus given by speed difficulty.
         */
        this.speed_length_bonus = 0.0;

        /**
         * @type {number}
         * @description Number of notes that are seen as singletaps by the difficulty calculator.
         */
        this.singles = 0;

        /**
         * @type {number}
         * @description Number of notes that are faster than the interval given in `calculate()`. These singletap statistics are not required in star rating, but they are a free byproduct of the calculation which could be useful.
         */
        this.singles_threshold = 0;
    }

    /**
     * Calculates the length bonus of an aspect in a beatmap.
     * @param {number} stars The stars difficulty of the aspect of the beatmap.
     * @param {number} difficulty The general difficulty of the aspect of the beatmap.
     * @returns {number} The length bonus.
     * @private
     */
    _length_bonus(stars, difficulty) {
        return 0.32 + 0.5 * (Math.log10(difficulty + stars) - Math.log10(stars))
    }

    /**
     * Calculate the star rating of a beatmap.
     *
     * @param {Object} params
     * @param {Beatmap} params.map The beatmap we want to calculate difficulty for.
     * @param {string} [params.mods] The mods string.
     * @param {number} [params.singletap_threshold] Interval threshold in milliseconds for singletaps. Defaults to 240 BPM 1/2 singletaps `[(60000 / 240) / 2]`. See `nsingles_threshold`.
     * @param {string} [params.mode=osu] Whether to calculate difficulty for droid or PC.
     * @returns {StandardDiff} The current instance, which contains the results.
     */
    calculate(params) {
        let map = this.map = params.map || this.map;
        if (!map) {
            throw new TypeError("no map given")
        }
        let mod = this.mods = params.mods || this.mods;
        let singletap_threshold = this.singletap_threshold
            = params.singletap_threshold || this.singletap_threshold;

        let mode = params.mode || "osu";

        // apply mods to the beatmap's stats

        let stats = new MapStats({cs: map.cs, mods: mod}).calculate({mode: mode});
        mod = mods.modbits_from_string(mod);

        // droid's CS is already pre-calculated so there is no need
        // to recalculate it. To avoid so, we place the CS in a
        // variable
        let cs;
        switch (mode) {
            case "osu!droid":
            case "droid":
                cs = map.cs;
                break;
            case "osu!":
            case "osu":
                cs = stats.cs
        }

        this._init_objects(this.objects, map, cs);

        let speed = this._calc_individual(mode, DIFF_SPEED, this.objects, stats.speed_multiplier);
        this.speed = speed.difficulty;
        this.speed_difficulty = speed.total;

        let aim = this._calc_individual(mode, DIFF_AIM, this.objects, stats.speed_multiplier);
        this.aim = aim.difficulty;
        this.aim_difficulty = aim.total;

        this.aim_length_bonus = this._length_bonus(this.aim, this.aim_difficulty);
        this.speed_length_bonus = this._length_bonus(this.speed, this.speed_difficulty);
        this.aim = Math.sqrt(this.aim) * STAR_SCALING_FACTOR;
        this.speed = Math.sqrt(this.speed) * STAR_SCALING_FACTOR;

        if (mod & mods.td) {
            this.aim = Math.pow(this.aim, 0.8)
        }

        this.total = this.aim + this.speed;

        // total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        switch (mode) {
            case "osu!droid":
            case "droid":
                this.total += Math.abs(this.speed - this.aim) * DROID_EXTREME_SCALING_FACTOR;
                break;
            case "osu!":
            case "osu":
                this.total += Math.abs(this.speed - this.aim) * EXTREME_SCALING_FACTOR
        }

        this.singles = 0;
        this.singles_threshold = 0;

        for (let i = 1; i < this.objects.length; ++i) {
            let obj = this.objects[i].obj;
            let prev = this.objects[i - 1].obj;
            if (this.objects[i].is_single) {
                ++this.singles;
            }
            if (!(obj.type & (object_types.circle | object_types.slider))) {
                continue;
            }
            let interval = (obj.time - prev.time) / stats.speed_multiplier;
            if (interval >= singletap_threshold) {
                ++this.singles_threshold;
            }
        }
        return this
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.speed.toFixed(2) + " speed)"
        )
    }

    /**
     * Calculate spacing weight for a difficulty type.
     *
     * @param {string} mode The mode to calculate for.
     * @param {number} type The difficulty type to calculate. `0` is aim difficulty, `1` is speed difficulty.
     * @param {number} distance The distance between current hit object and previous hit object.
     * @param {number} delta_time The time difference between current hit object and previous hit object.
     * @param {number} prev_distance The distance between previous hit object and the hit object before said hit object.
     * @param {number} prev_delta_time The time difference between previous hit object and the hit object before said hit object.
     * @param {number|null} angle The angle of the hit object.
     * @returns {number} The spacing weight of a difficulty type.
     * @private
     */
    _spacing_weight(mode, type, distance, delta_time, prev_distance, prev_delta_time, angle) {
        let angle_bonus;
        let strain_time = Math.max(delta_time, 50);

        switch (type) {
            case DIFF_AIM: {
                let prev_strain_time = Math.max(prev_delta_time, 50);
                let result = 0;
                if (angle != null && angle > AIM_ANGLE_BONUS_BEGIN) {
                    angle_bonus = Math.sqrt(
                        Math.max(prev_distance - ANGLE_BONUS_SCALE, 0.0) *
                        Math.pow(Math.sin(angle - AIM_ANGLE_BONUS_BEGIN), 2.0) *
                        Math.max(distance - ANGLE_BONUS_SCALE, 0.0)
                    );
                    result = 1.5 * Math.pow(Math.max(0.0, angle_bonus), 0.99) /
                        Math.max(AIM_TIMING_THRESHOLD, prev_strain_time);
                }
                let weighted_distance = Math.pow(distance, 0.99);
                return Math.max(
                    result + weighted_distance / Math.max(AIM_TIMING_THRESHOLD, strain_time),
                    weighted_distance / strain_time
                );
            }
            case DIFF_SPEED: {
                distance = Math.min(distance, SINGLE_SPACING);
                switch (mode) {
                    case "osu!droid":
                    case "droid":
                        delta_time = Math.max(delta_time, DROID_MAX_SPEED_BONUS);
                        break;
                    case "osu!":
                    case "osu":
                        delta_time = Math.max(delta_time, MAX_SPEED_BONUS)
                }
                let speed_bonus = 1.0;
                if (delta_time < MIN_SPEED_BONUS) {
                    switch (mode) {
                        case "osu!droid":
                        case "droid":
                            speed_bonus += Math.pow((MIN_SPEED_BONUS - delta_time) / 50.0, 2);
                            break;
                        case "osu!":
                        case "osu":
                            speed_bonus += Math.pow((MIN_SPEED_BONUS - delta_time) / 40.0, 2);
                    }
                }
                angle_bonus = 1;
                if (angle != null && angle < SPEED_ANGLE_BONUS_BEGIN) {
                    let s = Math.sin(1.5 * (SPEED_ANGLE_BONUS_BEGIN - angle));
                    angle_bonus += Math.pow(s, 2) / 3.57;
                    if (angle < Math.PI / 2.0) {
                        angle_bonus = 1.28;
                        if (distance < ANGLE_BONUS_SCALE && angle < Math.PI / 4.0) {
                            angle_bonus += (1.0 - angle_bonus) *
                                Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0);
                        }
                        else if (distance < ANGLE_BONUS_SCALE) {
                            angle_bonus += (1.0 - angle_bonus) *
                                Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0) *
                                Math.sin((Math.PI / 2.0 - angle) * 4.0 / Math.PI);
                        }
                    }
                }
                return (
                    (1 + (speed_bonus - 1) * 0.75) * angle_bonus *
                    (0.95 + speed_bonus * Math.pow(distance / SINGLE_SPACING, 3.5))
                ) / strain_time;
            }
        }
        throw {
            name: "NotImplementedError",
            message: "this difficulty type does not exist"
        }
    }

    /**
     * Calculates a single strain and store it in the current hit object.
     *
     * @param {string} mode The mode to calculate strain for.
     * @param {number} type The difficulty type to calculate. `0` is aim difficulty, `1` is speed difficulty.
     * @param {StandardDiffHitObject} diffobj The current standard hit object.
     * @param {StandardDiffHitObject} prev_diffobj The previous standard hit object.
     * @param {number} speed_mul The speed multiplier (applied by speed-changing mods such as DT and HT).
     * @private
     */
    _calc_strain(mode, type, diffobj, prev_diffobj, speed_mul) {
        let obj = diffobj.obj;
        let prev_obj = prev_diffobj.obj;

        let value = 0.0;
        let time_elapsed = (obj.time - prev_obj.time) / speed_mul;
        let decay = Math.pow(DECAY_BASE[type],
            time_elapsed / 1000.0);

        diffobj.delta_time = time_elapsed;

        if (obj.type & (object_types.slider | object_types.circle)) {
            let distance = vec_len(vec_sub(diffobj.normpos, prev_diffobj.normpos));
            diffobj.d_distance = distance;
            if (type === DIFF_SPEED) {
                diffobj.is_single = distance > SINGLE_SPACING;
            }
            value = this._spacing_weight(mode, type, distance, time_elapsed,
                prev_diffobj.d_distance, prev_diffobj.delta_time, diffobj.angle);
            value *= WEIGHT_SCALING[type];
        }

        diffobj.strains[type] = prev_diffobj.strains[type] * decay + value
    }

    /**
     * Calculates a specific type of difficulty.
     * 
     * The map is analyzed in chunks of STRAIN_STEP duration.
     * For each chunk the highest hitobject strains are added to
     * a list which is then collapsed into a weighted sum, much
     * like scores are weighted on a user's profile.
     * 
     * For subsequent chunks, the initial max strain is calculated
     * by decaying the previous hitobject's strain until the
     * beginning of the new chunk.
     * 
     * The first object doesn't generate a strain
     * so we begin with an incremented interval end.
     * 
     * Also don't forget to manually add the peak strain for the last
     * section which would otherwise be ignored.
     *
     * @param {string} mode The mode to calculate difficulty for.
     * @param {number} type The type to calculate difficulty for. `0` is aim difficulty, `1` is speed difficulty.
     * @param {StandardDiffHitObject[]} diffobjs An array of standard hit objects.
     * @param {number} speed_mul The speed multiplier (applied by speed-changing mods such as DT and HT).
     * @returns {{difficulty: number, total: number}} The difficulty of the type.
     * @private
     */
    _calc_individual(mode, type, diffobjs, speed_mul) {
        let strains = [];
        let strain_step = STRAIN_STEP * speed_mul;
        let interval_end = (
            Math.ceil(diffobjs[0].obj.time / strain_step) * strain_step
        );
        let max_strain = 0.0;
        let i;

        for (i = 0; i < diffobjs.length; ++i) {
            if (i > 0) {
                this._calc_strain(mode, type, diffobjs[i], diffobjs[i - 1],
                    speed_mul);
            }
            while (diffobjs[i].obj.time > interval_end) {
                strains.push(max_strain);
                if (i > 0) {
                    let decay = Math.pow(DECAY_BASE[type],
                        (interval_end - diffobjs[i - 1].obj.time) / 1000.0);
                    max_strain = diffobjs[i - 1].strains[type] * decay;
                } else {
                    max_strain = 0.0;
                }
                interval_end += strain_step
            }
            max_strain = Math.max(max_strain, diffobjs[i].strains[type])
        }

        strains.push(max_strain);

        let weight = 1.0;
        let total = 0.0;
        let difficulty = 0.0;

        strains.sort(function (a, b) { return b - a; });

        for (i = 0; i < strains.length; ++i) {
            total += Math.pow(strains[i], 1.2);
            difficulty += strains[i] * weight;
            weight *= DECAY_WEIGHT;
        }

        return {difficulty: difficulty, total: total};
    }

    /**
     * Creates a scaling vector that normalizes positions.
     * 
     * Positions are normalized on circle radius so that we can calculate as if everything was the same circle size.
     *
     * @param {number} circlesize The size of the circle.
     * @returns {number[]} An array of scaling vector.
     * @private
     */
    _normalizer_vector(circlesize) {
        let radius = (PLAYFIELD_SIZE[0] / 16.0)
            * (1.0 - 0.7 * (circlesize - 5.0) / 5.0);
        let scaling_factor = 52.0 / radius;

        // high circlesize (small circles) bonus

        if (radius < CIRCLESIZE_BUFF_THRESHOLD) {
            scaling_factor *= 1.0
                + Math.min(CIRCLESIZE_BUFF_THRESHOLD - radius, 5.0) / 50.0;
        }
        return [scaling_factor, scaling_factor];
    }

    /**
     * Initialize difficulty objects (or reset if already initialized) and populate it with the normalized position of the beatmap's objects.
     *
     * @param {StandardDiffHitObject[]} diffobjs An array of standard difficulty hit objects.
     * @param {Beatmap} map The beatmap instance.
     * @param {number} circlesize The circle size of the beatmap.
     * @private
     */
    _init_objects(diffobjs, map, circlesize) {
        if (diffobjs.length !== map.objects.length) {
            diffobjs.length = map.objects.length;
        }

        let scaling_vec = this._normalizer_vector(circlesize);
        let normalized_center = vec_mul(PLAYFIELD_CENTER, scaling_vec);

        for (let i = 0; i < diffobjs.length; ++i) {
            if (!diffobjs[i]) {
                diffobjs[i] = new StandardDiffHitObject(map.objects[i]);
            } else {
                diffobjs[i].reset();
            }

            let obj = diffobjs[i].obj;
            if (obj.type & object_types.spinner) {
                diffobjs[i].normpos = normalized_center.slice();
            } else if (obj.type & (object_types.slider | object_types.circle)) {
                diffobjs[i].normpos = vec_mul(obj.data.pos, scaling_vec);
            }
            if (i >= 2) {
                let prev1 = diffobjs[i - 1];
                let prev2 = diffobjs[i - 2];
                let v1 = vec_sub(prev2.normpos, prev1.normpos);
                let v2 = vec_sub(diffobjs[i].normpos, prev1.normpos);
                let dot = vec_dot(v1, v2);
                let det = v1[0] * v2[1] - v1[1] * v2[0];
                diffobjs[i].angle = Math.abs(Math.atan2(det, dot));
            } else {
                diffobjs[i].angle = null;
            }
        }
    }
}

module.exports = StandardDiff;