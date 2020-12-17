import { Accuracy } from './utils/Accuracy';
import { Aim } from './difficulty/skills/Aim';
import { Beatmap } from './beatmap/Beatmap';
import { BreakPoint } from './beatmap/timings/BreakPoint';
import { Circle } from './beatmap/hitobjects/Circle';
import { CursorData } from './replay/data/CursorData';
import { DifficultyHitObject } from './beatmap/hitobjects/DifficultyHitObject';
import { DifficultyHitObjectCreator } from './difficulty/preprocessing/DifficultyHitObjectCreator';
import { DroidAPIRequestBuilder, OsuAPIRequestBuilder } from './utils/APIRequestBuilder';
import { DroidHitWindow, OsuHitWindow } from './utils/HitWindow';
import { gamemode } from './constants/gamemode';
import { HeadCircle } from './beatmap/hitobjects/sliderObjects/HeadCircle';
import { HitObject } from './beatmap/hitobjects/HitObject';
import { hitResult } from './constants/hitResult';
import { MapInfo } from './tools/MapInfo';
import { MapStars } from './tools/MapStars';
import { MapStats } from './utils/MapStats';
import { modes } from './constants/modes';
import { mods } from './utils/mods';
import { movementType } from './constants/movementType';
import { objectTypes } from './constants/objectTypes';
import { Parser } from './beatmap/Parser';
import { PathApproximator } from './utils/PathApproximator';
import { PathType } from './constants/PathType';
import { Precision } from './utils/Precision';
import { PerformanceCalculator } from './difficulty/PerformanceCalculator';
import { Player } from './osu!droid/Player';
import { RepeatPoint } from './beatmap/hitobjects/sliderObjects/RepeatPoint';
import { ReplayAnalyzer } from './replay/ReplayAnalyzer';
import { ReplayData } from './replay/data/ReplayData';
import { ReplayObjectData } from './replay/data/ReplayObjectData';
import { rankedStatus } from './constants/rankedStatus';
import { rankImage } from './utils/rankImage';
import { Score } from './osu!droid/Score';
import { Slider } from './beatmap/hitobjects/Slider';
import { SliderPath } from './utils/SliderPath';
import { SliderTick } from './beatmap/hitobjects/sliderObjects/SliderTick';
import { Spinner } from './beatmap/hitobjects/Spinner';
import { StarRating } from './difficulty/StarRating';
import { TailCircle } from './beatmap/hitobjects/sliderObjects/TailCircle';
import { TimingPoint } from './beatmap/timings/TimingPoint';
import { Vector2 } from './mathutil/Vector2';

import { config } from 'dotenv';
config();

export = {
    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    Accuracy: Accuracy,

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    Aim: Aim,

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
     * Represents a cursor instance in an osu!droid replay.
     * 
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    CursorData: CursorData,

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    DifficultyHitObject: DifficultyHitObject, 
    
    /**
     * A converter used to convert normal hitobjects into difficulty hitobjects.
     */
    DifficultyHitObjectCreator: DifficultyHitObjectCreator,

    /**
     * API request builder for osu!droid.
     */
    DroidAPIRequestBuilder: DroidAPIRequestBuilder,

    /**
     * Represents the hit window of osu!droid.
     */
    DroidHitWindow: DroidHitWindow,

    /**
     * Bitwise enum for gamemodes.
     */
    gamemode: gamemode,

    /**
     * Represents the headcircle of a slider (sliderhead).
     */
    HeadCircle: HeadCircle,

    /**
     * Represents a hitobject in a beatmap.
     */
    HitObject: HitObject,
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
     * API request builder for osu!standard.
     */
    OsuAPIRequestBuilder: OsuAPIRequestBuilder,

    /**
     * Represents the hit window of osu!standard.
     */
    OsuHitWindow: OsuHitWindow,

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    objectTypes: objectTypes,

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    Parser: Parser,

    /**
     * Path approximator for sliders.
     */
    PathApproximator: PathApproximator,

    /**
     * Types of slider paths.
     */
    PathType: PathType,

    /**
     * Precision utilities.
     */
    Precision: Precision,

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    PerformanceCalculator: PerformanceCalculator,

    /**
     * Represents an osu!droid player.
     */
    Player: Player,

    /**
     * Represents a repeat point in a slider.
     */
    RepeatPoint: RepeatPoint,
    
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
     */
    Slider: Slider,

    /**
     * Represents a slider's path.
     */
    SliderPath: SliderPath,

    /**
     * Represents a slider tick in a slider.
     */
    SliderTick: SliderTick,

    /**
     * Represents a spinner in a beatmap.
     * 
     * All we need from spinners is their duration. The
     * position of a spinner is always at 256x192.
     */
    Spinner: Spinner,
    
    /**
     * An osu!standard difficulty calculator.
     */
    StarRating: StarRating,
    
    /**
     * Represents the tailcircle of a slider (sliderend).
     */
    TailCircle: TailCircle,

    /**
     * Represents a timing point in a beatmap.
     */
    TimingPoint: TimingPoint,

    /**
     * Based on `Vector2` class in C#.
     */
    Vector2: Vector2
};