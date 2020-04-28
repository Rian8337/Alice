module.exports = {
    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    Accuracy: require('./src/Accuracy'),

    /**
     * Represents a beatmap with advanced information.
     */
    Beatmap: require('./src/Beatmap'),

    /**
     * Represents a circle in a beatmap.
     * 
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    Circle: require('./src/Circle'),

    /**
     * Represents a hitobject in a beatmap.
     *
     * The only common property is start time (in milliseconds).
     * Object-specific properties are stored in `data`, which can be
     * an instance of `Circle`, `Slider`, or `null`.
     */
    HitObject: require('./src/HitObject'),

    /**
     * Represents a beatmap with general information.
     */
    MapInfo: require('./src/MapInfo'),

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    MapPP: require('./src/MapPP'),

    /**
     * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
     */
    MapStars: require('./src/MapStars'),

    /**
     * Holds general beatmap statistics for further modifications. 
     */
    MapStats: require('./src/MapStats'),

    /**
     * An object containing bitwise constant of mods in both osu!droid and osu!standard as well as conversion methods.
     */
    mods: require('./src/mods'),

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    object_types: require('./src/object_types'),

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    Parser: require('./src/Parser'),

    /**
     * Represents an osu!droid player.
     */
    PlayerInfo: require('./src/PlayerInfo'),

    /**
     * Represents a play in osu!droid.
     */
    PlayInfo: require('./src/PlayInfo'),

    /**
     * Calculates the performance points of given mode and play result.
     * 
     * If `stars` is not defined, `file` (which is the `.osu` file of the beatmap) must be specified to compute star rating on fly.
     */
    ppv2: require('./src/ppv2'),

    /**
     * An object containing links of rank images and a method to return them.
     */
    rankImage: require('./src/rankImage'),

    /**
     * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
     * 
     * Once analyzed, the result can be accessed via the `data` property.
     */
    ReplayAnalyzer: require('./src/ReplayAnalyzer'),

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
    Slider: require('./src/Slider'),

    /**
     * An osu!standard difficulty calculator.
     *
     * Does not account for sliders because slider calculations are expensive and not worth the small accuracy increase.
     */
    StandardDiff: require('./src/StandardDiff'),

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    StandardDiffHitObject: require('./src/StandardDiffHitObject'),

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
    Timing: require('./src/Timing'),

    /**
     * The current version of the module.
     */
    version: require('./package.json').version
};
