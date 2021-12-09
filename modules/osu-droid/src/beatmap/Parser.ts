import { Beatmap } from "./Beatmap";
import { TimingPoint } from "./timings/TimingPoint";
import { TimingControlPoint } from "./timings/TimingControlPoint";
import { DifficultyControlPoint } from "./timings/DifficultyControlPoint";
import { BreakPoint } from "./timings/BreakPoint";
import { Circle } from "./hitobjects/Circle";
import { Slider } from "./hitobjects/Slider";
import { Spinner } from "./hitobjects/Spinner";
import { PathType } from "../constants/PathType";
import { Precision } from "../utils/Precision";
import { objectTypes } from "../constants/objectTypes";
import { Vector2 } from "../mathutil/Vector2";
import { SliderPath } from "../utils/SliderPath";
import { HitObject } from "./hitobjects/HitObject";
import { MapStats } from "../utils/MapStats";
import { MathUtils } from "../mathutil/MathUtils";
import { ParserConstants } from "../constants/ParserConstants";
import { Mod } from "../mods/Mod";

/**
 * A beatmap parser with just enough data for pp calculation.
 */
export class Parser {
    /**
     * The parsed beatmap.
     */
    readonly map: Beatmap = new Beatmap();

    /**
     * The amount of lines of `.osu` file.
     */
    private line: number = 0;

    /**
     * The currently processed line.
     */
    private currentLine: string = "";

    /**
     * The previously processed line.
     */
    private lastPosition: string = "";

    /**
     * The currently processed section.
     */
    private section: string = "";

    /**
     * Parses a beatmap.
     *
     * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
     *
     * @param str The `.osu` file to parse.
     * @param mods The mods to parse the beatmap for.
     */
    parse(str: string, mods: Mod[] = []): Parser {
        const lines: string[] = str.split("\n");

        for (let i: number = 0; i < lines.length; ++i) {
            this.processLine(lines[i]);
        }

        // Objects may be out of order *only* if a user has manually edited an .osu file.
        // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
        // Sort is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
        this.map.objects.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        if (this.map.formatVersion >= 6) {
            this.applyStacking(0, this.map.objects.length - 1);
        } else {
            this.applyStackingOld();
        }

        const circleSize: number = new MapStats({
            cs: this.map.cs,
            mods,
        }).calculate().cs!;
        const scale: number = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        this.map.objects.forEach((h) => {
            h.scale = scale;

            if (h instanceof Slider) {
                h.nestedHitObjects.forEach((n) => {
                    n.scale = scale;
                });
            }
        });

        return this;
    }

    /**
     * Logs the line at which an exception occurs.
     */
    private logError(): string {
        return (
            "at line " +
            this.line +
            "\n" +
            this.currentLine +
            "\n" +
            "-> " +
            this.lastPosition +
            " <-"
        );
    }

    /**
     * Processes a line of the file.
     */
    private processLine(line: string): Parser {
        this.currentLine = this.lastPosition = line;
        ++this.line;

        // comments
        if (line.startsWith(" ") || line.startsWith("_")) {
            return this;
        }

        // now that we've handled space comments we can trim space
        line = this.currentLine = line.trim();

        // c++ style comments
        if (line.startsWith("//")) {
            return this;
        }

        // [SectionName]
        if (line.startsWith("[")) {
            if (this.section === "Difficulty" && !this.map.ar) {
                this.map.ar = this.map.od;
            }
            this.section = line.substring(1, line.length - 1);
            return this;
        }

        if (!line) {
            return this;
        }

        switch (this.section) {
            case "General":
                this.general();
                break;
            case "Metadata":
                this.metadata();
                break;
            case "Difficulty":
                this.difficulty();
                break;
            case "Events":
                this.events();
                break;
            case "TimingPoints":
                this.timingPoints();
                break;
            case "HitObjects":
                // Need to check if the beatmap doesn't have an uninherited timing point.
                // This exists in cases such as /b/2290233 where the beatmap has been
                // edited by the user.
                //
                // In lazer, the default BPM is set to 60 (60000 / 1000).
                if (this.map.timingPoints.length === 0) {
                    this.map.timingPoints.push(
                        new TimingControlPoint({
                            time: Number.NEGATIVE_INFINITY,
                            msPerBeat: 1000,
                        })
                    );
                }

                this.objects();
                break;
            default: {
                const fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) {
                    break;
                }
                this.map.formatVersion = parseInt(line.substring(fmtpos + 13));
                break;
            }
        }

