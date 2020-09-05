import { Beatmap } from '../beatmap/Beatmap';
import { TimingPoint } from '../beatmap/timings/TimingPoint';
import { BreakPoint } from '../beatmap/timings/BreakPoint';
import { Circle } from '../beatmap/hitobjects/Circle';
import { Slider } from '../beatmap/hitobjects/Slider';
import { Spinner } from '../beatmap/hitobjects/Spinner';
import { objectTypes } from '../constants/objectTypes';
import { Vector } from './Vector';

/**
 * A beatmap parser with just enough data for pp calculation.
 */
export class Parser {
    /**
     * The parsed beatmap.
     */
    public map: Beatmap;

    /**
     * The amount of lines of `.osu` file.
     */
    private line: number;

    /**
     * The currently processed line.
     */
    private currentLine: string;

    /**
     * The previously processed line.
     */
    private lastPosition: string;

    /**
     * The currently processed section.
     */
    private section: string;

    constructor() {
        this.map = new Beatmap();
        this.line = 0;
        this.currentLine =
        this.lastPosition =
        this.section = "";
    }

    /**
     * Parses a beatmap.
     * 
     * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
     */
    parse(str: string): Parser {
        const lines: string[] = str.split("\n");
        for (let i: number = 0; i < lines.length; ++i) {
            this.processLine(lines[i]);
        }
        return this;
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
    private warn(args: any): void {
        console.warn.apply(null, args);
        console.warn(this.toString());
    }

    /**
     * Processes a property of the beatmap. This takes the current line as parameter.
     * 
     * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
     */
    private property(): string[] {
        const s: string[] = this.currentLine.split(":", 2);
        s[0] = this.setPosition(s[0]);
        s[1] = this.setPosition(s[1]);
        return s;
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
        const t: TimingPoint = new TimingPoint({
            time: parseFloat(this.setPosition(s[0])),
            msPerBeat: parseFloat(this.setPosition(s[1]))
        });
        if (s.length >= 7) {
            t.change = s[6].trim() !== "0";
        }
        this.map.timingPoints.push(t);
    }

    /**
     * Processes the objects section of a beatmap.
     */
    private objects(): void {
        const s: string[] = this.currentLine.split(",");
        if (s.length > 11) {
            this.warn("Object with trailing values");
        } else if (s.length < 4) {
            return this.warn("iIgnoring malformed hitobject");
        }
        const time: number = parseFloat(this.setPosition(s[2]));
        const type: number = parseInt(this.setPosition(s[3]));
        if (isNaN(time) || isNaN(type)) {
            return this.warn("Ignoring malformed hitobject");
        }
        
        const position: Vector = new Vector({
            x: parseFloat(this.setPosition(s[0])),
            y: parseFloat(this.setPosition(s[1]))
        });

        if (type & objectTypes.circle) {
            ++this.map.circles;
            const object = new Circle({
                time: time,
                type: type,
                pos: position
            });
            if (isNaN(object.pos.x) || isNaN(object.pos.y)) {
                return this.warn("Ignoring malformed circle");
            }
            this.map.objects.push(object);
        }
        else if (type & objectTypes.slider) {
            if (s.length < 8) {
                return this.warn("Ignoring malformed slider");
            }
            ++this.map.sliders;
            const object = new Slider({
                time: time,
                type: type,
                pos: position,
                repetitions: parseInt(this.setPosition(s[6])),
                distance: parseFloat(this.setPosition(s[7]))
            });
            if (isNaN(object.pos.x) || isNaN(object.pos.y) || isNaN(object.repetitions) || isNaN(object.distance)) {
                return this.warn("Ignoring malformed slider");
            }
            this.map.objects.push(object);
        }
        else if (type & objectTypes.spinner) {
            ++this.map.spinners;
            const object = new Spinner({
                time: time,
                type: type,
                duration: parseFloat(s[5]) - parseFloat(s[2])
            });
            this.setPosition(s[5]);
            if (isNaN(object.duration)) {
                return this.warn("Ignoring malformed spinner");
            }
            this.map.objects.push(object);
        }
    }

    /**
     * Returns a string representative of the class.
     *
     */
    toString(): string {
        return (
            "at line " + this.line + "\n" +
            this.currentLine + "\n" +
            "-> " + this.lastPosition + " <-"
        );
    }
}