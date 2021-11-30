//@ts-expect-error: Import conflict for whatever reason
import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";

declare module "osu-droid" {

    //#region Classes
    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    export class Accuracy implements AccuracyInformation {
        readonly n300: number;
        readonly n100: number;
        readonly n50: number;
        readonly nmiss: number;
        /**
         * Calculates accuracy based on given parameters.
         *
         * If `percent` and `nobjects` are specified, `n300`, `n100`, and `n50` will
         * be automatically calculated to be the closest to the given
         * acc percent.
         *
         * @param values Function parameters.
         */
        constructor(values: AccuracyInformation);
        /**
         * Calculates the accuracy value (0.0 - 1.0).
         *
         * @param nobjects The amount of objects in the beatmap. If `n300` was not specified in the constructor, this is required.
         */
        value(nobjects?: number): number;
    }

    /**
     * Represents a beatmap with advanced information.
     */
    export class Beatmap {
        /**
         * The format version of the beatmap.
         */
        formatVersion: number;
        /**
         * The title of the song of the beatmap.
         */
        title: string;
        /**
         * The unicode title of the song of the beatmap.
         */
        titleUnicode: string;
        /**
         * The artist of the song of the beatmap.
         */
        artist: string;
        /**
         * The unicode artist of the song of the beatmap.
         */
        artistUnicode: string;
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
        tickRate: number;
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
         * The objects of the beatmap.
         */
        readonly objects: HitObject[];
        /**
         * The timing points of the beatmap.
         */
        readonly timingPoints: TimingControlPoint[];
        /**
         * The difficulty timing points of the beatmap.
         */
        readonly difficultyTimingPoints: DifficultyControlPoint[];
        /**
         * The break points of the beatmap.
         */
        readonly breakPoints: BreakPoint[];
        /**
         * The stack leniency of the beatmap.
         */
        stackLeniency: number;
        /**
         * The amount of slider ticks in the beatmap.
         */
        get sliderTicks(): number;
        /**
         * The amount of sliderends in the beatmap.
         */
        get sliderEnds(): number;
        /**
         * The amount of slider repeat points in the beatmap.
         */
        get sliderRepeatPoints(): number;
        /**
         * The maximum combo of the beatmap.
         */
        get maxCombo(): number;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Represents a break period in a beatmap.
     */
    export class BreakPoint {
        /**
         * The minimum duration required for a break to have any effect.
         */
        static readonly MIN_BREAK_DURATION: number;
        /**
         * The start time of the break period.
         */
        readonly startTime: number;
        /**
         * The end time of the break period.
         */
        readonly endTime: number;
        /**
         * The duration of the break period. This is obtained from `endTime - startTime`.
         */
        readonly duration: number;
        constructor(values: {
            startTime: number;
            endTime: number;
        });
        /**
         * Returns a string representation of the class.
         */
        toString(): string;
        /**
         * Whether this break period contains a specified time.
         *
         * @param time The time to check in milliseconds.
         * @returns Whether the time falls within this break period.
         */
        contains(time: number): boolean;
    }

    /**
     * Utility to draw a graph with only node-canvas.
     *
     * Used for creating strain graph of beatmaps.
     */
    export class Chart implements ChartInitializer {
        /**
         * The canvas instance of this chart.
         */
        readonly canvas: Canvas;
        /**
         * The 2D rendering surface for the drawing surface of this chart.
         */
        readonly context: NodeCanvasRenderingContext2D;
        readonly graphWidth: number;
        readonly graphHeight: number;
        readonly minX: number;
        readonly minY: number;
        readonly maxX: number;
        readonly maxY: number;
        readonly unitsPerTickX: number;
        readonly unitsPerTickY: number;
        readonly background?: Image;
        readonly xLabel?: string;
        readonly yLabel?: string;
        readonly xValueType?: AxisType;
        readonly yValueType?: AxisType;
        readonly pointRadius: number;
        private readonly padding;
        private readonly tickSize;
        private readonly axisColor;
        private readonly font;
        private readonly axisLabelFont;
        private readonly fontHeight;
        private readonly baseLabelOffset;
        private readonly rangeX;
        private readonly rangeY;
        private readonly numXTicks;
        private readonly numYTicks;
        private readonly x;
        private readonly y;
        private readonly width;
        private readonly height;
        private readonly scaleX;
        private readonly scaleY;
        /**
         * @param values Initializer options for the graph.
         */
        constructor(values: ChartInitializer);
        /**
         * Draws a line graph with specified data, color, and line width.
         *
         * @param data The data to make the graph.
         * @param color The color of the line.
         * @param width The width of the line.
         */
        drawLine(data: (Data | Vector2)[], color: string, width: number): void;
        /**
         * Draws an area graph with specified data and color.
         *
         * @param data The data to make the graph.
         * @param color The color of the area.
         */
        drawArea(data: (Data | Vector2)[], color: string): void;
        /**
         * Returns a Buffer that represents the graph.
         */
        getBuffer(): Buffer;
        /**
         * Draws the X axis of the graph.
         *
         * @param drawLabel Whether or not to draw the axis label.
         */
        private drawXAxis(drawLabel?: boolean): void;
        /**
         * Draws the Y axis of the graph.
         *
         * @param drawLabel Whether or not to draw the axis label.
         */
        private drawYAxis(drawLabel?: boolean): void;
        /**
         * Transforms the context and move it to the center of the graph.
         */
        private transformContext(): void;
        /**
         * Gets the longest width from each label text in Y axis.
         */
        private getLongestValueWidth(): number;
        /**
         * Sets the background of the graph.
         */
        private setBackground(): void;
        /**
         * Time string parsing function for axis labels.
         */
        private timeString(second: number): string;
    }

    /**
     * Represents a circle in a beatmap.
     *
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    export class Circle extends HitObject {
        constructor(values: {
            startTime: number;
            type: number;
            position: Vector2;
        });
        override toString(): string;
    }

    /**
     * Represents a cursor instance in an osu!droid replay.
     *
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     *
     * This is used when analyzing replays using replay analyzer.
     */
    export class CursorData implements CursorInformation {
        size: number;
        readonly time: number[];
        readonly x: number[];
        readonly y: number[];
        readonly id: movementType[];
        constructor(values: CursorInformation);
    }

    /**
     * Represents a timing point that changes speed multiplier.
     */
    export class DifficultyControlPoint extends TimingPoint {
        /**
         * The slider speed multiplier of the timing point.
         */
        readonly speedMultiplier: number;
        constructor(values: {
            time: number;
            speedMultiplier: number;
        });
        override toString(): string;
    }

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    export class DifficultyHitObject {
        /**
         * The underlying hitobject.
         */
        readonly object: HitObject;
        /**
         * The aim strain generated by the hitobject.
         */
        aimStrain: number;
        /**
         * The speed strain generated by the hitobject.
         */
        get speedStrain(): number;
        /**
         * The tap strain generated by the hitobject. This is used to calculate speed strain.
         */
        tapStrain: number;
        /**
         * The tap strain generated by the hitobject if `strainTime` isn't modified by
         * OD. This is used in three-finger detection.
         */
        originalTapStrain: number;
        /**
         * The movement strain generated by the hitobject. This is used to calculate speed strain.
         */
        movementStrain: number;
        /**
         * The flashlight strain generated by the hitobject.
         */
        flashlightStrain: number;
        /**
         * The normalized distance between the start and end position of the previous hitobject.
         */
        travelDistance: number;
        /**
         * The normalized distance from the end position of the previous hitobject to the start position of this hitobject.
         */
        jumpDistance: number;
        /**
         * Angle the player has to take to hit this hitobject.
         *
         * Calculated as the angle between the circles (current-2, current-1, current).
         */
        angle: number;
        /**
         * The amount of time elapsed between this hitobject and the last hitobject.
         */
        deltaTime: number;
        /**
         * Milliseconds elapsed since the start time of the previous hitobject, with a minimum of 50ms.
         */
        strainTime: number;
        /**
         * Adjusted start time of the hitobject, taking speed multiplier into account.
         */
        startTime: number;
        /**
         * The radius of the hitobject.
         */
        radius: number;
        /**
         * @param object The underlying hitobject.
         */
        constructor(object: HitObject);
    }

