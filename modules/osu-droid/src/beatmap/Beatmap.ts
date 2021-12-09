import { Slider } from "./hitobjects/Slider";
import { HitObject } from "./hitobjects/HitObject";
import { BreakPoint } from "./timings/BreakPoint";
import { TimingControlPoint } from "./timings/TimingControlPoint";
import { DifficultyControlPoint } from "./timings/DifficultyControlPoint";

/**
 * Represents a beatmap with advanced information.
 */
export class Beatmap {
    /**
     * The format version of the beatmap.
     */
    formatVersion: number = 1;

    /**
     * The title of the song of the beatmap.
     */
    title: string = "";

    /**
     * The unicode title of the song of the beatmap.
     */
    titleUnicode: string = "";

    /**
     * The artist of the song of the beatmap.
     */
    artist: string = "";

    /**
     * The unicode artist of the song of the beatmap.
     */
    artistUnicode: string = "";

    /**
     * The creator of the beatmap.
     */
    creator: string = "";

    /**
     * The difficulty name of the beatmap.
     */
    version: string = "";

    /**
     * The ID of the beatmap.
     */
    beatmapId?: number;

    /**
     * The ID of the beatmapset containing this beatmap.
     */
    beatmapSetId?: number;

    /**
     * The approach rate of the beatmap.
     */
    ar?: number;

    /**
     * The circle size of the beatmap.
     */
    cs: number = 5;

    /**
     * The overall difficulty of the beatmap.
     */
    od: number = 5;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number = 5;

    /**
     * The slider velocity of the beatmap.
     */
    sv: number = 1;

    /**
     * The slider tick rate of the beatmap.
     */
    tickRate: number = 1;

    /**
     * The amount of circles in the beatmap.
     */
    circles: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners: number = 0;

    /**
     * The objects of the beatmap.
     */
    readonly objects: HitObject[] = [];

    /**
     * The timing points of the beatmap.
     */
    readonly timingPoints: TimingControlPoint[] = [];

    /**
     * The difficulty timing points of the beatmap.
     */
    readonly difficultyTimingPoints: DifficultyControlPoint[] = [];

    /**
     * The break points of the beatmap.
     */
    readonly breakPoints: BreakPoint[] = [];

    /**
     * The stack leniency of the beatmap.
     */
    stackLeniency: number = 0.7;

    /**
     * The amount of slider ticks in the beatmap.
     */
    get sliderTicks(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );
        return sliders
            .map((v) => v.ticks)
            .reduce((acc, value) => acc + value, 0);
    }

    /**
     * The amount of sliderends in the beatmap.
     */
    get sliderEnds(): number {
        return this.sliders;
    }

    /**
     * The amount of slider repeat points in the beatmap.
     */
    get sliderRepeatPoints(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );
        return sliders
            .map((v) => v.repeatPoints)
            .reduce((acc, value) => acc + value, 0);
    }

    /**
     * The maximum combo of the beatmap.
     */
    get maxCombo(): number {
        return (
            this.circles +
            this.sliders +
            this.sliderTicks +
            this.sliderRepeatPoints +
            this.sliderEnds +
            this.spinners
        );
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        let res = this.artist + " - " + this.title + " [";
        if (this.titleUnicode || this.artistUnicode) {
            res += "(" + this.artistUnicode + " - " + this.titleUnicode + ")";
        }
        res +=
            this.version +
            "] mapped by " +
            this.creator +
            "\n" +
            "\n" +
            "AR" +
            parseFloat((this.ar as number).toFixed(2)) +
            " " +
            "OD" +
            parseFloat(this.od.toFixed(2)) +
            " " +
            "CS" +
            parseFloat(this.cs.toFixed(2)) +
            " " +
            "HP" +
            parseFloat(this.hp.toFixed(2)) +
            "\n" +
            this.circles +
            " circles, " +
            this.sliders +
            " sliders, " +
            this.spinners +
            " spinners" +
            "\n" +
            this.maxCombo +
            " max combo";
        return res;
    }
}
