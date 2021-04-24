import { Beatmap } from './Beatmap';
import { TimingPoint } from './timings/TimingPoint';
import { BreakPoint } from './timings/BreakPoint';
import { Circle } from './hitobjects/Circle';
import { Slider } from './hitobjects/Slider';
import { Spinner } from './hitobjects/Spinner';
import { PathType } from '../constants/PathType';
import { Precision } from '../utils/Precision';
import { objectTypes } from '../constants/objectTypes';
import { Vector2 } from '../mathutil/Vector2';
import { SliderPath } from '../utils/SliderPath';
import { HitObject } from './hitobjects/HitObject';
import { MapStats } from '../utils/MapStats';
import { MathUtils } from '../mathutil/MathUtils';
import { ParserConstants } from '../constants/ParserConstants';

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
    parse(str: string, mods: string = ""): Parser {
        const lines: string[] = str.split("\n");

        for (let i: number = 0; i < lines.length; ++i) {
            this.processLine(lines[i]);
        }

        if (this.map.formatVersion >= 6) {
            this.applyStacking(0, this.map.objects.length - 1);
        } else {
            this.applyStackingOld();
        }

        const circleSize: number = new MapStats({cs: this.map.cs, mods}).calculate().cs as number;
        const scale: number = (1 - 0.7 * (circleSize - 5) / 5) / 2;
        this.map.objects.forEach(h => {
            h.calculateStackedPosition(scale);
        });
        
        return this;
    }

    /**
     * Logs the line at which an exception occurs.
     */
    private logError(): string {
        return (
            "at line " + this.line + "\n" +
            this.currentLine + "\n" +
            "-> " + this.lastPosition + " <-"
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
            case "General": this.general(); break;
            case "Metadata": this.metadata(); break;
            case "Difficulty": this.difficulty(); break;
            case "Events": this.events(); break;
            case "TimingPoints": this.timingPoints(); break;
            case "HitObjects": this.objects(); break;
            default:
                const fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) {
                    break;
                }
                this.map.formatVersion = parseInt(line.substring(fmtpos + 13));
                break;
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
        }
    }

    /**
     * Processes the events section of a beatmap.
     */
    private events(): void {
        const s: string[] = this.currentLine.split(",");
        if (s[0] !== "2" && s[0] !== "Break") return;
        this.map.breakPoints.push(new BreakPoint({
            startTime: parseInt(this.setPosition(s[1])),
            endTime: parseInt(this.setPosition(s[2]))
        }));
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
        const time: number = parseFloat(this.setPosition(s[0]));
        if (!Parser.isNumberValid(time)) {
            return this.warn("Ignoring malformed timing point: Value is too low or high");
        }
        
        const msPerBeat: number = parseFloat(this.setPosition(s[1]));
        if (!Parser.isNumberValid(msPerBeat)) {
            return this.warn("Ignoring malformed timing point: Value is too low or high");
        }
        const speedMultiplier = msPerBeat < 0 ? 100 / -msPerBeat : 1;
        
        this.map.timingPoints.push(new TimingPoint({
            // BeatmapVersion 4 and lower had an incorrect offset (stable has this set as 24ms off)
            time: time + (this.map.formatVersion < 5 ? 24 : 0),
            msPerBeat: msPerBeat,
            change: msPerBeat >= 0,
            speedMultiplier: speedMultiplier
        }));
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
        if (!Parser.isNumberValid(time) || isNaN(type)) {
            return this.warn("Ignoring malformed hitobject: Value is too low or high");
        }
        
        const position: Vector2 = new Vector2({
            x: parseFloat(this.setPosition(s[0])),
            y: parseFloat(this.setPosition(s[1]))
        });
        if (!Parser.isVectorValid(position)) {
            return this.warn("Ignoring malformed hitobject: Value is too low or high");
        }

        if (type & objectTypes.circle) {
            const object = new Circle({
                startTime: time,
                type: type,
                position: position
            });
            ++this.map.circles;
            this.map.objects.push(object);
        }
        else if (type & objectTypes.slider) {
            if (s.length < 8) {
                return this.warn("Ignoring malformed slider");
            }
            const repetitions: number = Math.max(parseInt(this.setPosition(s[6])), ParserConstants.MIN_REPETITIONS_VALUE);
            
            if (!Parser.isNumberValid(repetitions, ParserConstants.MAX_REPETITIONS_VALUE)) {
                return this.warn("Ignoring malformed slider: Value is too low or high");
            }

            const distance: number = Math.max(ParserConstants.MIN_DISTANCE_VALUE, parseFloat(this.setPosition(s[7])));
            if (!Parser.isNumberValid(distance, ParserConstants.MAX_DISTANCE_VALUE)) {
                return this.warn("Ignoring malformed slider: Value is too low or high");
            }

            const speedMultiplierTimingPoint: TimingPoint = this.getTimingPointIndex(time, this.map.timingPoints);
            const msPerBeatTimingPoint: TimingPoint = this.getTimingPointIndex(time, this.map.timingPoints.filter(v => v.change));

            let pathType: PathType = 0;

            const points: Vector2[] = [new Vector2({x: 0, y: 0})];
            const pointSplit: string[] = this.setPosition(s[5]).split("|");
            const p: string = pointSplit.shift() as string;
            switch (p) {
                case "B":
                    pathType = PathType.Bezier;
                    break;
                case "L":
                    pathType = PathType.Linear;
                    break;
                case "P":
                    pathType = PathType.PerfectCurve;
                    break;
                case "C":
                default:
                    pathType = PathType.Catmull;
            }

            for (const point of pointSplit) {
                const temp: string[] = point.split(":");
                const vec: Vector2 = new Vector2({x: +temp[0], y: +temp[1]});
                if (!Parser.isVectorValid(vec)) {
                    return this.warn("Ignoring malformed slider: Value is too low or high");
                }
            }

            function isLinear(p: Vector2[]): boolean {
                return Precision.almostEqualsNumber(0, (p[1].y - p[0].y) * (p[2].x - p[0].x) - (p[1].x - p[0].x) * (p[2].y - p[0].y));
            }

            if (points.length === 3 && pathType === PathType.PerfectCurve && isLinear(points)) {
                pathType = PathType.Linear;
            }

            const path: SliderPath = new SliderPath({
                pathType: pathType,
                controlPoints: points,
                expectedDistance: distance
            });

            const object = new Slider({
                position: position,
                startTime: time,
                type: type,
                repetitions: repetitions,
                path: path,
                speedMultiplier: MathUtils.round(
                    MathUtils.clamp(
                        speedMultiplierTimingPoint.speedMultiplier,
                        ParserConstants.MIN_SPEEDMULTIPLIER_VALUE,
                        ParserConstants.MAX_SPEEDMULTIPLIER_VALUE
                    ),
                    1
                ),
                msPerBeat: MathUtils.clamp(msPerBeatTimingPoint.msPerBeat,
                    ParserConstants.MIN_MSPERBEAT_VALUE, ParserConstants.MAX_MSPERBEAT_VALUE),
                mapSliderVelocity: this.map.sv,
                mapTickRate: this.map.tickRate
            });
            ++this.map.sliders;
            this.map.objects.push(object);
        }
        else if (type & objectTypes.spinner) {
            const object = new Spinner({
                startTime: time,
                type: type,
                duration: parseInt(this.setPosition(s[5])) - time
            });
            if (!Parser.isNumberValid(object.duration)) {
                return this.warn("Ignoring malformed spinner: Value is too low or high");
            }
            ++this.map.spinners;
            this.map.objects.push(object);
        }
    }

    /**
     * Gets the index of the time at given timing points.
     * 
     * @param time The time to search.
     * @param timingPoints The timing points to search in.
     */
    private getTimingPointIndex(time: number, timingPoints: TimingPoint[]): TimingPoint {
        let currentTimingPoint: number|undefined = undefined;

        for (let i = 0; i < timingPoints.length; i++) {
            if (timingPoints[i].time > time) {
                currentTimingPoint = i - 1;
                break;
            }
        }

        if (currentTimingPoint === undefined)
            currentTimingPoint = timingPoints.length - 1;

        if (currentTimingPoint < 0) {
            currentTimingPoint = 0;
        }
        
        return timingPoints[currentTimingPoint];
    }

    /**
     * Applies stacking to hitobjects for beatmap version 6 or above.
     */
    private applyStacking(startIndex: number, endIndex: number): void {
        const stackDistance: number = 3;

        let timePreempt: number = 600;
        const ar: number = this.map.ar as number;
        if (ar > 5) {
            timePreempt = 1200 + (450 - 1200) * (ar - 5) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - (1200 - 1800) * (5 - ar) / 5;
        } else {
            timePreempt = 1200;
        }

        let extendedEndIndex: number = endIndex;
        const stackThreshold: number = timePreempt * this.map.stackLeniency;

        if (endIndex < this.map.objects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex: number = i;
                for (let n: number = stackBaseIndex + 1; n < this.map.objects.length; ++n) {
                    const stackBaseObject: HitObject = this.map.objects[stackBaseIndex];
                    if (stackBaseObject.type & objectTypes.spinner) {
                        break;
                    }

                    const objectN: HitObject = this.map.objects[n];
                    if (objectN.type & objectTypes.spinner) {
                        break;
                    }

                    const endTime: number = stackBaseObject.endTime;

                    if (objectN.startTime - endTime > stackThreshold) {
                        break;
                    }

                    const endPositionDistanceCheck: boolean =
                        stackBaseObject.type & objectTypes.slider ?
                        (stackBaseObject as Slider).endPosition.getDistance(objectN.position) < stackDistance
                        :
                        false;

                    if (stackBaseObject.position.getDistance(objectN.position) < stackDistance || endPositionDistanceCheck) {
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
            if (objectI.stackHeight !== 0 || (objectI.type & objectTypes.spinner)) {
                continue;
            }

            if (objectI.type & objectTypes.circle) {
                while (--n >= 0) {
                    const objectN: HitObject = this.map.objects[n];
                    if (objectN.type & objectTypes.spinner) {
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
                        objectN.type & objectTypes.slider ?
                        (objectN as Slider).endPosition.getDistance(objectI.position) < stackDistance
                        :
                        false;

                    if (endPositionDistanceCheck) {
                        const offset: number = objectI.stackHeight - objectN.stackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            const objectJ: HitObject = this.map.objects[j];
                            if ((objectN as Slider).endPosition.getDistance(objectJ.position) < stackDistance) {
                                objectJ.stackHeight -= offset;
                            }
                        }
                        break;
                    }

                    if (objectN.position.getDistance(objectI.position) < stackDistance) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI.type & objectTypes.slider) {
                while (--n >= startIndex) {
                    const objectN: HitObject = this.map.objects[n];
                    if (objectN.type & objectTypes.spinner) {
                        continue;
                    }

                    if (objectI.startTime - objectN.startTime > stackThreshold) {
                        break;
                    }

                    const objectNEndPosition: Vector2 = objectN.type & objectTypes.circle ? objectN.position : (objectN as Slider).endPosition;
                    if (objectNEndPosition.getDistance(objectI.position) < stackDistance) {
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
        if (this.map.ar as number > 5) {
            timePreempt = 1200 + (450 - 1200) * (this.map.ar as number - 5) / 5;
        } else if (this.map.ar as number < 5) {
            timePreempt = 1200 - (1200 - 1800) * (5 - (this.map.ar as number)) / 5;
        } else {
            timePreempt = 1200;
        }

        for (let i = 0; i < this.map.objects.length; ++i) {
            const currentObject: HitObject = this.map.objects[i];

            if (currentObject.stackHeight !== 0 && !(currentObject instanceof Slider)) {
                continue;
            }

            let startTime: number = currentObject.endTime;
            let sliderStack: number = 0;

            for (let j = i + 1; j < this.map.objects.length; ++j) {
                const stackThreshold: number = timePreempt * this.map.stackLeniency;

                if (this.map.objects[j].startTime - stackThreshold > startTime) {
                    break;
                }

                // The start position of the hitobject, or the position at the end of the path if the hitobject is a slider
                const position2: Vector2 = currentObject instanceof Slider ?
                    currentObject.endPosition : currentObject.position;

                if (this.map.objects[j].position.getDistance(currentObject.position) < stackDistance) {
                    ++currentObject.stackHeight;
                    startTime = this.map.objects[j].endTime;
                } else if (this.map.objects[j].position.getDistance(position2) < stackDistance) {
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
     * @param limit The threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     */
    private static isNumberValid(num: number, limit: number = ParserConstants.MAX_PARSE_VALUE): boolean {
        return !isNaN(num) && num >= -limit && num <= limit;
    }

    /**
     * Checks if each coordinates of a vector is within a given threshold.
     * 
     * @param vec The vector to check.
     * @param limit The threshold. Defaults to `ParserConstants.MAX_COORDINATE_VALUE`.
     */
    private static isVectorValid(vec: Vector2, limit: number = ParserConstants.MAX_COORDINATE_VALUE): boolean {
        return !isNaN(vec.x) && !isNaN(vec.y) && vec.x >= -limit && vec.x <= limit && vec.y >= -limit && vec.y <= limit;
    }
}