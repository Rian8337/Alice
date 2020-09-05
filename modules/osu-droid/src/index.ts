import { Accuracy } from './utils/Accuracy';
import { Beatmap } from './beatmap/Beatmap';
import { BreakPoint } from './beatmap/timings/BreakPoint';
import { Circle } from './beatmap/hitobjects/Circle';
import { CursorData } from './replay/data/CursorData';
import { gamemode } from './constants/gamemode';
import { hitResult } from './constants/hitResult';
import { MapInfo } from './utils/MapInfo';
import { MapStars } from './utils/MapStars';
import { MapStats } from './utils/MapStats';
import { modes } from './constants/modes';
import { mods } from './utils/mods';
import { movementType } from './constants/movementType';
import { objectTypes } from './constants/objectTypes';
import { Parser } from './utils/Parser';
import { PerformanceCalculator } from './difficulty/PerformanceCalculator';
import { Player } from './osu!droid/Player';
import { ReplayAnalyzer } from './replay/ReplayAnalyzer';
import { ReplayData } from './replay/data/ReplayData';
import { ReplayObjectData } from './replay/data/ReplayObjectData';
import { rankedStatus } from './constants/rankedStatus';
import { rankImage } from './utils/rankImage';
import { Score } from './osu!droid/Score';
import { Slider } from './beatmap/hitobjects/Slider';
import { Spinner } from './beatmap/hitobjects/Spinner';
import { StandardDiff } from './difficulty/StandardDiff';
import { StandardDiffHitObject } from './difficulty/preprocessing/StandardDiffHitObject';
import { TimingPoint } from './beatmap/timings/TimingPoint';
import { Vector } from './utils/Vector';

import { config } from 'dotenv';
config();

export = {
    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    Accuracy: Accuracy,

    /**
     * Represents a beatmap with advanced information.
     */
    Beatmap: Beatmap,

    /**
     * Represents a break period in a beatmap.
     */
    BreakPoint: BreakPoint,

    /**
     * Represents a circle in a beatmap.
     * 
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    Circle: Circle,

    /**
     * Represents a cursor in an osu!droid replay.
     * 
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    CursorData: CursorData,

    /**
     * Bitwise enum for gamemodes.
     */
    gamemode: gamemode,

    /**
     * The result of a hit in an osu!droid replay.
     */
    hitResult: hitResult,

    /**
     * Represents a beatmap with general information.
     */
    MapInfo: MapInfo,

    /**
     * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
     */
    MapStars: MapStars,

    /**
     * Holds general beatmap statistics for further modifications. 
     */
    MapStats: MapStats,

    /**
     * Mode enum to switch things between osu!droid and osu!standard.
     */
    modes: modes,

    /**
     * A namespace containing bitwise constant of mods in both osu!droid and osu!standard as well as conversion methods.
     */
    mods: mods,

    /**
     * Movement type of a cursor in an osu!droid replay.
     */
    movementType: movementType,

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    objectTypes: objectTypes,

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    Parser: Parser,

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    PerformanceCalculator: PerformanceCalculator,

    /**
     * Represents an osu!droid player.
     */
    Player: Player,
    
    /**
     * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
     * 
     * Once analyzed, the result can be accessed via the `data` property.
     */
    ReplayAnalyzer: ReplayAnalyzer,

    /**
     * Represents a replay data in an osu!droid replay.
     * 
     * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    ReplayData: ReplayData,

    /**
     * Represents a hitobject in an osu!droid replay.
     * 
     * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    ReplayObjectData: ReplayObjectData,

    /**
     * Ranking status of a beatmap.
     */
    rankedStatus: rankedStatus,

    /**
     * A namespace containing links of rank images and a method to return them.
     */
    rankImage: rankImage,

    /**
     * Represents an osu!droid score.
     */
    Score: Score,

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
    Slider: Slider,

    /**
     * Represents a spinner in a beatmap.
     * 
     * All we need from spinners is their duration. The
     * position of a spinner is always at 256x192.
     */
    Spinner: Spinner,

    /**
     * An osu!standard difficulty calculator.
     *
     * Does not account for sliders because slider calculations are expensive and not worth the small accuracy increase.
     */
    StandardDiff: StandardDiff,

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    StandardDiffHitObject: StandardDiffHitObject,

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
    TimingPoint: TimingPoint,

    /**
     * 2D point operations are stored in this class.
     */
    Vector: Vector
};