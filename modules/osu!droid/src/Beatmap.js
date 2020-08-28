const HitObject = require('./HitObject');
const Timing = require('./Timing');
const objectTypes = require('./constants/objectTypes');

/**
 * Represents a beatmap with advanced information.
 */
class Beatmap {
    constructor() {
        this.reset()
    }

    /**
     * Resets the instance to its original state.
     */
    reset() {
        /**
         * @type {number}
         * @description The format version of the beatmap.
         */
        this.format_version = 1;

        /**
         * @type {number}
         * @description The game mode of the beatmap. 0 is osu!standard, 1 is Taiko, 2 is Catch the Beat, 3 is osu!mania.
         */
        this.mode = 0;

        /**
         * @type {string}
         * @description The title of the song of the beatmap.
         */
        this.title = "";

        /**
         * @type {string}
         * @description The unicode title of the song of the beatmap.
         */
        this.title_unicode = "";

        /**
         * @type {string}
         * @description The artist of the song of the beatmap.
         */
        this.artist = "";

        /**
         * @type {string}
         * @description The unicode artist of the song of the beatmap.
         */
        this.artist_unicode = "";

        /**
         * @type {string}
         * @description The creator of the beatmap.
         */
        this.creator = "";

        /**
         * @type {string}
         * @description The difficulty name of the beatmap.
         */
        this.version = "";

        /**
         * @type {number|undefined}
         * @description The approach rate of the beatmap.
         */
        this.ar = undefined;

        /**
         * @type {number}
         * @description The circle size of the beatmap.
         */
        this.cs = 5.0;

        /**
         * @type {number}
         * @description The overall difficulty of the beatmap.
         */
        this.od = 5.0;

        /**
         * @type {number}
         * @description The health drain rate of the beatmap.
         */
        this.hp = 5.0;

        /**
         * @type {number}
         * @description The slider velocity of the beatmap.
         */
        this.sv = 1.0;

        /**
         * @type {number}
         * @description The slider tick rate of the beatmap.
         */
        this.tick_rate = 1.0;

        /**
         * @type {number}
         * @description The amount of circles in the beatmap.
         */
        this.circles = 0;

        /**
         * @type {number}
         * @description The amount of sliders in the beatmap.
         */
        this.sliders = 0;

        /**
         * @type {number}
         * @description The amount of spinners in the beatmap.
         */
        this.spinners = 0;

        if (!this.objects) {
            /**
             * @type {HitObject[]}
             * @description An array of objects of the beatmap in `HitObject` instance.
             */
            this.objects = [];
        } else {
            this.objects.length = 0;
        }
        if (!this.timing_points) {
            /**
             * @type {Timing[]}
             * @description An array of timing points of the beatmap in `Timing` instance.
             */
            this.timing_points = [];
        } else {
            this.timing_points.length = 0;
        }
    }

    /**
     * Calculates the maximum combo of the beatmap.
     * 
     * This is given by circles + spinners + sliders * 2
     * (heads and tails) + sliderticks.
     * 
     * We approximate slider ticks by calculating the
     * playfield pixels per beat for the current section
     * and dividing the total distance travelled by
     * pixels per beat. This gives us the number of beats,
     * which multiplied by the tick rate gives us the
     * tick count.
     *
     * @returns {number} The maximum combo of the beatmap.
     */
    max_combo() {
        let res = this.circles + this.spinners;
        let tindex = -1;
        let tnext = Number.NEGATIVE_INFINITY;
        let px_per_beat = 0.0;

        for (let i = 0; i < this.objects.length; ++i) {
            let obj = this.objects[i];
            if (!(obj.type & objectTypes.slider)) {
                continue;
            }

            // keep track of the current timing point without
            // looping through all of them for every object
            while (obj.time >= tnext) {
                ++tindex;
                if (this.timing_points.length > tindex + 1) {
                    tnext = this.timing_points[tindex + 1].time;
                } else {
                    tnext = Number.POSITIVE_INFINITY;
                }

                let t = this.timing_points[tindex];
                let sv_multiplier = 1.0;
                if (!t.change && t.ms_per_beat < 0) {
                    sv_multiplier = -100.0 / t.ms_per_beat;
                }

                // beatmaps older than format v8 don't apply
                // the bpm multiplier to slider ticks
                if (this.format_version < 8) {
                    px_per_beat = this.sv * 100.0;
                } else {
                    px_per_beat = this.sv * 100.0 * sv_multiplier;
                }
            }

            let sl = obj.data;
            let num_beats = (sl.distance * sl.repetitions) / px_per_beat;

            // subtract an epsilon to prevent accidental
            // ceiling of whole values such as 2.00....1 -> 3 due
            // to rounding errors

            let ticks = Math.ceil(
                (num_beats - 0.1) / sl.repetitions
                * this.tick_rate
            );

            --ticks;
            ticks *= sl.repetitions;
            ticks += sl.repetitions + 1;

            res += Math.max(0, ticks);
        }

        return res;
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} A string representation of the class.
     */
    toString() {
        let res = this.artist + " - " + this.title + " [";
        if (this.title_unicode || this.artist_unicode) {
            res += "(" + this.artist_unicode + " - "
                + this.title_unicode + ")";
        }
        res += (
            this.version + "] mapped by " + this.creator + "\n"
            + "\n"
            + "AR" + parseFloat(this.ar.toFixed(2)) + " "
            + "OD" + parseFloat(this.od.toFixed(2)) + " "
            + "CS" + parseFloat(this.cs.toFixed(2)) + " "
            + "HP" + parseFloat(this.hp.toFixed(2)) + "\n"
            + this.circles + " circles, "
            + this.sliders + " sliders, "
            + this.spinners + " spinners" + "\n"
            + this.max_combo() + " max combo" + "\n"
        );
        return res;
    }
}

module.exports = Beatmap;