import { Slider } from './hitobjects/Slider';
import { HitObject } from './hitobjects/HitObject';
import { BreakPoint } from './timings/BreakPoint';
import { TimingPoint } from './timings/TimingPoint';

/**
 * Represents a beatmap with advanced information.
 */
export class Beatmap {
    /**
     * The format version of the beatmap.
     */
    public formatVersion: number;

    /**
     * The title of the song of the beatmap.
     */
    public title: string;

    /**
     * The unicode title of the song of the beatmap.
     */
    public titleUnicode: string;

    /**
     * The artist of the song of the beatmap.
     */
    public artist: string;

    /**
     * The unicode artist of the song of the beatmap.
     */
    public artistUnicode: string;

    /**
     * The creator of the beatmap.
     */
    public creator: string;

    /**
     * The difficulty name of the beatmap.
     */
    public version: string;

    /**
     * The approach rate of the beatmap.
     */
    public ar?: number;

    /**
     * The circle size of the beatmap.
     */
    public cs: number;

    /**
     * The overall difficulty of the beatmap.
     */
    public od: number;

    /**
     * The health drain rate of the beatmap.
     */
    public hp: number;

    /**
     * The slider velocity of the beatmap.
     */
    public sv: number;

    /**
     * The slider tick rate of the beatmap.
     */
    public tickRate: number;

    /**
     * The amount of circles in the beatmap.
     */
    public circles: number;

    /**
     * The amount of sliders in the beatmap.
     */
    public sliders: number;

    /**
     * The amount of spinners in the beatmap.
     */
    public spinners: number;

    /**
     * The objects of the beatmap.
     */
    public objects: Array<HitObject>;

    /**
     * The timing points of the beatmap.
     */
    public timingPoints: Array<TimingPoint>;

    /**
     * The break points of the beatmap.
     */
    public breakPoints: Array<BreakPoint>;

    constructor() {
        this.formatVersion = 1;
        this.title = "";
        this.titleUnicode = "";
        this.artist = "";
        this.artistUnicode = "";
        this.artist = "";
        this.creator = "";
        this.version = "";
        
        this.ar = undefined;
        this.cs = 5;
        this.od = 5;
        this.hp = 5;
        this.sv = 1;
        this.tickRate = 1;
        this.circles = 0;
        this.sliders = 0;
        this.spinners = 0;
        this.objects = [];
        this.timingPoints = [];
        this.breakPoints = [];
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
     */
    maxCombo(): number {
        let res: number = this.circles + this.spinners;
        let tindex: number = -1;
        let tnext: number = Number.NEGATIVE_INFINITY;
        let pixelsPerBeat: number = 0;

        for (let i: number = 0; i < this.objects.length; ++i) {
            const object: HitObject = this.objects[i];
            if (!(object instanceof Slider)) {
                continue;
            }

            // keep track of the current timing point without
            // looping through all of them for every object
            while (object.time >= tnext) {
                ++tindex;
                if (this.timingPoints.length > tindex + 1) {
                    tnext = this.timingPoints[tindex + 1].time;
                } else {
                    tnext = Number.POSITIVE_INFINITY;
                }

                const t: TimingPoint = this.timingPoints[tindex];
                let svMultiplier: number = 1;
                if (!t.change && t.msPerBeat < 0) {
                    svMultiplier = -100 / t.msPerBeat;
                }

                // beatmaps older than format v8 don't apply
                // the bpm multiplier to slider ticks
                if (this.formatVersion < 8) {
                    pixelsPerBeat = this.sv * 100;
                } else {
                    pixelsPerBeat = this.sv * 100 * svMultiplier;
                }
            }

            const numberOfBeats: number = object.distance * object.repetitions / pixelsPerBeat;

            // subtract an epsilon to prevent accidental
            // ceiling of whole values such as 2.00....1 -> 3 due
            // to rounding errors
            let ticks: number = Math.ceil(
                (numberOfBeats - 0.1) / object.repetitions
                * this.tickRate
            );

            --ticks;
            ticks *= object.repetitions;
            ticks += object.repetitions + 1;

            res += Math.max(0, ticks);
        }

        return res;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        let res = this.artist + " - " + this.title + " [";
        if (this.titleUnicode || this.artistUnicode) {
            res += "(" + this.artistUnicode + " - "
                + this.titleUnicode + ")";
        }
        res += (
            this.version + "] mapped by " + this.creator + "\n"
            + "\n"
            + "AR" + parseFloat((this.ar as number).toFixed(2)) + " "
            + "OD" + parseFloat(this.od.toFixed(2)) + " "
            + "CS" + parseFloat(this.cs.toFixed(2)) + " "
            + "HP" + parseFloat(this.hp.toFixed(2)) + "\n"
            + this.circles + " circles, "
            + this.sliders + " sliders, "
            + this.spinners + " spinners" + "\n"
            + this.maxCombo() + " max combo" + "\n"
        );
        return res;
    }
}