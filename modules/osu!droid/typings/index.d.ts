declare module "osu-droid" {
    /**
     * Constants for modes (switch between osu! and osu!droid).
     */
    export enum modes {
        droid = "droid",
        osu = "osu"
    }

    /**
     * Ranking status of a beatmap.
     */
    export enum rankedStatus {
        GRAVEYARD = -2,
        WIP = -1,
        PENDING = 0,
        RANKED = 1,
        APPRVOED = 2,
        QUALIFIED = 3,
        LOVED = 4
    }

    /**
     * Movement type of a cursor in an osu!droid replay.
     */
    export enum movementType {
        DOWN = 0,
        MOVE = 1,
        UP = 2
    }

    /**
     * The result of a hit in an osu!droid replay.
     */
    export enum hitResult {
        /**
         * Miss (0).
         */
        RESULT_0 = 1,

        /**
         * Meh (50).
         */
        RESULT_50 = 2,

        /**
         * Great (100).
         */
        RESULT_100 = 2,

        /**
         * Good (300).
         */
        RESULT_300 = 3
    }

    /**
     * Bitwise enum for gamemodes.
     */
    export enum gamemode {
        std = 0,
        taiko = 1,
        ctb = 2,
        mania = 3
    }

    /**
     * Whether or not an osu!droid replay result is a full combo.
     */
    export enum replayFullCombo {
        TRUE = 1,
        FALSE = 0
    }

    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    export class Accuracy {
        /**
         * Calculates accuracy based on given parameters.
         * 
         * If `percent` and `nobjects` are specified, `n300`, `n100`, and `n50` will
         * be automatically calculated to be the closest to the given
         * acc percent.
         * 
         * @param {Object} values An object containing parameters.
         * @param {number} [values.nobjects] The amount of objects in the beatmap.
         * @param {number} [values.percent] The accuracy achieved.
         * @param {number} [values.n300] The amount of 300s achieved.
         * @param {number} [values.n100] The amount of 100s achieved.
         * @param {number} [values.n50] The amount of 50s achieved.
         * @param {number} [values.nmiss] The amount of miss count achieved.
         */
        constructor(values: {
            nobjects?: number,
            percent?: number,
            n300?: number,
            n100?: number,
            n50?: number,
            nmiss?: number
        });

        /**
         * The amount of 300s achieved.
         */
        n300: number;

        /**
         * The amount of 100s achieved.
         */
        n100: number;

        /**
         * The amount of 50s achieved.
         */
        n50: number;

        /**
         * The amount of misses achieved.
         */
        nmiss: number;

        /**
         * Computes the accuracy value (0.0 - 1.0).
         * 
         * If `n300` was specified in the constructor, `nobjects` is not reqired and will be automatically computed.
         *
         * @param {number} [nobjects] The amount of objects in the beatmap.
         * @returns {number} The accuracy value ranging from 0.0 to 1.0.
         */
        value(nobjects?: number): number;

        /**
         * Returns the string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a beatmap with advanced information.
     */
    export class Beatmap {
        constructor();

        /**
         * The format version of the beatmap.
         */
        format_version: number;

        /**
         * The game mode of the beatmap. 0 is osu!standard, 1 is Taiko, 2 is Catch the Beat, 3 is osu!mania.
         */
        mode: gamemode;

        /**
         * The title of the song of the beatmap.
         */
        title: string;

        /**
         * The unicode title of the song of the beatmap.
         */
        title_unicode: string;

        /**
         * The artist of the song of the beatmap.
         */
        artist: string;

        /**
         * The unicode artist of the song of the beatmap.
         */
        artist_unicode: string;

        /**
         * The creator of the beatmap.
         */
        creator: string;

        /**
         * The difficulty name of the beatmap.
         */
        version: string;

        /**
         * The approach rate of the beatmap.
         */
        ar?: number;

        /**
         * The circle size of the beatmap.
         */
        cs: number;

        /**
         * The overall difficulty of the beatmap.
         */
        od: number;

        /**
         * The health drain rate of the beatmap.
         */
        hp: number;

        /**
         * The slider velocity of the beatmap.
         */
        sv: number;

        /**
         * The slider tick rate of the beatmap.
         */
        tick_rate: number;

        /**
         * The amount of circles in the beatmap.
         */
        circles: number;

        /**
         * The amount of sliders in the beatmap.
         */
        sliders: number;

        /**
         * The amount of spinners in the beatmap.
         */
        spinners: number;

        /**
         * The hitobjects of the beatmap.
         */
        objects: HitObject[];

        /**
         * The timing points of the beatmap.
         */
        timing_points: Timing[];

        /**
         * Resets the instance to its original state.
         */
        reset(): void;

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
        max_combo(): number;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} A string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a circle in a beatmap.
     * 
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    export class Circle {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {[number, number]} values.pos The position of the circle in `[x, y]` osupixels.
         */
        constructor(values: {
            pos: [number, number]
        });

        /**
         * The position of the circle in `[x, y]` osupixels.
         */
        pos: [number, number];

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a cursor in an osu!droid replay.
     * 
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    export class CursorData {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.size The amount of times the instance has showed up in the replay.
         * @param {number[]} values.time The time during which the cursor is active in milliseconds.
         * @param {number[]} values.x The x coordinate of the cursor in osupixels.
         * @param {number[]} values.y The y coordinate of the cursor in osupixels.
         * @param {movementType[]} values.id The movement bitwise type of the cursor instance
         */
        constructor(values: {
            size: number,
            time: number[],
            x: number[],
            y: number[],
            id: movementType[]
        });

        /**
         * The amount of times the instance has showed up in the replay.
         */
        size: number;

        /**
         * The time during which the cursor is active in milliseconds.
         */
        time: number[];

        /**
         * The x coordinate of the cursor in osupixels.
         */
        x: number[];

        /**
         * The y coordinate of the cursor in osupixels.
         */
        y: number[];

        /**
         * The movement bitwise type of the cursor instance.
         */
        id: movementType[];
    }

    /**
     * Represents a hitobject in a beatmap.
     *
     * The only common property is start time (in milliseconds).
     * Object-specific properties are stored in `data`, which can be
     * an instance of `Circle`, `Slider`, or `null`.
     */
    export class HitObject {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.time The start time of the object in milliseconds.
         * @param {number} values.type The bitwise type of the hitobject (circle/slider/spinner).
         * @param {Circle|Slider|null} [values.data] The data of the hitobject (Circle/Slider/`null`).
         */
        constructor(values: {
            time: number,
            type: object_types,
            data?: Circle|Slider
        });

        /**
         * The start time of the object in milliseconds.
         */
        time: number;

        /**
         * The bitwise type of the hitobject (circle/slider/spinner).
         */
        type: object_types;

        /**
         * The data of the hitobject, which can be an instance of `Circle`, `Slider` or `null`.
         */
        data?: Circle|Slider;

        /**
         * Returns the hitobject type.
         *
         * @returns {string} The hitobject type.
         */
        typeStr(): string;

        /**
         * Returns the string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a beatmap with general information.
     */
    export class MapInfo {
        constructor();

        /**
         * The title of the song of the beatmap.
         */
        title: string;

        /**
         * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
         */
        full_title: string;

        /**
         * The artist of the song of the beatmap.
         */
        artist: string;

        /**
         * The creator of the beatmap.
         */
        creator: string;

        /**
         * The difficulty name of the beatmap. 
         */
        version: string;

        /**
         * The ranking status of the beatmap.
         */
        approved: rankedStatus;

        /**
         * The beatmap's game mode.
         */
        mode: gamemode;

        /**
         * The ID of the beatmap.
         */
        beatmap_id: number;

        /**
         * The ID of the beatmapset containing the beatmap.
         */
        beatmapset_id: number;

        /**
         * The amount of times the beatmap has been played.
         */
        plays: number;

        /**
         * The amount of times the beatmap has been favorited.
         */
        favorites: number;

        /**
         * The date of which the beatmap was submitted.
         */
        submit_date: Date;

        /**
         * The date of which the beatmap was last updated.
         */
        last_update: Date;

        /**
         * The duration of the beatmap not including breaks.
         */
        hit_length: number;

        /**
         * The duration of the beatmap including breaks.
         */
        total_length: number;

        /**
         * The BPM of the beatmap.
         */
        bpm: number;

        /**
         * The amount of circles in the beatmap.
         */
        circles: number;

        /**
         * The amount of sliders in the beatmap.
         */
        sliders: number;

        /**
         * The amount of spinners in the beatmap.
         */
        spinners: number;

        /**
         * The amount of objects in the beatmap.
         */
        objects: number;

        /**
         * The maximum combo of the beatmap.
         */
        max_combo: number;

        /**
         * The circle size of the beatmap.
         */
        cs: number;

        /**
         * The approach rate of the beatmap.
         */
        ar: number;

        /**
         * The overall difficulty of the beatmap.
         */
        od: number;

        /**
         * The health drain of the beatmap.
         */
        hp: number;

        /**
         * The beatmap packs that contain this beatmap. `null` if not available.
         */
        packs?: string;

        /**
         * The aim difficulty rating of the beatmap.
         */
        diff_aim: number;

        /**
         * The speed difficulty rating of the beatmap.
         */
        diff_speed: number;

        /**
         * The generic difficulty rating of the beatmap.
         */
        diff_total: number;

        /**
         * The MD5 hash of the beatmap.
         */
        hash: string;

        /**
         * The `.osu` file of the beatmap (required for some functions).
         */
        osu_file: string;

        /**
         * The parsed beatmap from beatmap parser.
         */
        map?: Beatmap;

        /**
         * Whether or not the fetch result from `get()` returns an error. This should be immediately checked after calling said method.
         */
        error: boolean;

        /**
         * Retrieve a beatmap's general information.
         * 
         * Either beatmap ID or MD5 hash of the beatmap must be specified.
         *
         * @param {Object} params An object containing parameters.
         * @param {number} [params.beatmap_id] The beatmap ID of the beatmap.
         * @param {string} [params.hash] The MD5 hash of the beatmap.
         * @param {boolean} [params.file=true] Whether or not to download the .osu file of the beatmap (required for beatmap parser utilities)
         * @returns {Promise<MapInfo>} The current class instance with the beatmap's information.
         */
        get(params: {
            beatmap_id?: number,
            hash?: string,
            file?: boolean|true
        }): Promise<MapInfo>;

        /**
         * Shows the beatmap's statistics based on applied mods and option.
         * 
         * - Option `0`: return map title and mods used if defined
         * - Option `1`: return map download link to official web, bloodcat, and sayobot
         * - Option `2`: return CS, AR, OD, HP
         * - Option `3`: return BPM, map length, max combo
         * - Option `4`: return last update date and map status
         * - Option `5`: return favorite count and play count
         *
         * @param {string} mods The mod string applied.
         * @param {number} option The option to apply as described.
         * @returns {string} The statistics based on applied option.
         */
        showStatistics(mods: string, option: number): string;

        /**
         * Returns a color integer based on the beatmap's ranking status.
         * 
         * Useful to make embed messages.
         *
         * @returns {number} An integer representing a color.
         */
        statusColor(): number;

        /**
         * Calculates the droid maximum score of the beatmap.
         * 
         * This requires the `file` property set to `true` when retrieving beatmap general information using `MapInfo.get()`.
         *
         * @param {string} [mod] The mod string applied. This will amplify the score multiplier.
         * @returns {number} The maximum score of the beatmap. If `file` property was set to `false`, returns `0`.
         */
        max_score(mod?: string): number;

        /**
         * Returns the string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    export class MapPP {
        constructor();

        /**
         * The aim performance points value.
         */
        aim: number;

        /**
         * The speed performance points value.
         */
        speed: number;

        /**
         * The accuracy performance points value.
         */
        acc: number;

        /**
         * The total performance points value. This is the most commonly used value.
         */
        total: number;

        /**
         * The calculated accuracy.
         */
        computed_accuracy?: Accuracy;

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
        calculate(params: {
            map?: Beatmap,
            stars?: StandardDiff,
            acc_percent?: number,
            mode?: modes,
            aim_stars?: number,
            speed_stars?: number,
            max_combo?: number,
            nsliders?: number,
            ncircles?: number,
            nobjects?: number,
            base_ar?: number,
            base_od?: number,
            mods?: string,
            combo?: number,
            n300?: number,
            n100?: number,
            n50?: number,
            nmiss?: number,
            score_version?: number
        }): MapPP;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
     */
    export class MapStars {
        constructor();

        /**
         * The osu!droid star rating of the beatmap.
         */
        droid_stars: StandardDiff;

        /**
         * The osu!standard star rating of the beatmap.
         */
        pc_stars: StandardDiff;

        /**
         * Calculates the star rating of a map.
         * 
         * The beatmap will be automatically parsed using parser utilities.
         *
         * @param {Object} params An object containing the parameters.
         * @param {string} params.file The `.osu` file of the map.
         * @param {string} [params.mods] The applied mods.
         * @returns {MapStars} The current instance, which contains the results.
         */
        calculate(params: {
            file: string,
            mods?: string
        }): MapStars;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Holds general beatmap statistics for further modifications. 
     */
    export class MapStats {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} [values.cs] The circle size of the beatmap.
         * @param {number} [values.ar] The approach rate of the beatmap.
         * @param {number} [values.od] The overall difficulty of the beatmap.
         * @param {number} [values.hp] The health drain rate of the beatmap.
         * @param {string} [values.mods] The enabled modifications in osu!standard string. This will be automatically converted to droid modbits (TouchDevice mod will be automatically applied if haven't already) and PC modbits.
         */
        constructor(values: {
            cs?: number,
            ar?: number,
            od?: number,
            hp?: number,
            mods?: string
        });

        /**
         * The circle size of the beatmap.
         */
        cs?: number;

        /**
         * The approach rate of the beatmap.
         */
        ar?: number;

        /**
         * The overall difficulty of the beatmap.
         */
        od?: number;

        /**
         * The health drain of the beatmap.
         */
        hp?: number;

        /**
         * The enabled modifications in osu!standard string.
         */
        mods?: string;

        /**
         * The bitwise enum of enabled modifications for osu!droid.
         */
        droid_mods: mods;

        /**
         * The bitwise enum of enabled modifications for osu!standard.
         */
        pc_mods: mods;
        
        /**
         * The speed multiplier based on applied mods. This will be used in AR and OD calculation as well as star rating calculation.
         */
        speed_multiplier: number;

        /**
         * Calculates map statistics with mods applied.
         *
         * @param {Object} params An object containing the parameters.
         * @param {string} [params.mode=osu] Whether to convert for droid statistics or PC statistics.
         * @param {string} [params.mods] Applied modifications in osu!standard string. Can be omitted if ths has been applied in the constructor.
         * @returns {MapStats} A new MapStats instance containing calculated map statistics.
         */
        calculate(params: {
            mods?: string,
            mode?: modes
        }): MapStats;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * An object containing bitwise constant of mods in both
     * osu!droid and osu!standard as well as conversion methods.
     */
    export enum mods {
        /**
         * NoFail (osu!droid).
         */
        n = 1 << 0,

        /**
         * Easy (osu!droid).
         */
        e = 1 << 1,

        /**
         * Hidden (osu!droid).
         */
        h = 1 << 3,
        
        /**
         * HardRock (osu!droid).
         */
        r = 1 << 4,

        /**
         * DoubleTime (osu!droid).
         */
        d = 1 << 6,

        /**
         * HalfTime (osu!droid).
         */
        t = 1 << 8,

        /**
         * NightCore (osu!droid).
         */
        c = 1 << 9,

        /**
         * No mod (osu!standard).
         */
        nomod = 0,

        /**
         * NoFail (osu!standard).
         */
        nf = 1 << 0,

        /**
         * Easy (osu!standard).
         */
        ez = 1 << 1,

        /**
         * TouchDevice (osu!standard).
         */
        td = 1 << 2,

        /**
         * Hidden (osu!standard).
         */
        hd = 1 << 3,

        /**
         * HardRock (osu!standard).
         */
        hr = 1 << 4,

        /**
         * DoubleTime (osu!standard).
         */
        dt = 1 << 6,

        /**
         * Relax (osu!standard).
         */
        rx = 1 << 7,

        /**
         * HalfTime (osu!standard).
         */
        ht = 1 << 8,

        /**
         * NightCore (osu!standard).
         */
        nc = 1 << 9,

        /**
         * Flashlight (osu!standard).
         */
        fl = 1 << 10,

        /**
         * SpunOut (osu!standard).
         */
        so = 1 << 12,

        /**
         * AutoPilot (osu!standard).
         */
        ap = 1 << 13,

        /**
         * ScoreV2 (osu!standard).
         */
        v2 = 1 << 29,

        /**
         * The bitwise enum of speed-changing mods combined (DT, NC, and HT).
         */
        speed_changing = dt | hr | nc,

        /**
         * The bitwise enum of map-changing mods combined (speed-changing mods (DT, NC, and HT), EZ, and HR).
         */
        map_changing = hr | ez | speed_changing,

        /**
         * The bitwise enum of unranked mods combined (RX and AP).
         */
        unranked = so | ap
    }

    /**
     * An object containing bitwise constant of mods in both
     * osu!droid and osu!standard as well as conversion methods.
     */
    export namespace mods {
        /**
         * Converts droid mod string to modbits.
         *
         * @param {string} [mod] The mod string to convert.
         * @returns {number} The mods bitwise.
         */
        export function droid_to_modbits(mod?: string): number;

        /**
         * Converts droid mod string to PC mod string.
         * 
         * You can choose to return a detailed string by specifying `detailed = true`.
         *
         * @param {string} [mod] The mod string to convert.
         * @param {boolean} [detailed=false] Whether or not to return detailed string such as [Hidden, DoubleTime] as opposed of [HDDT].
         * @returns {string} The converted mods.
         */
        export function droid_to_PC(mod?: string, detailed?: boolean): string;

        /**
         * Converts PC mods to a detailed string.
         *
         * @param {string} [mod] The mods to convert.
         * @returns {string} The detailed mod string.
         */
        export function pc_to_detail(mod?: string): string;

        /**
         * Construct the mods bitwise from a string such as "HDHR".
         *
         * @param {string} [str] The mod string to construct the mods bitwise from.
         * @returns {number} The mods bitwise.
         */
        export function modbits_from_string(mod?: string): number;

        /**
         * Convert mods bitwise into a string, such as "HDHR".
         *
         * @param {mods} [mod] The mods bitwise to convert.
         * @returns {string} The converted mods.
         */
        export function modbits_to_string(mod?: mods): string;
    }

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    export enum object_types {
        /**
         * The bitwise constant of circle.
         */
        circle = 1 << 0,

        /**
         * The bitwise constant of slider.
         */
        slider = 1 << 1,

        /**
         * The bitwise constant of spinner.
         */
        spinner = 1 << 3
    }

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    export class Parser {
        constructor();

        /**
         * The parsed map in `Beatmap` instance.
         */
        map: Beatmap;

        /**
         * The amount of lines of `.osu` file.
         */
        line: number;

        /**
         * The currently processed line.
         */
        current_line: string;

        /**
         * The previously processed line.
         */
        last_position: string;

        /**
         * The currently processed section.
         */
        section: string;

        /**
         * Parses a beatmap.
         * 
         * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
         *
         * @param {string} str The `.osu` file of the beatmap in UTF-8 format.
         * @returns {Parser} The current instance of the parser with the processed beatmap.
         */
        parse(str: string): Parser;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents an osu!droid player.
     */
    export class Player {
        constructor();

        /**
         * The uid of the player.
         */
        uid: number;

        /**
         * The username of the player.
         */
        name: string;

        /**
         * The avatar URL of the player.
         */
        avatarURL: string;

        /**
         * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
         */
        location: string;

        /**
         * The email attached to the player's account.
         */
        email: string;

        /**
         * The current rank of the player.
         */
        rank: number;

        /**
         * The current total score of the player.
         */
        score: number;

        /**
         * The overall accuracy of the player.
         */
        accuracy: number;

        /**
         * The amount of times the player has played.
         */
        play_count: number;

        /**
         * Recent plays of the player.
         */
        recent_plays: Score[];

        /**
         * Whether or not the fetch result from `get()` returns an error. This should be immediately checked after calling said method.
         */
        error: boolean;

        /**
         * Retrieves a player's info based on uid or username.
         * 
         * Either uid or username must be specified.
         *
         * @param {Object} params An object containing the parameters.
         * @param {number} [params.uid] The uid to retrieve.
         * @param {string} [params.username] The username to retrieve.
         * @returns {Promise<Player>} The current instance containing the player's information.
         */
        get(params: {
            uid?: number,
            username?: string
        }): Promise<Player>;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Calculates the performance points of given mode and play result.
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
     * @param {number} [params.miss=0] The amount of misses achieved.
     * @param {number} [params.acc_percent=100] The accuracy achieved.
     * @param {string} [params.file] The `.osu` file of the beatmap. Required if `stars` is not defined.
     * @param {string} [params.mods] The applied mods. Required if `stars` is not defined.
     * @param {Beatmap} [params.map] The beatmap to calculate difficulty for.
     * @param {StandardDiff} [params.stars] The star rating of the beatmap.
     * @param {modes} [params.mode=osu] The mode to calculate difficulty for.
     * @param {number} [params.aim_stars] The aim star rating of the beatmap.
     * @param {number} [params.speed_stars] The speed star rating of the beatmap.
     * @param {number} [params.max_combo] The maximum combo of the beatmap.
     * @param {number} [params.nsliders] The amount of sliders in the beatmap.
     * @param {number} [params.ncircles] The amount of circles in the beatmap.
     * @param {number} [params.nobjects] The amount of objects in the beatmap.
     * @param {number} [params.base_ar=5] The base AR of the beatmap.
     * @param {number} [params.base_od=5] The base OD of the beatmap.
     * @param {number} [params.combo] The maximum combo achieved. Defaults to `max_combo - nmiss`.
     * @param {number} [params.n300] The amount of 300s achieved. Defaults to `nobjects - n100 - n50 - nmiss`.
     * @param {number} [params.n100=0] The amount of 100s achieved.
     * @param {number} [params.n50=0] The amount of 50s achieved.
     * @param {number} [params.nmiss=0] THe amount of misses achieved.
     * @param {number} [params.score_version=1] The scoring version to use (`1` or `2`).
     *
     * @returns {MapPP} A `MapPP` instance containing the results.
     */
    export function ppv2(params: {
        stars?: StandardDiff,
        miss?: number,
        acc_percent?: number,
        combo?: number,
        file?: string,
        mods?: string,
        map?: Beatmap,
        mode?: modes,
        aim_stars?: number,
        speed_stars?: number,
        max_combo?: number,
        nsliders?: number,
        ncircles?: number,
        nobjects?: number,
        base_ar?: number,
        base_od?: number,
        n300?: number,
        n100?: number,
        n50?: number,
        nmiss?: number,
        score_version?: number
    }): MapPP;

    /**
     * An object containing links of rank images and a method to return them.
     */
    export enum rankImage {
        /**
         * Image link for S rank.
         */
        S = "http://ops.dgsrz.com/assets/images/ranking-S-small.png",

        /**
         * Image link for A rank.
         */
        A = "http://ops.dgsrz.com/assets/images/ranking-A-small.png",

        /**
         * Image link for B rank.
         */
        B = "http://ops.dgsrz.com/assets/images/ranking-B-small.png",

        /**
         * Image link for C rank.
         */
        C = "http://ops.dgsrz.com/assets/images/ranking-C-small.png",

        /**
         * Image link for D rank.
         */
        D = "http://ops.dgsrz.com/assets/images/ranking-D-small.png",

        /**
         * Image link for SH rank.
         */
        SH = "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",

        /**
         * Image link for X (SS) rank.
         */
        X = "http://ops.dgsrz.com/assets/images/ranking-X-small.png",

        /**
         * Image link for XH (SSH) rank.
         */
        XH = "http://ops.dgsrz.com/assets/images/ranking-XH-small.png"
    }

    /**
     * An object containing links of rank images and a method to return them.
     */
    export namespace rankImage {
        /**
         * Returns a rank image URL based on given rank.
         *
         * @param {string} [rank] The rank to return.
         * @returns {string} The image URL of the rank.
         */
        export function get(rank?: string): string;
    }

    /**
     * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
     * 
     * Once analyzed, the result can be accessed via the `data` property.
     */
    export class ReplayAnalyzer {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.score_id The score ID of the score to analyze.
         */
        constructor(values: {
            score_id: number
        });

        /**
         * The score ID of the replay.
         */
        score_id: number;
        
        /**
         * The original odr file of the replay.
         */
        original_odr?: Buffer;

        /**
         * The fixed odr file of the replay.
         */
        fixed_odr?: Buffer;

        /**
         * Whether or not the play is considered using >=3 finger abuse.
         */
        is3Finger?: boolean;

        /**
         * The results of the analyzer. `null` when initialized.
         */
        data?: ReplayData;

        /**
         * Asynchronously analyzes a replay.
         *
         * @returns {Promise<ReplayAnalyzer>} The current instance containing analyzed replay data in the `data` property.
         */
        analyze(): Promise<ReplayAnalyzer>;
    }

    /**
     * Represents a replay data in an osu!droid replay.
     * 
     * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    export class ReplayData {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.replay_version The version of the replay.
         * @param {string} values.folder_name The folder name containing the beatmap played.
         * @param {string} values.file_name The file name of the beatmap played.
         * @param {string} values.hash MD5 hash of the replay.
         * @param {number} values.time The epoch date of which the play was set in milliseconds. This will be automatically converted into a `Date` object.
         * @param {number} values.hit300k The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         * @param {number} values.hit300 The amount of 300s achieved in the play.
         * @param {number} values.hit100k The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         * @param {number} values.hit100 The amount of 100s achieved in the play.
         * @param {number} values.hit50 The amount of 50s achieved in the play.
         * @param {number} values.hit0 The amount of misses achieved in the play.
         * @param {number} values.score The total score achieved in the play.
         * @param {number} values.max_combo The maximum combo achieved in the play.
         * @param {number} values.accuracy The accuracy achieved in the play.
         * @param {number} values.is_full_combo Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
         * @param {string} values.player_name The name of the player in the replay.
         * @param {string} values.raw_mods Enabled modifications in the replay in raw form.
         * @param {string} values.droid_mods Enabled modifications in the replay in osu!droid form.
         * @param {string} values.converted_mods Enabled modifications in the replay in osu!standard form.
         * @param {CursorData[]} values.cursor_movement The cursor movement data of the replay.
         * @param {ReplayObjectData[]} values.hit_object_data The hitobject data of the replay.
         */
        constructor(values: {
            replay_version: number,
            folder_name: string,
            file_name: string,
            hash: string,
            time: number,
            hit300k: number,
            hit300: number,
            hit100k: number,
            hit100: number,
            hit50: number,
            hit0: number,
            score: number,
            max_combo: number,
            accuracy: number,
            is_full_combo: number,
            player_name: string,
            raw_mods: string,
            droid_mods: string,
            converted_mods: string,
            cursor_movement: CursorData[],
            hit_object_data: ReplayObjectData[]
        });

        /**
         * The version of the replay.
         */
        replay_version: number;

        /**
         * The folder name containing the beatmap played.
         */
        folder_name: string;
        
        /**
         * The file name of the beatmap played.
         */
        file_name: string;

        /**
         * MD5 hash of the replay.
         */
        hash: string;

        /**
         * The date of which the play was set.
         */
        time: Date;

        /**
         * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         */
        hit300k: number;

        /**
         * The amount of 300s achieved in the play.
         */
        hit300: number;

        /**
         * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         */
        hit100k: number;

        /**
         * The amount of 100s achieved in the play.
         */
        hit100: number;

        /**
         * The amount of 50s achieved in the play.
         */
        hit50: number;

        /**
         * The amount of misses achieved in the play.
         */
        hit0: number;

        /** 
         * The total score achieved in the play.
         */
        score: number;

        /**
         * The maximum combo achieved in the play.
         */
        max_combo: number;

        /**
         * The accuracy achieved in the play.
         */
        accuracy: number;

        /**
         * Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
         */
        is_full_combo: replayFullCombo;

        /**
         * The name of the player in the replay.
         */
        player_name: string;

        /** 
         * Enabled modifications during the play in raw form.
         */
        raw_mods: string;

        /**
         * Enabled modifications during the play in osu!droid form.
         */
        droid_mods: string;

        /**
         * Enabled modifications during the play in osu!standard form.
         */
        converted_mods: string;

        /**
         * The cursor movement data of the replay.
         */
        cursor_movement: CursorData[];

        /**
         * The hit object data of the replay.
         */
        hit_object_data: ReplayObjectData[];
    }

    /**
     * Represents a hitobject in an osu!droid replay.
     * 
     * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    export class ReplayObjectData {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.accuracy The offset of which the hitobject was hit in milliseconds.
         * @param {number[]} values.tickset The tickset of the hitobject.
         * @param {hitResult} values.result The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
         */
        constructor(values: {
            accuracy: number,
            tickset: number[],
            result: hitResult
        });

        /**
         * The offset of which the hitobject was hit in milliseconds.
         */
        accuracy: number;

        /** 
         * The tickset of the hitobject.
         */
        tickset: number[];

        /**
         * The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
         */
        result: hitResult;
    }

    /**
     * Represents a score in osu!droid.
     */
    export class Score {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} [values.uid] The uid of the user.
         * @param {number} [values.score_id] The ID of the score.
         * @param {string} [values.player_name] The player's name.
         * @param {string} [values.title] The title of the beatmap.
         * @param {number} [values.combo] The maximum combo achieved in the play.
         * @param {number} [values.score] The score achieved in the play.
         * @param {string} [values.rank] The rank achieved in the play.
         * @param {number} [values.date] The date of score in milliseconds epoch. This will be automatically converted to a `Date` object.
         * @param {number} [values.accuracy] The accuracy achieved in the play.
         * @param {number} [values.miss] The miss count of the play.
         * @param {string} [values.mods] Mods string of the play. This will be automatically converted to PC mods.
         * @param {string} [values.hash] MD5 hash of the play.
         */
        constructor(values: {
            uid?: number,
            score_id?: number,
            player_name?: string,
            title?: string,
            combo?: number,
            score?: number,
            rank?: number,
            date?: number,
            accuracy?: number,
            miss?: number,
            mods?: string,
            hash?: string
        });

        /**
         * The uid of the player.
         */
        player_uid: number;

        /**
         * The ID of the score.
         */
        score_id: number;

        /**
         * The player's name.
         */
        player_name: string;

        /**
         * The title of the beatmap.
         */
        title: string;

        /**
         * The maximum combo achieved in the play.
         */
        combo: number;

        /**
         * The score achieved in the play.
         */
        score: number;

        /**
         * The rank achieved in the play.
         */
        rank: number;

        /**
         * The date of which the play was set.
         */
        date: Date;

        /**
         * The accuracy achieved in the play.
         */
        accuracy: number;

        /**
         * The amount of misses achieved in the play.
         */
        miss: number;

        /**
         * Enabled modifications in the play in osu!standard format.
         */
        mods: string;

        /**
         * MD5 hash of the play.
         */
        hash: string;

        /**
         * Whether or not the fetch result from `getFromHash()` returns an error. This should be immediately checked after calling said method.
         */
        error: boolean;

        /**
         * Retrieves play information.
         *
         * @param {Object} [params] An object containing the parameters.
         * @param {number} params.uid The uid to retrieve. If specified in the constructor, can be omitted.
         * @param {string} params.hash The MD5 hash of the beatmap. If specified in the constructor, can be omitted.
         * @returns {Promise<Score>} The current instance containing the play information.
         */
        getFromHash(params?: {
            uid: number,
            hash: string
        }): Promise<Score>;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a slider in a beatmap.
     *
     * This is needed to calculate max combo as we need to compute slider ticks.
     * 
     * The beatmap stores the distance travelled in one repetition and
     * the number of repetitions. This is enough to calculate distance
     * per tick using timing information and slider velocity.
     * 
     * Note that 1 repetition means no repeats (1 loop).
     */
    export class Slider {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number[]} values.pos The position of the slider in `[x, y]` osupixels.
         * @param {number} values.distance The distance of the slider.
         * @param {number} values.repetitions The repetition amount of the slider.
         */
        constructor(values: {
            pos: [number, number],
            distance: number,
            repetitions: number
        });

        /** 
         * The starting position of the slider in `[x, y]` osupixels.
         */
        pos: [number, number];

        /**
         * The travel distance of the slider in osupixels.
         */
        distance: number;

        /**
         * The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
         */
        repetitions: number;

        /**
         * Returns the string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * An osu!standard difficulty calculator.
     *
     * Does not account for sliders because slider calculations are expensive and not worth the small accuracy increase.
     */
    export class StandardDiff {
        constructor();

        /**
         * The objects of the beatmap in `StandardDiffHitObject` instance.
         */
        objects: StandardDiffHitObject[];

        /**
         * The calculated beatmap.
         */
        map?: Beatmap;

        /**
         * The modifications applied to the beatmap.
         */
        mods: string;

        /**
         * Interval threshold in milliseconds for singletaps.
         */
        singletap_threshold: number;

        /**
         * The overall star rating of the beatmap.
         */
        total: number;

        /**
         * The aim star rating of the beatmap.
         */
        aim: number;

        /**
         * The aim difficulty of the beatmap.
         */
        aim_difficulty: number;

        /**
         * The length bonus given by aim difficulty.
         */
        aim_length_bonus: number;

        /**
         * The speed star rating of the beatmap.
         */
        speed: number;

        /**
         * The speed difficulty of the beatmap.
         */
        speed_difficulty: number;

        /**
         * The length bonus given by speed difficulty.
         */
        speed_length_bonus: number;

        /**
         * Number of notes that are seen as singletaps by the difficulty calculator.
         */
        singles: number;

        /**
         * Number of notes that are faster than the interval given in `calculate()`. These singletap statistics are not required in star rating, but they are a free byproduct of the calculation which could be useful.
         */
        singles_threshold: number;

        /**
         * Resets the current instance to its original state.
         */
        reset(): void;

        /**
         * Calculate the star rating of a beatmap.
         *
         * @param {Object} params
         * @param {Beatmap} params.map The beatmap we want to calculate difficulty for.
         * @param {string} [params.mods] The mods string.
         * @param {number} [params.singletap_threshold] Interval threshold in milliseconds for singletaps. Defaults to 240 BPM 1/2 singletaps `[(60000 / 240) / 2]`. See `nsingles_threshold`.
         * @param {modes} [params.mode=osu] Whether to calculate difficulty for droid or PC.
         * @returns {StandardDiff} The current instance, which contains the results.
         */
        calculate(params: {
            map: Beatmap,
            mods?: string,
            mode?: modes,
            singletap_threshold?: number
        }): StandardDiff;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    export class StandardDiffHitObject {
        /**
         * @param {HitObject} obj The underlying hitobject.
         */
        constructor(obj: HitObject);

        /**
         * The strain generated by the hitobject. The format is `[<SPEED_STRAIN>, <AIM_STRAIN>]`.
         */
        strains: [number, number];

        /**
         * The normalized position of the hitobject in `[x, y]` osu!pixels.
         */
        normpos: [number, number];

        /**
         * The angle created by the hitobject and the previous 2 hitobjects (if present).
         */
        angle?: number;

        /**
         * Whether or not the hitobject is considered as singletap.
         */
        is_single: boolean;

        /**
         * The time difference between the hitobject and the previous hitobject (if present).
         */
        delta_time: number;

        /**
         * The draw distance between the hitobject and the previous hitobject (if present) in osu!pixels.
         */
        d_distance: number;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }

    /**
     * Represents a timing point in a beatmap.
     * 
     * Defines parameters such as timing and sampleset for an interval.
     * For pp calculation we only need `time` and `ms_per_beat`.
     * 
     * It can inherit from its preceeding point by having
     * `change = false` and setting `ms_per_beat` to a negative value which
     * represents the BPM multiplier as `-100 * bpm_multiplier`.
     */
    export class Timing {
        /**
         * @param {Object} values An object containing the parameters.
         * @param {number} values.time The time of which the timing point is applied in milliseconds.
         * @param {number} [values.ms_per_beat=600] The amount of milliseconds passed for each beat.
         * @param {boolean} [values.change=true] Whether or not the timing point does not inherit from the previous timing point.
         */
        constructor(values: {
            time: number,
            ms_per_beat?: number,
            change?: boolean
        });

        /**
         * The time of which the timing is applied in milliseconds.
         */
        time: number;

        /**
         * The amount of milliseconds passed for each beat.
         */
        ms_per_beat: number;

        /**
         * Whether or not the timing point does not inherit from the previous timing point.
         */
        change: boolean;

        /**
         * Returns a string representative of the class.
         *
         * @returns {string} The string representation of the class.
         */
        toString(): string;
    }
}