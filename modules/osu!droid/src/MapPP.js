const Accuracy = require('./Accuracy');
const MapStats = require('./MapStats');
const mods = require('./mods');

class MapPP {
    constructor() {
        /**
         * @type {number}
         * @description The aim performance points value.
         */
        this.aim = 0.0;

        /**
         * @type {number}
         * @description The speed performance points value.
         */
        this.speed = 0.0;

        /**
         * @type {number}
         * @description The accuracy performance points value.
         */
        this.acc = 0.0;

        /**
         * @type {number}
         * @description The total performance points value. This is the most commonly used value.
         */
        this.total = 0.0;

        /**
         * @type {Accuracy|undefined}
         * @description The calculated accuracy based on `Accuracy` instance.
         */
        this.computed_accuracy = undefined
    }

    /**
     * Calculates the performance points of a beatmap.
     * 
     * If `stars` is defined, `map` and `mods` are obtained from `stars` as
     * well as `aim_stars` and `speed_stars`.
     * 
     * If `map` is defined, `max_combo`, `nsliders`, `ncircles`, `nobjects`,
     * `base_ar`, and `base_od` will be obtained from this beatmap.
     * 
     * If `map` is defined and `stars` is not defined, a new difficulty
     * calculator will be created on the fly to compute stars for the beatmap.
     * 
     * If `acc_percent` is defined, `n300`, `n100`, and `n50` will be automatically
     * calculated to be as close as possible to this value.
     *
     * @param {Object} params An object containing the parameters.
     * @param {Beatmap} [params.map] The beatmap to calculate difficulty for.
     * @param {StandardDiff} [params.stars] The star rating of the beatmap.
     * @param {number} [params.acc_percent] The accuracy achieved.
     * @param {string} [params.mode=osu] The mode to calculate difficulty for.
     * @param {number} [params.aim_stars] The aim star rating of the beatmap.
     * @param {number} [params.speed_stars] The speed star rating of the beatmap.
     * @param {number} [params.max_combo] The maximum combo of the beatmap.
     * @param {number} [params.nsliders] The amount of sliders in the beatmap.
     * @param {number} [params.ncircles] The amount of circles in the beatmap.
     * @param {number} [params.nobjects] The amount of objects in the beatmap.
     * @param {number} [params.base_ar=5] The base AR of the beatmap.
     * @param {number} [params.base_od=5] The base OD of the beatmap.
     * @param {string} [params.mods] The applied mods in osu!standard string format.
     * @param {number} [params.combo] The maximum combo achieved. Defaults to `max_combo - nmiss`.
     * @param {number} [params.n300] The amount of 300s achieved. Defaults to `nobjects - n100 - n50 - nmiss`.
     * @param {number} [params.n100=0] The amount of 100s achieved.
     * @param {number} [params.n50=0] The amount of 50s achieved.
     * @param {number} [params.nmiss=0] THe amount of misses achieved.
     * @param {number} [params.score_version=1] The scoring version to use (`1` or `2`).
     *
     * @returns {MapPP} The current instance, which contains the results.
     */
    calculate(params) {
        // parameters handling

        let stars = params.stars;
        let map = params.map;
        let max_combo, nsliders, ncircles, nobjects, base_ar, base_od;
        let mod;
        let aim_stars, speed_stars;
        let mode = params.mode || "osu";

        if (stars) {
            map = stars.map;
        }

        if (map) {
            max_combo = map.max_combo();
            nsliders = map.sliders;
            ncircles = map.circles;
            nobjects = map.objects.length;
            base_ar = map.ar;
            base_od = map.od;

            if (!stars) {
                stars = new StandardDiff().calculate(params);
            }
        } else {
            max_combo = params.max_combo;
            if (!max_combo || max_combo < 0) {
                throw new TypeError("max_combo must be > 0");
            }

            nsliders = params.nsliders;
            ncircles = params.ncircles;
            nobjects = params.nobjects;
            if ([nsliders, ncircles, nobjects].some(isNaN)) {
                throw new TypeError(
                    "nsliders, ncircles, nobjects are required (must be numbers) "
                );
            }
            if (nobjects < nsliders + ncircles) {
                throw new TypeError(
                    "nobjects must be >= nsliders + ncircles"
                );
            }
            base_ar = params.base_ar;
            if (!base_ar) base_ar = 5;
            base_od = params.base_od;
            if (!base_od) base_od = 5
        }

        if (stars) {
            mod = stars.mods;
            aim_stars = stars.aim;
            speed_stars = stars.speed;
        } else {
            mod = params.mods || '';
            aim_stars = params.aim_stars;
            speed_stars = params.speed_stars;
        }

        if ([aim_stars, speed_stars].some(isNaN)) {
            throw new TypeError("aim and speed stars required (must be numbers)");
        }

        let nmiss = params.nmiss || 0;
        let n50 = params.n50 || 0;
        let n100 = params.n100 || 0;

        let n300 = params.n300;
        if (!n300) {
            n300 = nobjects - n100 - n50 - nmiss;
        }

        let combo = params.combo;
        if (!combo) {
            combo = max_combo - nmiss;
        }

        let score_version = params.score_version || 1;

        let nobjects_over_2k = nobjects / 2000.0;
        let length_bonus = 0.95 + 0.4 * Math.min(1.0, nobjects_over_2k);
        switch (mode) {
            case "osu!droid":
            case "droid":
                length_bonus = 1.650668 +
                    (0.4845796 - 1.650668) /
                    (1 + Math.pow(nobjects / 817.9306, 1.147469));
                break;
            case "osu!":
            case "osu":
                if (nobjects > 2000) {
                    length_bonus += Math.log10(nobjects_over_2k) * 0.5;
                }
        }

        let miss_penality = Math.pow(0.97, nmiss);
        let combo_break = Math.min(Math.pow(combo, 0.8) / Math.pow(max_combo, 0.8), 1.0);
        let mapstats = new MapStats({
            ar: base_ar,
            od: base_od,
            mods: mod
        });

        // droid's map stats are pre-calculated so there is no need to calculate again
        if (mode === "osu!" || mode === "osu") mapstats = mapstats.calculate({mode: mode});
        mod = mods.modbits_from_string(mod);

        this.computed_accuracy = new Accuracy({
            percent: params.acc_percent,
            nobjects: nobjects,
            n300: n300, n100: n100, n50: n50, nmiss: nmiss
        });

        n300 = this.computed_accuracy.n300;
        n100 = this.computed_accuracy.n100;
        n50 = this.computed_accuracy.n50;

        let accuracy = this.computed_accuracy.value();

        // high/low AR bonus
        let ar_bonus = 1.0;
        if (mapstats.ar > 10.33) {
            ar_bonus += 0.3 * (mapstats.ar - 10.33);
        } else if (mapstats.ar < 8.0) {
            ar_bonus += 0.01 * (8.0 - mapstats.ar);
        }

        // aim pp
        let aim = this._base(aim_stars);
        aim *= length_bonus;
        aim *= miss_penality;
        aim *= combo_break;
        aim *= ar_bonus;

        let hd_bonus = 1.0;
        if (mod & mods.hd) {
            hd_bonus *= 1.0 + 0.04 * (12.0 - mapstats.ar);
        }

        aim *= hd_bonus;

        if (mod & mods.fl) {
            let fl_bonus = 1.0 + 0.35 * Math.min(1.0, nobjects / 200.0);
            if (nobjects > 200) {
                fl_bonus += 0.3 * Math.min(1.0, (nobjects - 200) / 300.0);
            }
            if (nobjects > 500) {
                fl_bonus += (nobjects - 500) / 1200.0;
            }
            aim *= fl_bonus;
        }

        let acc_bonus = 0.5 + accuracy / 2.0;
        let od_squared = Math.pow(mapstats.od, 2);
        let od_bonus = 0.98 + od_squared / 2500.0;

        aim *= acc_bonus;
        aim *= od_bonus;

        this.aim = aim;

        // speed pp
        let speed = this._base(speed_stars);
        speed *= length_bonus;
        speed *= miss_penality;
        speed *= combo_break;
        if (mapstats.ar > 10.33) {
            speed *= ar_bonus;
        }
        speed *= hd_bonus;

        // similar to aim acc and od bonus

        speed *= 0.02 + accuracy;
        speed *= 0.96 + od_squared / 1600.0;

        this.speed = speed;

        // accuracy pp
        //
        // scorev1 ignores sliders and spinners since they are free
        // 300s

        let real_acc = accuracy;
        switch (score_version) {
            case 1:
                let nspinners = nobjects - nsliders - ncircles;
                real_acc = new Accuracy({
                    n300: Math.max(0, n300 - nsliders - nspinners),
                    n100: n100,
                    n50: n50,
                    nmiss: nmiss
                }).value();
                real_acc = Math.max(0.0, real_acc);
                break;
            case 2:
                ncircles = nobjects;
                break;
            default:
                throw {
                    name: "NotImplementedError",
                    message: "unsupported scorev" + score_version
                }
        }

        let acc;
        switch (mode) {
            case "osu!droid":
            case "droid":
                // drastically change acc calculation to fit droid meta
                acc = (
                    Math.pow(1.4, mapstats.od) *
                    Math.pow(Math.max(1, mapstats.ar / 10), 3) *
                    Math.pow(real_acc, 12.0) * 10
                );
                break;
            case "osu!":
            case "osu":
                acc = (
                    Math.pow(1.52163, mapstats.od) *
                    Math.pow(real_acc, 24.0) * 2.83
                )
        }

        acc *= Math.min(1.15, Math.pow(ncircles / 1000.0, 0.3));
        if (mod & mods.hd) {
            acc *= 1.08;
        }
        if (mod & mods.fl) {
            acc *= 1.02;
        }

        this.acc = acc;

        // total pp
        let final_multiplier;
        switch (mode) {
            case "osu!droid":
            case "droid":
                // slight buff to final value
                final_multiplier = 1.15;
                break;
            case "osu!":
            case "osu":
                final_multiplier = 1.12
        }
        if (mod & mods.nf) final_multiplier *= 0.90;
        if (mod & mods.so) final_multiplier *= 0.95;

        // Extreme penalty
        // =======================================================
        // added to penaltize map with little aim but ridiculously
        // high speed value (which is easily abusable by using more than 2 fingers)
        //
        // only for droid
        let extreme_penalty = Math.pow(
            1 - Math.abs(speed - Math.pow(aim,1.1)) /
            Math.max(speed, Math.pow(aim,1.1)),
            0.2
        );
        extreme_penalty = Math.max(
            Math.pow(extreme_penalty , 2),
            -2 * (Math.pow(1 - extreme_penalty, 2)) + 1
        );

        this.total = Math.pow(
            Math.pow(aim, 1.1) + Math.pow(speed, 1.1) +
            Math.pow(acc, 1.1),
            1.0 / 1.1
        ) * final_multiplier;

        if (mode === "osu!droid" || mode === "droid") {
            this.total *= extreme_penalty;
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
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.speed.toFixed(2) + " speed, "
            + this.acc.toFixed(2) + " acc)"
        );
    }

    /**
     * Calculates the base performance value for stars.
     *
     * @param {number} stars The star rating.
     * @returns {number} The base performance value of given star rating.
     * @private
     */
    _base(stars) {
        return (
            Math.pow(5.0 * Math.max(1.0, stars / 0.0675) - 4.0, 3.0) / 100000.0
        );
    }
}

module.exports = MapPP;