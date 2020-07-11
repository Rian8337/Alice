const Beatmap = require('./Beatmap');
const Timing = require('./Timing');
const HitObject = require('./HitObject');
const Circle = require('./Circle');
const Slider = require('./Slider');
const object_types = require('./object_types');

/**
 * A beatmap parser with just enough data for pp calculation.
 */
class Parser {
    constructor() {
        /**
         * @type {Beatmap}
         * @description The parsed map in `Beatmap` instance.
         */
        this.map = new Beatmap();
        this.reset()
    }

    /**
     * Resets the parser to its original state.
     */
    reset() {
        this.map.reset();

        /**
         * @type {number}
         * @description The amount of lines of `.osu` file.
         */
        this.line = 0;

        /**
         * @type {string}
         * @description The currently processed line.
         */
        this.current_line = '';

        /**
         * @type {string}
         * @description The previously processed line.
         */
        this.last_position = '';

        /**
         * @type {string}
         * @description The currently processed section.
         */
        this.section = '';
    }

    /**
     * Parses a beatmap.
     * 
     * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
     *
     * @param {string} str The `.osu` file of the beatmap in UTF-8 format.
     * @returns {Parser} The current instance of the parser with the processed beatmap.
     */
    parse(str) {
        let lines = str.split("\n");
        for (let i = 0; i < lines.length; ++i) {
            this._process_line(lines[i])
        }
        return this
    }

    /**
     * Processes a line of the file.
     *
     * @param {string} line The current line of the file.
     * @returns {Parser} The parser's current state.
     * @private
     */
    _process_line(line) {
        this.current_line = this.last_position = line;
        ++this.line;

        // comments
        if (line.startsWith(" ") || line.startsWith("_")) {
            return this;
        }

        // now that we've handled space comments we can trim space
        line = this.current_line = line.trim();
        if (line.length <= 0) {
            return this;
        }

        // c++ style comments
        if (line.startsWith("//")) {
            return this;
        }

        // [SectionName]
        if (line.startsWith("[")) {
            if (this.section === "Difficulty" && !this.map.ar) {
                this.map.ar = this.map.od
            }
            this.section = line.substring(1, line.length - 1);
            return this
        }

        if (!line) {
            return this;
        }

        switch (this.section) {
            case "Metadata": this._metadata(); break;
            case "General": this._general(); break;
            case "Difficulty": this._difficulty(); break;
            case "TimingPoints": this._timing_points(); break;
            case "HitObjects": this._objects(); break;
            default:
                let fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) {
                    break;
                }
                this.map.format_version = parseInt(line.substring(fmtpos + 13));
                break;
        }
        return this;
    }

    /**
     * Sets the last position of the current parser state.
     * 
     * This is useful to debug syntax errors.
     *
     * @param {string} str The line to set the last position on.
     * @returns {string|string} The last position of the parser.
     * @private
     */
    _setpos(str) {
        this.last_position = str.trim();
        return this.last_position;
    }

    /**
     * Warns the user for any syntax errors.
     * @private
     */
    _warn() {
        console.warn.apply(null, Array.prototype.slice.call(arguments));
        console.warn(this.toString());
    }

    /**
     * Processes a property of the beatmap. This takes the current line as parameter.
     * 
     * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
     * @returns {string[]} The processed property of the beatmap.
     * @private
     */
    _property() {
        let s = this.current_line.split(":", 2);
        s[0] = this._setpos(s[0]);
        s[1] = this._setpos(s[1]);
        return s;
    }

    /**
     * Processes the metadata section of a beatmap.
     * @private
     */
    _metadata() {
        let p = this._property();
        switch (p[0]) {
            case "Title":
                this.map.title = p[1];
                break;
            case "TitleUnicode":
                this.map.title_unicode = p[1];
                break;
            case "Artist":
                this.map.artist = p[1];
                break;
            case "ArtistUnicode":
                this.map.artist_unicode = p[1];
                break;
            case "Creator":
                this.map.creator = p[1];
                break;
            case "Version":
                this.map.version = p[1]
        }
    }

    /**
     * Processes the general section of a beatmap.
     * @private
     */
    _general() {
        let p = this._property();
        if (p[0] !== "Mode") {
            return;
        }
        this.map.mode = parseInt(this._setpos(p[1]))
    }

    /**
     * Processes the difficulty section of a beatmap.
     * @private
     */
    _difficulty() {
        let p = this._property();
        switch (p[0]) {
            case "CircleSize":
                this.map.cs = parseFloat(this._setpos(p[1]));
                break;
            case "OverallDifficulty":
                this.map.od = parseFloat(this._setpos(p[1]));
                break;
            case "ApproachRate":
                this.map.ar = parseFloat(this._setpos(p[1]));
                break;
            case "HPDrainRate":
                this.map.hp = parseFloat(this._setpos(p[1]));
                break;
            case "SliderMultiplier":
                this.map.sv = parseFloat(this._setpos(p[1]));
                break;
            case "SliderTickRate":
                this.map.tick_rate = parseFloat(this._setpos(p[1]))
        }
    }

    /**
     * Processes the timing points section of a beatmap.
     * @private
     */
    _timing_points() {
        let s = this.current_line.split(",");
        if (s.length > 8) {
            this._warn("timing point with trailing values")
        } else if (s.length < 2) {
            return this._warn("ignoring malformed timing point")
        }
        let t = new Timing({
            time: parseFloat(this._setpos(s[0])),
            ms_per_beat: parseFloat(this._setpos(s[1]))
        });
        if (s.length >= 7) {
            t.change = s[6].trim() !== "0";
        }
        this.map.timing_points.push(t);
    }

    /**
     * Processes the objects section of a beatmap.
     * @private
     */
    _objects() {
        let s = this.current_line.split(",");
        let d;
        if (s.length > 11) {
            this._warn("object with trailing values");
        } else if (s.length < 4) {
            return this._warn("ignoring malformed hitobject")
        }
        let obj = new HitObject({
            time: parseFloat(this._setpos(s[2])),
            type: parseInt(this._setpos(s[3]))
        });
        if (isNaN(obj.time) || isNaN(obj.type)) {
            return this._warn("ignoring malformed hitobject")
        }
        if (obj.type & object_types.circle) {
            ++this.map.circles;
            d = obj.data = new Circle({
                pos: [
                    parseFloat(this._setpos(s[0])),
                    parseFloat(this._setpos(s[1]))
                ]
            });
            if (isNaN(d.pos[0]) || isNaN(d.pos[1])) {
                return this._warn("ignoring malformed circle")
            }
        }
        else if (obj.type & object_types.slider) {
            if (s.length < 8) {
                return this._warn("ignoring malformed slider");
            }
            ++this.map.sliders;
            d = obj.data = new Slider({
                pos: [
                    parseFloat(this._setpos(s[0])),
                    parseFloat(this._setpos(s[1])),
                ],
                repetitions: parseInt(this._setpos(s[6])),
                distance: parseFloat(this._setpos(s[7]))
            });
            if (isNaN(d.pos[0]) || isNaN(d.pos[1]) || isNaN(d.repetitions) || isNaN(d.distance)) {
                return this._warn("ignoring malformed slider");
            }
        }
        else if (obj.type & object_types.spinner) {
            ++this.map.spinners
        }
        this.map.objects.push(obj)
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return (
            "at line " + this.line + "\n" +
            this.current_line + "\n" +
            "-> " + this.last_position + " <-"
        );
    }
}

module.exports = Parser;