        return this;
    }

    /**
     * Sets the last position of the current parser state.
     *
     * This is useful to debug syntax errors.
     */
    private setPosition(str: string): string {
        this.lastPosition = str.trim();
        return this.lastPosition;
    }

    /**
     * Logs any syntax errors into the console.
     */
    private warn(message: string): void {
        console.warn(message);
        console.warn(this.logError());
    }

    /**
     * Processes a property of the beatmap. This takes the current line as parameter.
     *
     * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
     */
    private property(): string[] {
        const s: string[] = this.currentLine.split(":");
        s[0] = this.setPosition(s[0]);
        s[1] = this.setPosition(s.slice(1).join(":"));
        return s;
    }

    /**
     * Processes the general section of a beatmap.
     */
    private general(): void {
        const p: string[] = this.property();
        if (p[0] === "StackLeniency") {
            this.map.stackLeniency = parseFloat(p[1]);
        }
    }

    /**
     * Processes the metadata section of a beatmap.
     */
    private metadata(): void {
        const p: string[] = this.property();
        switch (p[0]) {
            case "Title":
                this.map.title = p[1];
                break;
            case "TitleUnicode":
                this.map.titleUnicode = p[1];
                break;
            case "Artist":
                this.map.artist = p[1];
                break;
            case "ArtistUnicode":
                this.map.artistUnicode = p[1];
                break;
            case "Creator":
                this.map.creator = p[1];
                break;
            case "Version":
                this.map.version = p[1];
                break;
            case "BeatmapID":
                this.map.beatmapId = parseInt(p[1]);
                break;
            case "BeatmapSetID":
                this.map.beatmapSetId = parseInt(p[1]);
                break;
        }
    }

    /**
     * Processes the events section of a beatmap.
     */
    private events(): void {
        const s: string[] = this.currentLine.split(",");
        if (s[0] !== "2" && s[0] !== "Break") return;
        this.map.breakPoints.push(
            new BreakPoint({
                startTime: parseInt(this.setPosition(s[1])),
                endTime: parseInt(this.setPosition(s[2])),
            })
        );
    }

    /**
     * Processes the difficulty section of a beatmap.
     */
    private difficulty(): void {
        const p: string[] = this.property();
        switch (p[0]) {
            case "CircleSize":
                this.map.cs = parseFloat(this.setPosition(p[1]));
                break;
            case "OverallDifficulty":
                this.map.od = parseFloat(this.setPosition(p[1]));
                break;
            case "ApproachRate":
                this.map.ar = parseFloat(this.setPosition(p[1]));
                break;
            case "HPDrainRate":
                this.map.hp = parseFloat(this.setPosition(p[1]));
                break;
            case "SliderMultiplier":
                this.map.sv = parseFloat(this.setPosition(p[1]));
                break;
            case "SliderTickRate":
                this.map.tickRate = parseFloat(this.setPosition(p[1]));
        }
    }

    /**
     * Processes the timing points section of a beatmap.
     */
    private timingPoints(): void {
        const s: string[] = this.currentLine.split(",");
        if (s.length > 8) {
            this.warn("Timing point with trailing values");
        } else if (s.length < 2) {
            return this.warn("Ignoring malformed timing point");
        }
        // BeatmapVersion 4 and lower had an incorrect offset (stable has this set as 24ms off)
        const time: number =
            parseFloat(this.setPosition(s[0])) +
            (this.map.formatVersion < 5 ? 24 : 0);
        if (!this.isNumberValid(time)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const msPerBeat: number = parseFloat(this.setPosition(s[1]));
        if (!this.isNumberValid(msPerBeat)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }
        const speedMultiplier = msPerBeat < 0 ? 100 / -msPerBeat : 1;

        if (msPerBeat >= 0) {
            this.map.timingPoints.push(
                new TimingControlPoint({
                    time: time,
                    msPerBeat: msPerBeat,
                })
            );
        }

        this.map.difficultyTimingPoints.push(
            new DifficultyControlPoint({
                time: time,
                speedMultiplier: speedMultiplier,
            })
        );
    }

    /**
     * Processes the objects section of a beatmap.
     */
    private objects(): void {
        const s: string[] = this.currentLine.split(",");
        if (s.length > 11) {
            this.warn("Object with trailing values");
        } else if (s.length < 4) {
            return this.warn("Ignoring malformed hitobject");
        }
        const time: number = parseFloat(this.setPosition(s[2]));
        const type: number = parseInt(this.setPosition(s[3]));
        if (!this.isNumberValid(time) || isNaN(type)) {
            return this.warn(
                "Ignoring malformed hitobject: Value is invalid, too low, or too high"
            );
        }

        const position: Vector2 = new Vector2({
            x: parseFloat(this.setPosition(s[0])),
            y: parseFloat(this.setPosition(s[1])),
        });
        if (!this.isVectorValid(position)) {
            return this.warn(
                "Ignoring malformed hitobject: Value is invalid, too low, or too high"
            );
        }

        if (type & objectTypes.circle) {
            const object = new Circle({
                startTime: time,
                type: type,
                position: position,
            });
            ++this.map.circles;
            this.map.objects.push(object);
        } else if (type & objectTypes.slider) {
            if (s.length < 8) {
                return this.warn("Ignoring malformed slider");
            }
            const repetitions: number = Math.max(
                parseInt(this.setPosition(s[6])),
                ParserConstants.MIN_REPETITIONS_VALUE
            );

            if (
                !this.isNumberValid(
                    repetitions,
                    0,
                    ParserConstants.MAX_REPETITIONS_VALUE
                )
            ) {
                return this.warn(
                    "Ignoring malformed slider: Value is invalid, too low, or too high"
                );
            }

            const distance: number = Math.max(
                0,
                parseFloat(this.setPosition(s[7]))
            );

            if (
                !this.isNumberValid(
                    distance,
                    0,
                    ParserConstants.MAX_COORDINATE_VALUE
                )
            ) {
                return this.warn(
                    "Ignoring malformed slider: Value is invalid, too low, or too high"
                );
            }

            const speedMultiplierTimingPoint: DifficultyControlPoint =
                this.getTimingPoint(time, this.map.difficultyTimingPoints);
            const msPerBeatTimingPoint: TimingControlPoint =
                this.getTimingPoint(time, this.map.timingPoints);

            const points: Vector2[] = [new Vector2({ x: 0, y: 0 })];
            const pointSplit: string[] = this.setPosition(s[5]).split("|");
            let pathType: PathType = this.convertPathType(
                <string>pointSplit.shift()
            );

            for (const point of pointSplit) {
                const temp: string[] = point.split(":");
                const vec: Vector2 = new Vector2({ x: +temp[0], y: +temp[1] });
                if (!this.isVectorValid(vec)) {
                    return this.warn(
                        "Ignoring malformed slider: Value is invalid, too low, or too high"
                    );
                }

                points.push(vec.subtract(position));
            }

            if (
                points.length === 3 &&
                pathType === PathType.PerfectCurve &&
                Precision.almostEqualsNumber(
                    0,
                    (points[1].y - points[0].y) * (points[2].x - points[0].x) -
                        (points[1].x - points[0].x) *
                            (points[2].y - points[0].y)
                )
            ) {
                pathType = PathType.Linear;
            }

            const path: SliderPath = new SliderPath({
                pathType: pathType,
                controlPoints: points,
                expectedDistance: distance,
            });

            const object: Slider = new Slider({
                position: position,
                startTime: time,
                type: type,
                repetitions: repetitions,
                path: path,
                speedMultiplier: MathUtils.clamp(
                    speedMultiplierTimingPoint.speedMultiplier,
                    ParserConstants.MIN_SPEEDMULTIPLIER_VALUE,
                    ParserConstants.MAX_SPEEDMULTIPLIER_VALUE
                ),
                msPerBeat: msPerBeatTimingPoint.msPerBeat,
                mapSliderVelocity: this.map.sv,
                mapTickRate: this.map.tickRate,
                // Prior to v8, speed multipliers don't adjust for how many ticks are generated over the same distance.
                // This results in more (or less) ticks being generated in <v8 maps for the same time duration.
                //
                // This additional check is used in case BPM goes very low or very high.
                // When lazer is final, this should be revisited.
                tickDistanceMultiplier: this.isNumberValid(
                    msPerBeatTimingPoint.msPerBeat,
                    ParserConstants.MIN_MSPERBEAT_VALUE,
                    ParserConstants.MAX_MSPERBEAT_VALUE
                )
                    ? this.map.formatVersion < 8
                        ? 1 / speedMultiplierTimingPoint.speedMultiplier
                        : 1
                    : 0,
            });
            ++this.map.sliders;
            this.map.objects.push(object);
        } else if (type & objectTypes.spinner) {
            const object = new Spinner({
                startTime: time,
                type: type,
                duration: parseInt(this.setPosition(s[5])) - time,
            });
            if (!this.isNumberValid(object.duration)) {
                return this.warn(
                    "Ignoring malformed spinner: Value is invalid, too low, or too high"
                );
            }
            ++this.map.spinners;
            this.map.objects.push(object);
        }
    }

    /**
     * Converts string slider path to a `PathType`.
     */
    private convertPathType(input: string): PathType {
        switch (input) {
            case "B":
                return PathType.Bezier;
            case "L":
                return PathType.Linear;
            case "P":
                return PathType.PerfectCurve;
            default:
                return PathType.Catmull;
        }
    }

    /**
     * Gets the timing point that applies at given time.
     *
     * @param time The time to search.
     * @param list The timing points to search in.
     */
    private getTimingPoint<T extends TimingPoint>(time: number, list: T[]): T {
        if (list.length === 0) {
            throw new Error("No timing points have been loaded");
        }

        if (time < list[0].time) {
            return list[0];
        }

        if (time >= list.at(-1)!.time) {
            return list.at(-1)!;
        }

        let l: number = 0;
        let r: number = list.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (list[pivot].time < time) {
                l = pivot + 1;
            } else if (list[pivot].time > time) {
                r = pivot - 1;
            } else {
                return list[pivot];
            }
        }

        // l will be the first control point with time > list[l].time, but we want the one before it
        return list[l - 1];
    }

    /**
     * Applies stacking to hitobjects for beatmap version 6 or above.
     */
    private applyStacking(startIndex: number, endIndex: number): void {
        const stackDistance: number = 3;

        let timePreempt: number = 600;
        const ar: number = <number>this.map.ar;
        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        let extendedEndIndex: number = endIndex;
        const stackThreshold: number = timePreempt * this.map.stackLeniency;

        if (endIndex < this.map.objects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex: number = i;
                for (
                    let n: number = stackBaseIndex + 1;
                    n < this.map.objects.length;
                    ++n
                ) {
                    const stackBaseObject: HitObject =
                        this.map.objects[stackBaseIndex];
                    if (stackBaseObject instanceof Spinner) {
                        break;
                    }

                    const objectN: HitObject = this.map.objects[n];
                    if (objectN instanceof Spinner) {
                        break;
                    }

                    const endTime: number = stackBaseObject.endTime;

                    if (objectN.startTime - endTime > stackThreshold) {
                        break;
                    }

                    const endPositionDistanceCheck: boolean =
                        stackBaseObject instanceof Slider
                            ? stackBaseObject.endPosition.getDistance(
                                  objectN.position
                              ) < stackDistance
                            : false;

                    if (
                        stackBaseObject.position.getDistance(objectN.position) <
                            stackDistance ||
                        endPositionDistanceCheck
                    ) {
                        stackBaseIndex = n;
                        objectN.stackHeight = 0;
                    }
                }

                if (stackBaseIndex > extendedEndIndex) {
                    extendedEndIndex = stackBaseIndex;
                    if (extendedEndIndex === this.map.objects.length - 1) {
                        break;
                    }
                }
            }
        }

        let extendedStartIndex: number = startIndex;
        for (let i = extendedEndIndex; i > startIndex; --i) {
            let n: number = i;

            let objectI: HitObject = this.map.objects[i];
            if (
                objectI.stackHeight !== 0 ||
                objectI.type & objectTypes.spinner
            ) {
                continue;
            }

            if (objectI.type & objectTypes.circle) {
                while (--n >= 0) {
                    const objectN: HitObject = this.map.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    const endTime: number = objectN.endTime;

                    if (objectI.startTime - endTime > stackThreshold) {
                        break;
                    }

                    if (n < extendedStartIndex) {
                        objectN.stackHeight = 0;
                        extendedStartIndex = n;
                    }

                    const endPositionDistanceCheck: boolean =
                        objectN instanceof Slider
                            ? objectN.endPosition.getDistance(
                                  objectI.position
                              ) < stackDistance
                            : false;

                    if (endPositionDistanceCheck) {
                        const offset: number =
                            objectI.stackHeight - objectN.stackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            const objectJ: HitObject = this.map.objects[j];
                            if (
                                (<Slider>objectN).endPosition.getDistance(
                                    objectJ.position
                                ) < stackDistance
                            ) {
                                objectJ.stackHeight -= offset;
                            }
                        }
                        break;
                    }

                    if (
                        objectN.position.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI instanceof Slider) {
                while (--n >= startIndex) {
                    const objectN: HitObject = this.map.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (
                        objectI.startTime - objectN.startTime >
                        stackThreshold
                    ) {
                        break;
                    }

                    const objectNEndPosition: Vector2 =
                        objectN instanceof Circle
                            ? objectN.position
                            : (<Slider>objectN).endPosition;
                    if (
                        objectNEndPosition.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            }
        }
    }

    /**
     * Applies stacking to hitobjects for beatmap version 5 or below.
     */
    private applyStackingOld(): void {
        const stackDistance: number = 3;
        let timePreempt: number = 600;
        const ar: number = <number>this.map.ar;

        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        for (let i = 0; i < this.map.objects.length; ++i) {
            const currentObject: HitObject = this.map.objects[i];

            if (
                currentObject.stackHeight !== 0 &&
                !(currentObject instanceof Slider)
            ) {
                continue;
            }

            let startTime: number = currentObject.endTime;
            let sliderStack: number = 0;

            for (let j = i + 1; j < this.map.objects.length; ++j) {
                const stackThreshold: number =
                    timePreempt * this.map.stackLeniency;

                if (
                    this.map.objects[j].startTime - stackThreshold >
                    startTime
                ) {
                    break;
                }

                // The start position of the hitobject, or the position at the end of the path if the hitobject is a slider
                const position2: Vector2 =
                    currentObject instanceof Slider
                        ? currentObject.endPosition
                        : currentObject.position;

                if (
                    this.map.objects[j].position.getDistance(
                        currentObject.position
                    ) < stackDistance
                ) {
                    ++currentObject.stackHeight;
                    startTime = this.map.objects[j].endTime;
                } else if (
                    this.map.objects[j].position.getDistance(position2) <
                    stackDistance
                ) {
                    // Case for sliders - bump notes down and right, rather than up and left.
                    ++sliderStack;
                    this.map.objects[j].stackHeight -= sliderStack;
                    startTime = this.map.objects[j].endTime;
                }
            }
        }
    }

    /**
     * Checks if a number is within a given threshold.
     *
     * @param num The number to check.
     * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
     * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     */
    private isNumberValid(
        num: number,
        min: number = -ParserConstants.MAX_PARSE_VALUE,
        max: number = ParserConstants.MAX_PARSE_VALUE
    ): boolean {
        return num >= min && num <= max;
    }

    /**
     * Checks if each coordinates of a vector is within a given threshold.
     *
     * @param vec The vector to check.
     * @param limit The threshold. Defaults to `ParserConstants.MAX_COORDINATE_VALUE`.
     */
    private isVectorValid(
        vec: Vector2,
        min: number = -ParserConstants.MAX_COORDINATE_VALUE,
        max = ParserConstants.MAX_COORDINATE_VALUE
    ): boolean {
        return (
            this.isNumberValid(vec.x, min, max) &&
            this.isNumberValid(vec.y, min, max)
        );
    }
}