    /**
     * A converter used to convert normal hitobjects into difficulty hitobjects.
     */
    export class DifficultyHitObjectCreator {
        /**
         * The hitobjects to be generated to difficulty hitobjects.
         */
        private objects: HitObject[];
        /**
         * The threshold for small circle buff for osu!droid.
         */
        private readonly DROID_CIRCLESIZE_BUFF_THRESHOLD: number;
        /**
         * The threshold for small circle buff for osu!standard.
         */
        private readonly PC_CIRCLESIZE_BUFF_THRESHOLD: number;
        /**
         * The radius of hitobjects.
         */
        private hitObjectRadius: number;
        /**
         * The base normalized radius of hitobjects.
         */
        private readonly normalizedRadius: number;
        /**
         * Generates difficulty hitobjects for difficulty calculation.
         */
        generateDifficultyObjects(params: {
            objects: HitObject[];
            circleSize: number;
            speedMultiplier: number;
            mode: modes;
        }): DifficultyHitObject[];
        /**
         * Calculates a slider's cursor position.
         */
        private calculateSliderCursorPosition(slider: Slider): void;
        /**
         * Gets the scaling factor of a radius.
         *
         * @param mode The mode to get the scaling factor from.
         * @param radius The radiust to get the scaling factor from.
         */
        private getScalingFactor(mode: modes, radius: number): number;
        /**
         * Returns the end cursor position of a hitobject.
         */
        private getEndCursorPosition(object: HitObject): Vector2;
    }

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    export class DroidAim extends DroidSkill {
        /**
         * Minimum timing threshold.
         */
        private readonly timingThreshold: number;
        private readonly angleBonusBegin: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param currentObject The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * API request builder for osu!droid.
     */
    export class DroidAPIRequestBuilder extends APIRequestBuilder {
        protected override readonly host: string;
        protected override readonly APIkey: string;
        protected override readonly APIkeyParam: string;
        override setEndpoint(endpoint: DroidAPIEndpoint): this;
    }

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    export class DroidFlashlight extends DroidSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the hit window of osu!droid.
     */
    export class DroidHitWindow extends HitWindow {
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor300(isPrecise?: boolean): number;
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor100(isPrecise?: boolean): number;
        /**
         * @param isPrecise Whether or not to calculate for Precise mod.
         */
        override hitWindowFor50(isPrecise?: boolean): number;
    }

    /**
     * A performance points calculator that calculates performance points for osu!droid gamemode.
     */
    export class DroidPerformanceCalculator extends PerformanceCalculator {
        override stars: DroidStarRating;
        protected override finalMultiplier: number;
        /**
         * The aim performance value.
         */
        aim: number;
        /**
         * The tap performance value.
         */
        tap: number;
        /**
         * The accuracy performance value.
         */
        accuracy: number;
        /**
         * The flashlight performance value.
         */
        flashlight: number;
        private aggregatedRhythmMultiplier: number;
        override calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: DroidStarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * The tap penalty to apply for penalized scores.
             */
            tapPenalty?: number;
            /**
             * Custom map statistics to apply custom tap multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aggregated rhythm multiplier of the beatmap.
         */
        private calculateAggregatedRhythmMultiplier(): void;
        /**
         * Calculates the aim performance value of the beatmap.
         */
        private calculateAimValue(): void;
        /**
         * Calculates the tap performance value of the beatmap.
         */
        private calculateTapValue(): void;
        /**
         * Calculates the accuracy performance value of the beatmap.
         */
        private calculateAccuracyValue(): void;
        /**
         * Calculates the flashlight performance value of the beatmap.
         */
        private calculateFlashlightValue(): void;
        override toString(): string;
    }

    /**
     * Difficulty calculator for osu!droid gamemode.
     */
    export class DroidStarRating extends StarRating {
        /**
         * The aim star rating of the beatmap.
         */
        aim: number;
        /**
         * The tap star rating of the beatmap.
         */
        tap: number;
        /**
         * The flashlight star rating of the beatmap.
         */
        flashlight: number;
        protected override readonly difficultyMultiplier: number;
        /**
         * Calculates the star rating of the specified beatmap.
         *
         * The beatmap is analyzed in chunks of `sectionLength` duration.
         * For each chunk the highest hitobject strains are added to
         * a list which is then collapsed into a weighted sum, much
         * like scores are weighted on a user's profile.
         *
         * For subsequent chunks, the initial max strain is calculated
         * by decaying the previous hitobject's strain until the
         * beginning of the new chunk.
         *
         * The first object doesn't generate a strain
         * so we begin calculating from the second object.
         *
         * Also don't forget to manually add the peak strain for the last
         * section which would otherwise be ignored.
         */
        calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply custom tap multiplier as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim star rating of the beatmap and stores it in this instance.
         */
        calculateAim(): void;
        /**
         * Calculates the tap star rating of the beatmap and stores it in this instance.
         */
        calculateTap(): void;
        /**
         * Calculates the flashlight star rating of the beatmap and stores it in this instance.
         */
        calculateFlashlight(): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        calculateAll(): void;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected override createSkills(): DroidSkill[];
        /**
         * Calculates the base rating value of a difficulty.
         */
        private baseRatingValue(difficulty: number): number;
        /**
         * Calculates the base performance value of a difficulty rating.
         * 
         * @param rating The difficulty rating.
         */
        private basePerformanceValue(rating: number): number;
    }

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    export class DroidTap extends DroidSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly starsPerDouble: number;
        private readonly minSpeedBonus: number;
        private readonly maxSpeedBonus: number;
        private readonly angleBonusScale: number;
        private readonly historyTimeMax: number;
        private currentTapStrain: number;
        private currentOriginalTapStrain: number;
        private readonly overallDifficulty: number;
        constructor(mods: Mod[], overallDifficulty: number);
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * Calculates the tap strain of a hitobject given a specific speed bonus and strain time.
         */
        private tapStrainOf(speedBonus: number, strainTime: number): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the headcircle of a slider (sliderhead).
     */
    export class HeadCircle extends Circle { }

    /**
     * Represents a hitobject in a beatmap.
     */
    export abstract class HitObject {
        /**
         * The start time of the hitobject in milliseconds.
         */
        startTime: number;
        /**
         * The bitwise type of the hitobject (circle/slider/spinner).
         */
        readonly type: objectTypes;
        /**
         * The position of the hitobject in osu!pixels.
         */
        readonly position: Vector2;
        /**
         * The end position of the hitobject in osu!pixels.
         */
        readonly endPosition: Vector2;
        /**
         * The end time of the hitobject.
         */
        endTime: number;
        /**
         * The stacked position of the hitobject.
         */
        stackedPosition: Vector2;
        /**
         * Whether or not this hitobject represents a new combo in the beatmap.
         */
        readonly isNewCombo: boolean;
        /**
         * The stack height of the hitobject.
         */
        stackHeight: number;
        constructor(values: {
            startTime: number;
            position: Vector2;
            type: number;
            endTime?: number;
        });
        /**
         * Returns the hitobject type.
         */
        typeStr(): string;
        /**
         * Calculates the stacked position of the hitobject.
         */
        calculateStackedPosition(scale: number): void;
        /**
         * Returns the string representative of the class.
         */
        abstract toString(): string;
    }

    /**
     * Represents a beatmap with general information.
     */
    export class MapInfo {
        /**
         * The title of the song of the beatmap.
         */
        title: string;
        /**
         * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
         */
        get fullTitle(): string;
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
         * The source of the song, if any.
         */
        source: string;
        /**
         * The ranking status of the beatmap.
         */
        approved: rankedStatus;
        /**
         * The ID of the beatmap.
         */
        beatmapID: number;
        /**
         * The ID of the beatmapset containing the beatmap.
         */
        beatmapsetID: number;
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
        submitDate: Date;
        /**
         * The date of which the beatmap was last updated.
         */
        lastUpdate: Date;
        /**
         * The duration of the beatmap not including breaks.
         */
        hitLength: number;
        /**
         * The duration of the beatmap including breaks.
         */
        totalLength: number;
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
        maxCombo: number;
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
         * The health drain rate of the beatmap.
         */
        hp: number;
        /**
         * The beatmap packs that contain this beatmap, represented by their ID.
         */
        packs: string[];
        /**
         * The aim difficulty rating of the beatmap.
         */
        aimDifficulty: number;
        /**
         * The speed difficulty rating of the beatmap.
         */
        speedDifficulty: number;
        /**
         * The generic difficulty rating of the beatmap.
         */
        totalDifficulty: number;
        /**
         * The MD5 hash of the beatmap.
         */
        hash: string;
        /**
         * Whether or not this beatmap has a storyboard.
         */
        storyboardAvailable: boolean;
        /**
         * Whether or not this beatmap has a video.
         */
        videoAvailable: boolean;
        /**
         * The parsed beatmap from beatmap parser.
         */
        get map(): Beatmap | undefined;
        private cachedBeatmap?: Beatmap;
        /**
         * Retrieve a beatmap's general information.
         *
         * Either beatmap ID or MD5 hash of the beatmap must be specified. If both are specified, beatmap ID is taken.
         */
        static getInformation(params: {
            /**
             * The ID of the beatmap.
             */
            beatmapID?: number;
            /**
             * The MD5 hash of the beatmap.
             */
            hash?: string;
            /**
             * Whether or not to also retrieve the .osu file of the beatmap (required for some utilities). Defaults to `true`.
             */
            file?: boolean;
        }): Promise<MapInfo>;
        /**
         * Fills the current instance with map data.
         *
         * @param mapinfo The map data.
         */
        fillMetadata(mapinfo: OsuAPIResponse): MapInfo;
        /**
         * Retrieves the .osu file of the beatmap.
         *
         * @param forceDownload Whether or not to download the file regardless if it's already available.
         */
        retrieveBeatmapFile(forceDownload?: boolean): Promise<MapInfo>;
        /**
         * Converts the beatmap's BPM if speed-changing mods are applied.
         */
        convertBPM(stats: MapStats): number;
        /**
         * Converts the beatmap's status into a string.
         */
        convertStatus(): string;
        /**
         * Converts the beatmap's length if speed-changing mods are applied.
         */
        convertTime(stats: MapStats): string;
        /**
         * Time string parsing function for statistics utility.
         */
        private timeString(second: number): string;
        /**
         * Shows the beatmap's statistics based on applied mods and option.
         *
         * - Option `0`: return map title and mods used if defined
         * - Option `1`: return song source and map download link to beatmap mirrors
         * - Option `2`: return CS, AR, OD, HP
         * - Option `3`: return BPM, map length, max combo
         * - Option `4`: return last update date and map status
         * - Option `5`: return favorite count and play count
         */
        showStatistics(option: number, mod?: Mod[], stats?: MapStats): string;
        /**
         * Gets a color integer based on the beatmap's ranking status.
         *
         * Useful to make embed messages.
         */
        get statusColor(): number;
        /**
         * Calculates the osu!droid maximum score of the beatmap.
         *
         * This requires .osu file to be downloaded.
         */
        maxScore(stats: MapStats): number;
        /**
         * Fetches the droid leaderboard of the beatmap.
         * 
         * The scores are sorted based on score.
         * 
         * @param page The page of the leaderboard to fetch. Each page contains at most 100 scores. If unspecified, defaults to the first page.
         */
        fetchDroidLeaderboard(page?: number): Promise<Score[]>;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
     */
    export class MapStars {
        /**
         * The osu!droid star rating of the beatmap.
         */
        readonly droidStars: DroidStarRating;
        /**
         * The osu!standard star rating of the beatmap.
         */
        readonly pcStars: OsuStarRating;
        /**
         * Calculates the star rating of a beatmap.
         */
        calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): MapStars;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Holds general beatmap statistics for further modifications.
     */
    export class MapStats {
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
         * The health drain rate of the beatmap.
         */
        hp?: number;
        /**
         * The enabled modifications.
         */
        mods: Mod[];
        /**
         * The speed multiplier applied from all modifications.
         */
        speedMultiplier: number;
        /**
         * Whether or not this map statistics uses forced AR.
         */
        isForceAR: boolean;
        /**
         * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older). Defaults to `false`.
         */
        oldStatistics: boolean;
        static readonly OD0_MS: number;
        static readonly OD10_MS: number;
        static readonly AR0_MS: number;
        static readonly AR5_MS: number;
        static readonly AR10_MS: number;
        static readonly OD_MS_STEP: number;
        static readonly AR_MS_STEP1: number;
        static readonly AR_MS_STEP2: number;
        constructor(values?: {
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
             * The health drain rate of the beatmap.
             */
            hp?: number;
            /**
             * Applied modifications in osu!standard format.
             */
            mods?: Mod[];
            /**
             * The speed multiplier to calculate for.
             */
            speedMultiplier?: number;
            /**
             * Whether or not force AR is turned on.
             */
            isForceAR?: boolean;
            /**
             * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 or older).
             */
            oldStatistics?: boolean;
        });
        /**
         * Calculates map statistics with mods applied.
         */
        calculate(params?: {
            /**
             * The gamemode to calculate for. Defaults to `modes.osu`.
             */
            mode?: modes;
            /**
             * The applied modifications in osu!standard format.
             */
            mods?: string;
            /**
             * The speed multiplier to calculate for.
             */
            speedMultiplier?: number;
            /**
             * Whether or not force AR is turned on.
             */
            isForceAR?: boolean;
        }): MapStats;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Utility function to apply speed and flat multipliers to stats where speed changes apply for AR.
         *
         * @param baseAR The base AR value.
         * @param speedMultiplier The speed multiplier to calculate.
         * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
         */
        static modifyAR(baseAR: number, speedMultiplier: number, statisticsMultiplier: number): number;
        /**
         * Utility function to apply speed and flat multipliers to stats where speed changes apply for OD.
         *
         * @param baseOD The base OD value.
         * @param speedMultiplier The speed multiplier to calculate.
         * @param statisticsMultiplier The statistics multiplier to calculate from map-changing nonspeed-changing mods.
         */
        static modifyOD(baseOD: number, speedMultiplier: number, statisticsMultiplier: number): number;
    }

    /**
     * Some math utility functions.
     */
    export abstract class MathUtils {
        /**
         * Rounds a specified number with specified amount of fractional digits.
         *
         * @param num The number to round.
         * @param fractionalDigits The amount of fractional digits.
         */
        static round(num: number, fractionalDigits: number): number;
        /**
         * Limits the specified number on range `[min, max]`.
         *
         * @param num The number to limit.
         * @param min The minimum range.
         * @param max The maximum range.
         */
        static clamp(num: number, min: number, max: number): number;
        /**
         * Calculates the standard deviation of a given data.
         * 
         * @param data The data to calculate.
         */
        static calculateStandardDeviation(data: number[]): number;
    }

    /**
     * Represents a mod.
     */
    export abstract class Mod {
        /**
         * The score multiplier of this mod.
         */
        abstract readonly scoreMultiplier: number;
        /**
         * The acronym of the mod.
         */
        abstract readonly acronym: string;
        /**
         * The name of the mod.
         */
        abstract readonly name: string;
        /**
         * Whether the mod is ranked in osu!droid.
         */
        abstract readonly droidRanked: boolean;
        /**
         * Whether the mod is ranked in osu!standard.
         */
        abstract readonly pcRanked: boolean;
        /**
         * The bitwise enum of the mod.
         */
        abstract readonly bitwise: number;
        /**
         * The droid enum of the mod.
         */
        abstract readonly droidString: string;
        /**
         * Whether this mod only exists for osu!droid gamemode.
         */
        abstract readonly droidOnly: boolean;
    }

    /**
     * Represents the Auto mod.
     */
    export class ModAuto extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Autopilot mod.
     */
    export class ModAutopilot extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the DoubleTime mod.
     */
    export class ModDoubleTime extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Easy mod.
     */
    export class ModEasy extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Flashlight mod.
     */
    export class ModFlashlight extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the HalfTime mod.
     */
    export class ModHalfTime extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the HardRock mod.
     */
    export class ModHardRock extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Hidden mod.
     */
    export class ModHidden extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the NightCore mod.
     */
    export class ModNightCore extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the NoFail mod.
     */
    export class ModNoFail extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Perfect mod.
     */
    export class ModPerfect extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Precise mod.
     */
    export class ModPrecise extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the ReallyEasy mod.
     */
    export class ModReallyEasy extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the Relax mod.
     */
    export class ModRelax extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the ScoreV2 mod.
     */
    export class ModScoreV2 extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SmallCircle mod.
     */
    export class ModSmallCircle extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SpunOut mod.
     */
    export class ModSpunOut extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the SuddenDeath mod.
     */
    export class ModSuddenDeath extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Represents the TouchDevice mod.
     */
    export class ModTouchDevice extends Mod {
        override readonly scoreMultiplier: number;
        override readonly acronym: string;
        override readonly name: string;
        override readonly droidRanked: boolean;
        override readonly pcRanked: boolean;
        override readonly bitwise: number;
        override readonly droidString: string;
        override readonly droidOnly: boolean;
    }

    /**
     * Utilities for mods.
     */
    export abstract class ModUtil {
        /**
         * Mods that are incompatible with each other.
         */
        static readonly incompatibleMods: Mod[][];
        /**
         * All mods that exists.
         */
        static readonly allMods: Mod[];
        /**
         * Mods that change the playback speed of a beatmap.
         */
        static readonly speedChangingMods: Mod[];
        /**
         * Mods that change the way the map looks.
         */
        static readonly mapChangingMods: Mod[];
        /**
         * Gets a list of mods from a droid mod string, such as "hd".
         *
         * @param str The string.
         */
        static droidStringToMods(str: string): Mod[];
        /**
         * Gets a list of mods from a PC modbits.
         *
         * @param modbits The modbits.
         */
        static pcModbitsToMods(modbits: number): Mod[];
        /**
         * Gets a list of mods from a PC mod string, such as "HDHR".
         *
         * @param str The string.
         */
        static pcStringToMods(str: string): Mod[];
        /**
         * Checks for mods that are incompatible with each other.
         *
         * @param mods The mods to check for.
         */
        private static checkDuplicateMods(mods: Mod[]): Mod[];
    }

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    export class OsuAim extends OsuSkill {
        /**
         * Minimum timing threshold.
         */
        private readonly timingThreshold: number;
        private readonly angleBonusBegin: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * API request builder for osu!standard.
     */
    export class OsuAPIRequestBuilder extends APIRequestBuilder {
        protected override readonly host: string;
        protected override readonly APIkey: string;
        protected override readonly APIkeyParam: string;
        override setEndpoint(endpoint: OsuAPIEndpoint): this;
    }

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    export class OsuFlashlight extends OsuSkill {
        protected override readonly historyLength: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Represents the hit window of osu!standard.
     */
    export class OsuHitWindow extends HitWindow {
        override hitWindowFor300(): number;
        override hitWindowFor100(): number;
        override hitWindowFor50(): number;
    }

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    export class OsuPerformanceCalculator extends PerformanceCalculator {
        override stars: OsuStarRating;
        protected override finalMultiplier: number;
        /**
         * The aim performance value.
         */
        aim: number;
        /**
         * The speed performance value.
         */
        speed: number;
        /**
         * The accuracy performance value.
         */
        accuracy: number;
        /**
         * The flashlight performance value.
         */
        flashlight: number;
        override calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: OsuStarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim performance value of the beatmap.
         */
        private calculateAimValue(): void;
        /**
         * Calculates the speed performance value of the beatmap.
         */
        private calculateSpeedValue(): void;
        /**
         * Calculates the accuracy performance value of the beatmap.
         */
        private calculateAccuracyValue(): void;
        /**
         * Calculates the flashlight performance value of the beatmap.
         */
        private calculateFlashlightValue(): void;
        override toString(): string;
    }

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    export class OsuSpeed extends OsuSkill {
        /**
         * Spacing threshold for a single hitobject spacing.
         */
        private readonly SINGLE_SPACING_THRESHOLD: number;
        private readonly angleBonusBegin: number;
        protected override readonly skillMultiplier: number;
        protected override readonly strainDecayBase: number;
        protected override readonly reducedSectionCount: number;
        protected override readonly reducedSectionBaseline: number;
        protected override readonly difficultyMultiplier: number;
        protected override readonly decayWeight: number;
        private readonly minSpeedBonus: number;
        private readonly maxSpeedBonus: number;
        private readonly angleBonusScale: number;
        /**
         * @param current The hitobject to calculate.
         */
        protected strainValueOf(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to calculate.
         */
        protected override strainValueAt(current: DifficultyHitObject): number;
        /**
         * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
         */
        private calculateRhythmBonus(current: DifficultyHitObject): number;
        /**
         * @param current The hitobject to save to.
         */
        override saveToHitObject(current: DifficultyHitObject): void;
    }

    /**
     * Difficulty calculator for osu!standard gamemode.
     */
    export class OsuStarRating extends StarRating {
        /**
         * The aim star rating of the beatmap.
         */
        aim: number;
        /**
         * The speed star rating of the beatmap.
         */
        speed: number;
        /**
         * The flashlight star rating of the beatmap.
         */
        flashlight: number;
        protected readonly difficultyMultiplier: number;
        calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply custom speed multiplier as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Calculates the aim star rating of the beatmap and stores it in this instance.
         */
        calculateAim(): void;
        /**
         * Calculates the speed star rating of the beatmap and stores it in this instance.
         */
        calculateSpeed(): void;
        /**
         * Calculates the flashlight star rating of the beatmap and stores it in this instance.
         */
        calculateFlashlight(): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        calculateAll(): void;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected override createSkills(): OsuSkill[];
        /**
         * Calculates the base performance value of a difficulty rating.
         * 
         * @param rating The difficulty rating.
         */
        private basePerformanceValue(rating: number): number;
        /**
         * Calculates the star rating value of a difficulty.
         *
         * @param difficulty The difficulty to calculate.
         */
        private starValue(difficulty: number): number;
    }

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    export class Parser {
        /**
         * The parsed beatmap.
         */
        readonly map: Beatmap;
        /**
         * The amount of lines of `.osu` file.
         */
        private line: string;
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
        /**
         * Parses a beatmap.
         *
         * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
         *
         * @param str The `.osu` file to parse.
         * @param mods The mods to parse the beatmap for.
         */
        parse(str: string, mods?: Mod[]): Parser;
        /**
         * Logs the line at which an exception occurs.
         */
        private logError(): string;
        /**
         * Processes a line of the file.
         */
        private processLine(line: string): Parser;
        /**
         * Sets the last position of the current parser state.
         *
         * This is useful to debug syntax errors.
         */
        private setPosition(str: string): string;
        /**
         * Logs any syntax errors into the console.
         */
        private warn(message: string): void;
        /**
         * Processes a property of the beatmap. This takes the current line as parameter.
         *
         * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
         */
        private property(): string[];
        /**
         * Processes the general section of a beatmap.
         */
        private general(): void;
        /**
         * Processes the metadata section of a beatmap.
         */
        private metadata(): void;
        /**
         * Processes the events section of a beatmap.
         */
        private events(): void;
        /**
         * Processes the difficulty section of a beatmap.
         */
        private difficulty(): void;
        /**
         * Processes the timing points section of a beatmap.
         */
        private timingPoints(): void;
        /**
         * Processes the objects section of a beatmap.
         */
        private objects(): void;
        /**
         * Gets the timing point that applies at given time.
         *
         * @param time The time to search.
         * @param timingPoints The timing points to search in.
         */
        private getTimingPoint<T extends TimingPoint>(time: number, timingPoints: T[]): T;
        /**
         * Applies stacking to hitobjects for beatmap version 6 or above.
         */
        private applyStacking(startIndex: number, endIndex: number): void;
        /**
         * Applies stacking to hitobjects for beatmap version 5 or below.
         */
        private applyStackingOld(): void;
        /**
         * Checks if a number is within a given threshold.
         *
         * @param num The number to check.
         * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
         * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
         */
        private isNumberValid(num: number, min: number, max: number): boolean;
        /**
         * Checks if each coordinates of a vector is within a given threshold.
         *
         * @param vec The vector to check.
         * @param limit The threshold. Defaults to `ParserConstants.MAX_COORDINATE_VALUE`.
         */
        private isVectorValid(vec: Vector2, limit: number): boolean;
    }

    /**
     * Path approximator for sliders.
     */
    export class PathApproximator {
        private readonly bezierTolerance: number;
        /**
         * The amount of pieces to calculate for each control point quadruplet.
         */
        private readonly catmullDetail: number;
        private readonly circularArcTolerance: number;
        /**
         * Approximates a bezier slider's path.
         *
         * Creates a piecewise-linear approximation of a bezier curve, by adaptively repeatedly subdividing
         * the control points until their approximation error vanishes below a given threshold.
         *
         * @param controlPoints The anchor points of the slider.
         */
        approximateBezier(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a catmull slider's path.
         *
         * Creates a piecewise-linear approximation of a Catmull-Rom spline.
         *
         * @param controlPoints The anchor points of the slider.
         */
        approximateCatmull(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a slider's circular arc.
         *
         * Creates a piecewise-linear approximation of a circular arc curve.
         *
         * @param controlPoints The anchor points of the slider.
         */
        approximateCircularArc(controlPoints: Vector2[]): Vector2[];
        /**
         * Approximates a linear slider's path.
         *
         * Creates a piecewise-linear approximation of a linear curve.
         * Basically, returns the input.
         *
         * @param controlPoints The anchor points of the slider.
         */
        approximateLinear(controlPoints: Vector2[]): Vector2[];
        /**
         * Checks if a bezier slider is flat enough to be approximated.
         *
         * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
         *
         * NOTE: The 2nd order derivative of a 2d curve represents its curvature, so intuitively this function
         * checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
         * need to have a denser approximation to be more "flat".
         *
         * @param controlPoints The anchor points of the slider.
         */
        private bezierIsFlatEnough(controlPoints: Vector2[]): void;
        /**
         * Approximates a bezier slider's path.
         *
         * This uses {@link https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm De Casteljau's algorithm} to obtain an optimal
         * piecewise-linear approximation of the bezier curve with the same amount of points as there are control points.
         *
         * @param controlPoints The control points describing the bezier curve to be approximated.
         * @param output The points representing the resulting piecewise-linear approximation.
         * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
         * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
         * @param count The number of control points in the original array.
         */
        private bezierApproximate(controlPoints: Vector2[], output: Vector2[], subdivisionBuffer1: Vector2[], subdivisionBuffer2: Vector2[], count: number): void;
        /**
         * Subdivides `n` control points representing a bezier curve into 2 sets of `n` control points, each
         * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
         * the original curve into 2 curves which result in the original curve when pieced back together.
         *
         * @param controlPoints The anchor points of the slider.
         * @param l Parts of the slider for approximation.
         * @param r Parts of the slider for approximation.
         * @param subdivisionBuffer Parts of the slider for approximation.
         * @param count The amount of anchor points in the slider.
         */
        private bezierSubdivide(controlPoints: Vector2[], l: Vector2[], r: Vector2[], subdivisionBuffer: Vector2[], count: number): void;
        /**
         * Finds a point on the spline at the position of a parameter.
         *
         * @param vec1 The first vector.
         * @param vec2 The second vector.
         * @param vec3 The third vector.
         * @param vec4 The fourth vector.
         * @param t The parameter at which to find the point on the spline, in the range [0, 1].
         */
        private catmullFindPoint(vec1: Vector2, vec2: Vector2, vec3: Vector2, vec4: Vector2, t: number): Vector2;
    }

    /**
     * Represents an osu!droid player.
     */
    export class Player {
        /**
         * The uid of the player.
         */
        uid: number;
        /**
         * The username of the player.
         */
        username: string;
        /**
         * The avatar URL of the player.
         */
        avatarURL: string;
        /**
         * The location of the player based on ISO 3166-1 country codes. See {@link https://en.wikipedia.org/wiki/ISO_3166-1 this} Wikipedia page for more information.
         */
        location: string;
        /**
         * The email that is attached to the player's account.
         */
        email: string;
        /**
         * The overall rank of the player.
         */
        rank: number;
        /**
         * The total score of the player.
         */
        score: number;
        /**
         * The overall accuracy of the player.
         */
        accuracy: number;
        /**
         * The amount of times the player has played.
         */
        playCount: number;
        /**
         * Recent plays of the player.
         */
        readonly recentPlays: Score[];
        /**
         * Retrieves a player's info based on uid or username.
         *
         * Either uid or username must be specified.
         */
        static getInformation(params: {
            uid?: number;
            username?: string;
        }): Promise<Player>;
        /**
         * Checks if this player has played the verification beatmap.
         */
        hasPlayedVerificationMap(): Promise<boolean>;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Precision utilities.
     */
    export abstract class Precision {
        static readonly FLOAT_EPSILON: number;
        /**
         * Checks if two numbers are equal with a given tolerance.
         *
         * @param value1 The first number.
         * @param value2 The second number.
         * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
         */
        static almostEqualsNumber(value1: number, value2: number, acceptableDifference?: number): boolean;
        /**
         * Checks if two vectors are equal with a given tolerance.
         *
         * @param vec1 The first vector.
         * @param vec2 The second vector.
         * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
         */
        static almostEqualsVector(vec1: Vector2, vec2: Vector2, acceptableDifference?: number): boolean;
    }

    /**
     * Represents a repeat point in a slider.
     */
    export class RepeatPoint extends HitObject {
        /**
         * The index of the repeat point.
         */
        readonly repeatIndex: number;
        /**
         * The duration of the repeat point.
         */
        readonly spanDuration: number;
        constructor(values: {
            position: Vector2;
            startTime: number;
            repeatIndex: number;
            spanDuration: number;
        });
        override toString(): string;
    }

    /**
     * A replay analyzer that analyzes a replay from osu!droid.
     *
     * Created by reverse engineering the replay parser from the game itself, which can be found {@link https://github.com/osudroid/osu-droid/blob/master/src/ru/nsu/ccfit/zuev/osu/scoring/Replay.java here}.
     *
     * Once analyzed, the result can be accessed via the `data` property.
     */
    export class ReplayAnalyzer {
        /**
         * The score ID of the replay.
         */
        scoreID: number;
        /**
         * The original odr file of the replay.
         */
        originalODR: Buffer | null;
        /**
         * The fixed odr file of the replay.
         */
        fixedODR: Buffer | null;
        /**
         * Whether or not the play is considered using >=3 finger abuse.
         */
        is3Finger?: boolean;
        /**
         * Whether or not the play is considered 2-handed.
         */
        is2Hand?: boolean;
        /**
         * The beatmap that is being analyzed. `DroidStarRating` is required for penalty analyzing.
         */
        map?: Beatmap | DroidStarRating;
        /**
         * The results of the analyzer. `null` when initialized.
         */
        data: ReplayData | null;
        /**
         * Penalty value used to penalize dpp for 2-hand.
         */
        aimPenalty: number;
        /**
         * Penalty value used to penalize dpp for 3 finger abuse.
         */
        tapPenalty: number;
        /**
         * Whether this replay has been checked against 3 finger usage.
         */
        hasBeenCheckedFor3Finger: boolean;
        /**
         * Whether this replay has been checked against 2 hand usage.
         */
        hasBeenCheckedFor2Hand: boolean;
        private readonly BYTE_LENGTH: number;
        private readonly SHORT_LENGTH: number;
        private readonly INT_LENGTH: number;
        private readonly LONG_LENGTH: number;
        constructor(values: {
            /**
             * The ID of the score.
             */
            scoreID: number;
            /**
             * The beatmap to analyze.
             *
             * Using `DroidStarRating` is required to analyze for 3 finger play.
             */
            map?: Beatmap | DroidStarRating;
        });
        /**
         * Analyzes a replay.
         */
        analyze(): Promise<ReplayAnalyzer>;
        /**
         * Downloads the given score ID's replay.
         */
        private downloadReplay(): Promise<Buffer | null>;
        /**
         * Decompresses a replay.
         *
         * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
         */
        private decompress(): Promise<Buffer>;
        /**
         * Parses a replay after being downloaded and converted to a buffer.
         */
        private parseReplay(): void;
        /**
         * Converts replay mods to droid mod string.
         */
        private convertDroidMods(replayMods: string[]): string;
        /**
         * Converts replay mods to regular mod string.
         */
        private convertMods(replayMods: string[]): string;
        /**
         * Gets hit error information of the replay.
         * 
         * `analyze()` must be called before calling this.
         */
        calculateHitError(): HitErrorInformation | null;
        /**
         * Checks if a play is using 3 fingers.
         *
         * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
         */
        checkFor3Finger(): void;
        /**
         * Checks if a play is using 2 hands.
         *
         * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
         */
        checkFor2Hand(): void;
    }

    /**
     * Represents a replay data in an osu!droid replay.
     *
     * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
     *
     * This is used when analyzing replays using replay analyzer.
     */
    export class ReplayData implements ReplayInformation {
        readonly replayVersion: number;
        readonly folderName: string;
        readonly fileName: string;
        readonly hash: string;
        readonly time: Date;
        readonly hit300k: number;
        readonly hit100k: number;
        readonly score: number;
        readonly maxCombo: number;
        readonly accuracy: Accuracy;
        readonly isFullCombo: boolean;
        readonly playerName: string;
        readonly rawMods: string;
        readonly rank: string;
        readonly convertedMods: Mod[];
        readonly cursorMovement: CursorData[];
        readonly hitObjectData: ReplayObjectData[];
        readonly speedModification: number;
        readonly forcedAR?: number;
        constructor(values: ReplayInformation);
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
         * The offset of which the hitobject was hit in milliseconds.
         */
        accuracy: number;
        /**
         * The tickset of the hitobject.
         *
         * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
         */
        tickset: boolean[];
        /**
         * The bitwise hit result of the hitobject.
         */
        result: hitResult;
        constructor(values: {
            /**
             * The offset of which the hitobject was hit in milliseconds.
             */
            accuracy: number;
            /**
             * The tickset of the hitobject.
             *
             * This is used to determine whether or not a slider event (tick/repeat/end) is hit based on the order they appear.
             */
            tickset: boolean[];
            /**
             * The bitwise hit result of the hitobject.
             */
            result: hitResult;
        });
    }

    /**
     * Represents an osu!droid score.
     */
    export class Score {
        /**
         * The uid of the player.
         */
        uid: number;

        /**
         * The ID of the score.
         */
        scoreID: number;

        /**
         * The player's name.
         */
        username: string;

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
        rank: string;

        /**
         * The date of which the play was set.
         */
        date: Date;

        /**
         * The accuracy achieved in the play.
         */
        accuracy: Accuracy;

        /**
         * Enabled modifications.
         */
        mods: Mod[];

        /**
         * The MD5 hash of the play.
         */
        hash: string;

        /**
         * The speed multiplier of the play.
         */
        speedMultiplier: number;
        /**
         * The forced AR of the play.
         */
        forcedAR?: number;
        /**
         * The replay of the score.
         */
        replay?: ReplayAnalyzer;
        constructor(values?: ScoreInformation);
        /**
         * Retrieves play information.
         *
         * @param values Function parameters.
         */
        static getFromHash(params: {
            /**
             * The uid of the player.
             */
            uid: number;
            /**
             * The MD5 hash to retrieve.
             */
            hash: string;
        }): Promise<Score>;
        /**
         * Fills this instance with score information.
         *
         * @param info The score information to from API response to fill with.
         */
        fillInformation(info: string): Score;
        /**
         * Returns the complete mod string of this score (mods, speed multiplier, and force AR combined).
         */
        getCompleteModString(): string;
        /**
         * Downloads the replay of this score.
         */
        downloadReplay(): Promise<void>;
        /**
         * Returns a string representative of the class.
         */
        toString(): string;
    }

    /**
     * Represents a slider in a beatmap.
     */
    export class Slider extends HitObject {
        /**
         * The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
         */
        readonly repetitions: number;
        /**
         * The nested hitobjects of the slider. Consists of headcircle (sliderhead), slider ticks, repeat points, and tailcircle (sliderend).
         */
        readonly nestedHitObjects: HitObject[];
        /**
         * The slider's path.
         */
        readonly path: SliderPath;
        /**
         * The slider's velocity.
         */
        readonly velocity: number;
        /**
         * The spacing between slider ticks of this slider.
         */
        readonly tickDistance: number;
        /**
         * The position of the cursor at the point of completion of this slider if it was hit
         * with as few movements as possible. This is set and used by difficulty calculation.
         */
        lazyEndPosition?: Vector2;
        /**
         * The distance travelled by the cursor upon completion of this slider if it was hit
         * with as few movements as possible. This is set and used by difficulty calculation.
         */
        lazyTravelDistance: number;
        /**
         * The length of one span of this slider.
         */
        readonly spanDuration: number;
        /**
         * The slider's head (sliderhead).
         */
        readonly headCircle: HeadCircle;
        /**
         * The slider's tail (sliderend).
         */
        readonly tailCircle: TailCircle;
        /**
         * The duration of this slider.
         */
        readonly duration: number;
        /**
         * The amount of slider ticks in this slider.
         */
        get ticks(): number;
        /**
         * The amount of repeat points in this slider.
         */
        get repeatPoints(): number;
        private readonly legacyLastTickOffset: number;
        constructor(values: {
            startTime: number;
            type: number;
            position: Vector2;
            repetitions: number;
            path: SliderPath;
            speedMultiplier: number;
            msPerBeat: number;
            mapSliderVelocity: number;
            mapTickRate: number;
            tickDistanceMultiplier: number;
        });
        override toString(): string;
    }

    /**
     * Represents a slider's path.
     */
    export class SliderPath {
        /**
         * The path type of the slider.
         */
        readonly pathType: PathType;
        /**
         * The control points (anchor points) of the slider.
         */
        readonly controlPoints: Vector2[];
        /**
         * Distance that is expected when calculating slider path.
         */
        readonly expectedDistance: number;
        /**
         * Whether or not the instance has been initialized.
         */
        isInitialized: boolean;
        /**
         * The calculated path of the slider.
         */
        readonly calculatedPath: Vector2[];
        /**
         * The cumulative length of the slider.
         */
        readonly cumulativeLength: number[];
        /**
         * The path approximator of the slider.
         */
        readonly pathApproximator: PathApproximator;
        constructor(values: {
            /**
             * The path type of the slider.
             */
            pathType: PathType;
            /**
             * The anchor points of the slider.
             */
            controlPoints: Vector2[];
            /**
             * The distance that is expected when calculating slider path.
             */
            expectedDistance: number;
        });
        /**
         * Initializes the instance.
         */
        ensureInitialized(): void;
        /**
         * Calculates the slider's path.
         */
        calculatePath(): void;
        /**
         * Calculates the slider's subpath.
         */
        calculateSubPath(subControlPoints: Vector2[]): Vector2[];
        /**
         * Calculates the slider's cumulative length.
         */
        calculateCumulativeLength(): void;
        /**
         * Computes the position on the slider at a given progress that ranges from 0 (beginning of the path)
         * to 1 (end of the path).
         *
         * @param progress Ranges from 0 (beginning of the path) to 1 (end of the path).
         */
        positionAt(progress: number): Vector2;
        /**
         * Returns the progress of reaching expected distance.
         */
        private progressToDistance(progress: number): number;
        /**
         * Interpolates verticles of the slider.
         */
        private interpolateVerticles(i: number, d: number): Vector2;
        /**
         * Returns the index of distance.
         */
        private indexOfDistance(d: number): number;
    }

    /**
     * Represents a slider tick in a slider.
     */
    export class SliderTick extends HitObject {
        /**
         * The index of the slider tick.
         */
        readonly spanIndex: number;
        /**
         * The start time of the slider tick.
         */
        readonly spanStartTime: number;
        constructor(values: {
            position: Vector2;
            startTime: number;
            spanIndex: number;
            spanStartTime: number;
        });
        override toString(): string;
    }

    /**
     * Represents a spinner in a beatmap.
     *
     * All we need from spinners is their duration. The
     * position of a spinner is always at 256x192.
     */
    export class Spinner extends HitObject {
        /**
         * The duration of the spinner.
         */
        readonly duration: number;
        constructor(values: {
            startTime: number;
            type: number;
            duration: number;
        });
        override toString(): string;
    }

    /**
     * Represents the tailcircle of a slider (sliderend).
     */
    export class TailCircle extends Circle { }

    /**
     * Utility to check whether or not a beatmap is three-fingered.
     */
    export class ThreeFingerChecker {
        /**
         * The beatmap to analyze.
         */
        readonly map: DroidStarRating;
        /**
         * The data of the replay.
         */
        readonly data: ReplayData;
        /**
         * Checks whether a beatmap is eligible to be detected for 3-finger.
         * 
         * @param map The beatmap.
         */
        static isEligibleToDetect(map: DroidStarRating): boolean;
    }

    /**
     * Represents a timing point that changes the beatmap's BPM.
     */
    export class TimingControlPoint extends TimingPoint {
        /**
         * The amount of milliseconds passed for each beat.
         */
        readonly msPerBeat: number;
        constructor(values: {
            time: number;
            msPerBeat: number;
        });
        override toString(): string;
    }

    /**
     * Represents a timing point in a beatmap.
     */
    export abstract class TimingPoint {
        /**
         * The time at which the timing point takes effect in milliseconds.
         */
        readonly time: number;
        constructor(values: {
            /**
             * The time at which the timing point takes effect in milliseconds.
             */
            time: number;
        });
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
    }

    /**
     * Based on `Vector2` class in C#.
     */
    export class Vector2 {
        /**
         * The x position of the vector.
         */
        x: number;
        /**
         * The y position of the vector.
         */
        y: number;
        constructor(values: {
            /**
             * The x position of the vector.
             */
            x: number;
            /**
             * The y position of the vector.
             */
            y: number;
        });
        /**
         * Multiplies the vector with another vector.
         */
        multiply(vec: Vector2): Vector2;
        divide(divideFactor: number): Vector2;
        /**
         * Adds the vector with another vector.
         */
        add(vec: Vector2): Vector2;
        /**
         * Subtracts the vector with another vector.
         */
        subtract(vec: Vector2): Vector2;
        /**
         * Gets the length of the vector.
         */
        getLength(): number;
        /**
         * Performs a dot multiplication with another vector.
         */
        dot(vec: Vector2): number;
        /**
         * Scales the vector.
         */
        scale(scaleFactor: number): Vector2;
        /**
         * Gets the distance between this vector and another vector.
         */
        getDistance(vec: Vector2): number;
        /**
         * Normalizes the vector.
         */
        normalize(): void;
    }

    /**
     * Some utilities, no biggie.
     */
    export abstract class Utils {
        /**
         * Returns a random element of an array.
         *
         * @param array The array to get the element from.
         */
        static getRandomArrayElement<T>(array: T[]): T;
        /**
         * Deep copies an instance.
         *
         * @param instance The instance to deep copy.
         */
        static deepCopy<T>(instance: T): T;
        /**
         * Creates an array with specific length that's prefilled with an initial value.
         *
         * @param length The length of the array.
         * @param initialValue The initial value of each array value.
         */
        static initializeArray<T>(length: number, initialValue?: T): T[];
    }

    //#endregion

    //#region Enums

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
        RESULT_100 = 3,
        /**
         * Good (300).
         */
        RESULT_300 = 4
    }

    /**
     * Mode enum to switch things between osu!droid and osu!standard.
     */
    export enum modes {
        droid = "droid",
        osu = "osu"
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
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    export enum objectTypes {
        circle = 1 << 0,
        slider = 1 << 1,
        spinner = 1 << 3
    }

    /**
     * Constants for beatmap parser.
     */
    export enum ParserConstants {
        MAX_PARSE_VALUE = 2147483647,
        MAX_COORDINATE_VALUE = 131072,
        MIN_REPETITIONS_VALUE = 0,
        MAX_REPETITIONS_VALUE = 9000,
        MIN_DISTANCE_VALUE = 0,
        MAX_DISTANCE_VALUE = 131072,
        MIN_SPEEDMULTIPLIER_VALUE = 0.1,
        MAX_SPEEDMULTIPLIER_VALUE = 10,
        MIN_MSPERBEAT_VALUE = 6,
        MAX_MSPERBEAT_VALUE = 60000
    }

    /**
     * Types of slider paths.
     */
    export enum PathType {
        Catmull = 0,
        Bezier = 1,
        Linear = 2,
        PerfectCurve = 3
    }

    /**
     * Ranking status of a beatmap.
     */
    export enum rankedStatus {
        GRAVEYARD = -2,
        WIP = -1,
        PENDING = 0,
        RANKED = 1,
        APPROVED = 2,
        QUALIFIED = 3,
        LOVED = 4
    }

    //#endregion

    //#region Interfaces

    /**
     * Information about an accuracy value.
     */
    export interface AccuracyInformation {
        /**
         * The amount of objects in the beatmap.
         */
        nobjects?: number;
        /**
         * The accuracy achieved.
         */
        percent?: number;
        /**
         * The amount of 300s achieved.
         */
        n300?: number;
        /**
         * The amount of 100s achieved.
         */
        n100?: number;
        /**
         * The amount of 50s achieved.
         */
        n50?: number;
        /**
         * The amount of misses achieved.
         */
        nmiss?: number;
    }

    export interface ChartInitializer {
        /**
         * The width of the graph.
         */
        readonly graphWidth: number;
        /**
         * The height of the graph.
         */
        readonly graphHeight: number;
        /**
         * The minimum X axis value of the graph.
         */
        readonly minX: number;
        /**
         * The minimum Y axis value of this graph.
         */
        readonly minY: number;
        /**
         * The maximum X axis value of this graph.
         */
        readonly maxX: number;
        /**
         * The maximum Y axis value of this graph.
         */
        readonly maxY: number;
        /**
         * The units per tick for X axis.
         */
        readonly unitsPerTickX: number;
        /**
         * The units per tick for Y axis.
         */
        readonly unitsPerTickY: number;
        /**
         * The background of this graph.
         */
        readonly background?: Image;
        /**
         * The X axis label of the graph.
         */
        readonly xLabel?: string;
        /**
         * The Y axis label of the graph.
         */
        readonly yLabel?: string;
        /**
         * The radius of a data point in the graph. Set to 0 to disable this.
         */
        readonly pointRadius?: number;
        /**
         * The value type for X axis.
         */
        readonly xValueType?: AxisType;
        /**
         * The value type for Y axis.
         */
        readonly yValueType?: AxisType;
    }

    /**
     * Contains information about a cursor instance.
     */
    export interface CursorInformation {
        /**
         * The movement size of the cursor instance.
         */
        size: number;
        /**
         * The time during which this cursor instance is active in milliseconds.
         */
        time: number[];
        /**
         * The x coordinates of this cursor instance in osu!pixels.
         */
        x: number[];
        /**
         * The y coordinates of this cursor instance in osu!pixels.
         */
        y: number[];
        /**
         * The hit IDs of this cursor instance.
         */
        id: number[];
    }

    /**
     * A structure for defining data object.
     */
    export interface Data {
        /**
         * The x value of this datum.
         */
        readonly x: number;
        /**
         * The y value of this datum.
         */
        readonly y: number;
    }

    /**
     * Holds additional data that is used in difficulty calculation.
     */
    export interface DifficultyAttributes {
        speedNoteCount: number;
    }

    /**
     * Represents a replay's hit error information.
     */
    export interface HitErrorInformation {
        /**
         * Average of hits below 0ms.
         */
        readonly negativeAvg: number;
        /**
         * Average of hits above 0ms.
         */
        readonly positiveAvg: number;
        /**
         * The unstable rate of the replay.
         */
        readonly unstableRate: number;
    }

    /**
     * Represents a `get_beatmaps` response from osu! API.
     */
    export interface OsuAPIResponse {
        readonly approved: string;
        readonly submit_date: string;
        readonly approved_date: string;
        readonly last_update: string;
        readonly artist: string;
        readonly beatmap_id: string;
        readonly beatmapset_id: string;
        readonly bpm: string;
        readonly creator: string;
        readonly creator_id: string;
        readonly difficultyrating?: string;
        readonly diff_aim?: string;
        readonly diff_speed?: string;
        readonly diff_size: string;
        readonly diff_overall: string;
        readonly diff_approach: string;
        readonly diff_drain: string;
        readonly hit_length: string;
        readonly source: string;
        readonly genre_id: string;
        readonly language_id: string;
        readonly title: string;
        readonly total_length: string;
        readonly version: string;
        readonly file_md5: string;
        readonly mode: string;
        readonly tags: string;
        readonly favourite_count: string;
        readonly rating: string;
        readonly playcount: string;
        readonly passcount: string;
        readonly count_normal: string;
        readonly count_slider: string;
        readonly count_spinner: string;
        readonly max_combo: string;
        readonly storyboard: string;
        readonly video: string;
        readonly download_unavailable: string;
        readonly audio_unavailable: string;
        readonly packs?: string;
    }

    /**
     * Contains information about a replay.
     */
    export interface ReplayInformation {
        /**
         * The version of the replay.
         */
        replayVersion: number;
        /**
         * The folder name containing the beatmap played.
         */
        folderName: string;
        /**
         * The file name of the beatmap played.
         */
        fileName: string;
        /**
         * The MD5 hash of the beatmap played.
         */
        hash: string;
        /**
         * The date of which the play was set.
         * 
         * Only available in replay v3 or later.
         */
        time?: Date;
        /**
         * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         * 
         * Only available in replay v3 or later.
         * 
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit300k?: number;
        /**
         * The amount of 300s achieved in the play.
         * 
         * Only available in replay v3 or later.
         * 
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit300?: number;
        /**
         * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
         * 
         * Only available in replay v3 or later.
         * 
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        hit100k?: number;
        /**
         * The total score achieved in the play.
         * 
         * Only available in replay v3 or later.
         */
        score?: number;
        /**
         * The maximum combo achieved in the play.
         * 
         * Only available in replay v3 or later.
         */
        maxCombo?: number;
        /**
         * The accuracy achieved in the play.
         * 
         * Only available in replay v3 or later.
         * 
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        accuracy?: Accuracy;
        /**
         * Whether the play achieved the beatmap's maximum combo.
         * 
         * Only available in replay v3 or later.
         */
        isFullCombo?: boolean;
        /**
         * The name of the player in the replay.
         * 
         * Only available in replay v3 or later.
         */
        playerName?: string;
        /**
         * Enabled modifications during the play in raw Java object format.
         * 
         * Only available in replay v3 or later.
         */
        rawMods?: string;
        /**
         * The rank achieved in the play.
         * 
         * Only available in replay v3 or later.
         * 
         * If `map` is defined in analyzer (either in `Beatmap` or `StarRating` instance), this will be analyzed using beatmap hitobject information and replay hitobject data for replay v1 and v2.
         */
        rank?: string;
        /**
         * Enabled modifications during the play in osu!standard format.
         * 
         * Only available in replay v3 or later.
         */
        convertedMods?: Mod[];
        /**
         * The speed modification of the replay.
         * 
         * Only available in replay v4 or later. By default this is 1.
         */
        speedModification?: number;
        /**
         * The forced AR of the replay.
         * 
         * Only available in replay v4 or later.
         */
        forcedAR?: number;
        /**
         * The cursor movement data of the replay.
         */
        cursorMovement: CursorData[];
        /**
         * The hit object data of the replay.
         */
        hitObjectData: ReplayObjectData[];
    }

    /**
     * Represents an exported replay's JSON structure.
     */
    export interface ExportedReplayJSON {
        /**
         * The version of the exported replay.
         */
        version: number;
        /**
         * Data of the exported replay.
         */
        replaydata: {
            /**
             * The path towards the beatmap's `.osu` file from the song directory of the game.
             */
            filename: string;
            /**
             * The name of the player.
             */
            playername: string;
            /**
             * The name of the replay file.
             */
            replayfile: string;
            /**
             * Droid modifications that are used in the replay.
             */
            mod: string;
            /**
             * The amount of total score achieved.
             */
            score: number;
            /**
             * The maximum combo achieved.
             */
            combo: number;
            /**
             * The rank achieved in the replay.
             */
            mark: string;
            /**
             * The amount of geki hits in the replay.
             */
            h300k: number;
            /**
             * The amount of great hits in the replay.
             */
            h300: number;
            /**
             * The amount of katu hits in the replay.
             */
            h100k: number;
            /**
             * The amount of good hits in the replay.
             */
            h100: number;
            /**
             * The amount of meh hits in the replay.
             */
            h50: number;
            /**
             * The amount of misses in the replay.
             */
            misses: number;
            /**
             * Accuracy gained in the replay.
             */
            accuracy: number;
            /**
             * The epoch date at which the score was set, in milliseconds.
             */
            time: number;
            /**
             * Whether the score is a full combo (1 is `true`, 0 is `false`).
             */
            perfect: number;
        };
    }

    /**
     * Represents a response from an API request.
     */
    export interface RequestResponse {
        /**
         * The result of the API request.
         */
        readonly data: Buffer;
        /**
         * The status code of the API request.
         */
        readonly statusCode: number;
    }

    export interface ScoreInformation {
        /**
         * The uid of the player.
         */
        uid?: number;
        /**
         * The ID of the score.
         */
        scoreID?: number;
        /**
         * The player's name.
         */
        username: string;
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
        rank: string;
        /**
         * The date of which the play was set.
         */
        date: Date | number;
        /**
         * The accuracy achieved in the play.
         */
        accuracy: Accuracy;
        /**
         * Enabled modifications in the play.
         */
        mods: Mod[];
        /**
         * MD5 hash of the play.
         */
        hash: string;
    }

    //#endregion

    //#region Namespaces

    /**
     * A namespace containing links of rank images and a method to return them.
     */
    export namespace rankImage {
        enum rankImage {
            S = "http://ops.dgsrz.com/assets/images/ranking-S-small.png",
            A = "http://ops.dgsrz.com/assets/images/ranking-A-small.png",
            B = "http://ops.dgsrz.com/assets/images/ranking-B-small.png",
            C = "http://ops.dgsrz.com/assets/images/ranking-C-small.png",
            D = "http://ops.dgsrz.com/assets/images/ranking-D-small.png",
            SH = "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",
            X = "http://ops.dgsrz.com/assets/images/ranking-X-small.png",
            XH = "http://ops.dgsrz.com/assets/images/ranking-XH-small.png"
        }
        /**
         * Returns an image of specified rank.
         *
         * @param rank The rank to get image from.
         */
        function get(rank?: string): string;
    }

    //#endregion

    //#region Types

    export type AxisType = "time";

    export type DroidAPIEndpoint = "banscore.php" | "getuserinfo.php" | "scoresearch.php" | "scoresearchv2.php" | "rename.php" | "upload" | "user_list.php" | "usergeneral.php" | "top.php" | "time.php";

    export type OsuAPIEndpoint = "get_beatmaps" | "get_user" | "get_scores" | "get_user_best" | "get_user_recent" | "get_match" | "get_replay";

    //#endregion

    //#region Unexported classes

    abstract class APIRequestBuilder {
        /**
         * The main point of API host.
         */
        protected abstract readonly host: string;
        /**
         * The API key for this builder.
         */
        protected abstract readonly APIkey: string;
        /**
         * The parameter for API key requests.
         */
        protected abstract readonly APIkeyParam: string;
        /**
         * Whether or not to include the API key in the request URL.
         */
        protected requiresAPIkey: boolean;
        /**
         * The endpoint of this builder.
         */
        protected endpoint: DroidAPIEndpoint | OsuAPIEndpoint | string;
        /**
         * The parameters of this builder.
         */
        protected readonly params: Map<string, string | number>;
        /**
         * Sets the API endpoint.
         *
         * @param endpoint The endpoint to set.
         */
        abstract setEndpoint(endpoint: DroidAPIEndpoint | OsuAPIEndpoint): this;
        /**
         * Sets if this builder includes the API key in the request URL.
         *
         * @param requireAPIkey Whether or not to include the API key in the request URL.
         */
        setRequireAPIkey(requireAPIkey: boolean): this;
        /**
         * Builds the URL to request the API.
         */
        buildURL(): string;
        /**
         * Sends a request to the API using built parameters.
         */
        sendRequest(): Promise<RequestResponse>;
        /**
         * Adds a parameter to the builder.
         *
         * @param param The parameter to add.
         * @param value The value to add for the parameter.
         */
        addParameter(param: string, value: string | number): this;
        /**
         * Removes a parameter from the builder.
         *
         * @param param The parameter to remove.
         */
        removeParameter(param: string): this;
    }

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class DroidSkill extends StrainSkill {
        /**
         * The bonus multiplier that is given for a sequence of notes of equal difficulty.
         */
        protected abstract readonly starsPerDouble: number;

        difficultyValue(): number;
    }

    abstract class HitWindow {
        /**
         * The overall difficulty of this hit window.
         */
        readonly overallDifficulty: number;
        /**
         * Gets the threshold for 300 (great) hit result.
         * 
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor300(isPrecise?: boolean): number;
        /**
         * Gets the threshold for 100 (good) hit result.
         * 
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor100(isPrecise?: boolean): number;
        /**
         * Gets the threshold for 50 (meh) hit result.
         * 
         * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
         */
        abstract hitWindowFor50(isPrecise?: boolean): number;
    }

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class OsuSkill extends StrainSkill {
        /**
         * The number of sections with the highest strains, which the peak strain reductions will apply to.
         * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
         */
        protected abstract readonly reducedSectionCount: number;

        /**
         * The baseline multiplier applied to the section with the biggest strain.
         */
        protected abstract readonly reducedSectionBaseline: number;

        /**
         * The final multiplier to be applied to the final difficulty value after all other calculations.
         */
        protected abstract readonly difficultyMultiplier: number;

        /**
         * The weight by which each strain value decays.
         */
        protected abstract readonly decayWeight: number;

        difficultyValue(): number;
    }

    /**
     * The base class of performance calculators.
     */
    abstract class PerformanceCalculator {
        /**
         * The overall performance value.
         */
        total: number;
        /**
         * The calculated accuracy.
         */
        computedAccuracy: Accuracy;
        /**
         * Bitwise value of enabled modifications.
         */
        protected convertedMods: number;
        /**
         * The calculated beatmap.
         */
        abstract stars: StarRating;
        /**
         * The map statistics after applying modifications.
         */
        protected mapStatistics: MapStats;
        /**
         * Penalty for combo breaks.
         */
        protected comboPenalty: number;
        /**
         * The global multiplier to be applied to the final performance value.
         * 
         * This is being adjusted to keep the final value scaled around what it used to be when changing things.
         */
        protected abstract finalMultiplier: number;
        /**
         * Calculates the performance points of a beatmap.
         */
        abstract calculate(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: StarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * The gamemode to calculate.
             */
            mode?: modes;
            /**
             * The speed penalty to apply for penalized scores. Only applies to droid gamemode.
             */
            speedPenalty?: number;
            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }): this;
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
        /**
         * Calculates the base performance value for of a star rating.
         */
        protected baseValue(stars: number): number;
        /**
         * Processes given parameters for usage in performance calculation.
         */
        protected handleParams(params: {
            /**
             * The star rating instance to calculate.
             */
            stars: StarRating;
            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;
            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;
            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;
            /**
             * The gamemode to calculate.
             */
            mode?: modes;
            /**
             * The speed penalty to apply for penalized scores.
             */
            speedPenalty?: number;
            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        }, mode: modes): void;
    }

    /**
     * A bare minimal abstract skill for fully custom skill implementations.
     */
    abstract class Skill {
        /**
         * The hitobjects that were processed previously. They can affect the strain values of the following objects.
         *
         * The latest hitobject is at index 0.
         */
        protected readonly previous: DifficultyHitObject[];
        /**
         * Number of previous hitobjects to keep inside the `previous` array.
         */
        protected readonly historyLength: number;
        /**
         * The mods that this skill processes.
         */
        protected readonly mods: Mod[];
        processInternal(current: DifficultyHitObject): void;
        /**
         * Processes a hitobject.
         *
         * @param current The hitobject to process.
         */
        protected abstract process(current: DifficultyHitObject): void;
        /**
         * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
         */
        abstract difficultyValue(): number;
    }

    /**
     * The base of difficulty calculation.
     */
    abstract class StarRating {
        /**
         * The calculated beatmap.
         */
        map: Beatmap;
        /**
         * The difficulty objects of the beatmap.
         */
        readonly objects: DifficultyHitObject[];
        /**
         * The modifications applied.
         */
        mods: Mod[];
        /**
         * The total star rating of the beatmap.
         */
        total: number;
        /**
         * The map statistics of the beatmap after modifications are applied.
         */
        stats: MapStats;
        /**
         * The strain peaks of aim difficulty.
         */
        aimStrainPeaks: number[];
        /**
         * The strain peaks of speed difficulty.
         */
        speedStrainPeaks: number[];
        /**
         * The strain peaks of flashlight difficulty.
         */
        flashlightStrainPeaks: number[];
        /**
         * Additional data that is used in performance calculation.
         */
        readonly attributes: DifficultyAttributes;
        protected readonly sectionLength: number;
        protected abstract readonly difficultyMultiplier: number;
        /**
         * Calculates the star rating of the specified beatmap.
         *
         * The beatmap is analyzed in chunks of `sectionLength` duration.
         * For each chunk the highest hitobject strains are added to
         * a list which is then collapsed into a weighted sum, much
         * like scores are weighted on a user's profile.
         *
         * For subsequent chunks, the initial max strain is calculated
         * by decaying the previous hitobject's strain until the
         * beginning of the new chunk.
         *
         * The first object doesn't generate a strain
         * so we begin calculating from the second object.
         *
         * Also don't forget to manually add the peak strain for the last
         * section which would otherwise be ignored.
         */
        protected calculate(params: {
            /**
             * The beatmap to calculate.
             */
            map: Beatmap;
            /**
             * Applied modifications.
             */
            mods?: Mod[];
            /**
             * Custom map statistics to apply custom speed multiplier as well as old statistics.
             */
            stats?: MapStats;
        }, mode: modes): this;
        /**
         * Generates difficulty hitobjects for this calculator.
         *
         * @param mode The gamemode to generate difficulty hitobjects for.
         */
        generateDifficultyHitObjects(mode: modes): void;
        /**
         * Calculates the skills provided.
         *
         * @param skills The skills to calculate.
         */
        protected calculateSkills(...skills: Skill[]): void;
        /**
         * Calculates the total star rating of the beatmap and stores it in this instance.
         */
        abstract calculateTotal(): void;
        /**
         * Calculates every star rating of the beatmap and stores it in this instance.
         */
        abstract calculateAll(): void;
        /**
         * Generates the strain chart of this beatmap and returns the chart as a buffer.
         *
         * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
         * @param color The color of the graph.
         */
        getStrainChart(beatmapsetID?: number, color?: string): Promise<Buffer | null>;
        /**
         * Returns a string representative of the class.
         */
        abstract toString(): string;
        /**
         * Creates skills to be calculated.
         */
        protected abstract createSkills(): Skill[];
    }

    /**
     * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
     * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
     */
    abstract class StrainSkill extends Skill {
        /**
         * The strain of currently calculated hitobject.
         */
        protected currentStrain: number;

        /**
         * The current section's strain peak.
         */
        protected currentSectionPeak: number;

        /**
         * Strain peaks are stored here.
         */
        readonly strainPeaks: number[];
        /**
         * The number of sections with the highest strains, which the peak strain reductions will apply to.
         * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
         */
        protected abstract readonly reducedSectionCount: number;

        /**
         * The baseline multiplier applied to the section with the biggest strain.
         */
        protected abstract readonly reducedSectionBaseline: number;

        /**
         * Strain values are multiplied by this number for the given skill. Used to balance the value of different skills between each other.
         */
        protected abstract readonly skillMultiplier: number;

        /**
         * Determines how quickly strain decays for the given skill.
         * 
         * For example, a value of 0.15 indicates that strain decays to 15% of its original value in one second.
         */
        protected abstract readonly strainDecayBase: number;

        protected readonly sectionLength: number;

        protected currentSectionEnd: number;

        /**
         * Calculates the strain value of a hitobject and stores the value in it. This value is affected by previously processed objects.
         * 
         * @param current The hitobject to process.
         */
        protected override process(current: DifficultyHitObject): void;

        /**
         * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
         */
        saveCurrentPeak(): void;

        /**
         * Sets the initial strain level for a new section.
         * 
         * @param offset The beginning of the new section in milliseconds, adjusted by speed multiplier.
         */
        protected startNewSectionFrom(offset: number): void;

        /**
         * Calculates strain decay for a specified time frame.
         * 
         * @param ms The time frame to calculate.
         */
        protected strainDecay(ms: number): number;

        /**
         * Calculates the strain value at a hitobject.
         */
        protected abstract strainValueAt(current: DifficultyHitObject): number;

        /**
         * Saves the current strain to a hitobject.
         */
        protected abstract saveToHitObject(current: DifficultyHitObject): void;
    }

    //#endregion
}