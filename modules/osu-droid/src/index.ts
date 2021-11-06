import { Accuracy } from './utils/Accuracy';
import { Beatmap } from './beatmap/Beatmap';
import { BreakPoint } from './beatmap/timings/BreakPoint';
import { Chart } from './utils/Chart';
import { Circle } from './beatmap/hitobjects/Circle';
import { CursorData } from './replay/data/CursorData';
import { DifficultyHitObject } from './difficulty/preprocessing/DifficultyHitObject';
import { DifficultyHitObjectCreator } from './difficulty/preprocessing/DifficultyHitObjectCreator';
import { DroidAim } from './difficulty/skills/DroidAim';
import { DroidAPIRequestBuilder, OsuAPIRequestBuilder } from './utils/APIRequestBuilder';
import { DroidFlashlight } from './difficulty/skills/DroidFlashlight';
import { DroidHitWindow, OsuHitWindow } from './utils/HitWindow';
import { DroidPerformanceCalculator } from './difficulty/DroidPerformanceCalculator';
import { DroidStarRating } from './difficulty/DroidStarRating';
import { DroidTap } from './difficulty/skills/DroidTap';
import { gamemode } from './constants/gamemode';
import { HeadCircle } from './beatmap/hitobjects/sliderObjects/HeadCircle';
import { HitObject } from './beatmap/hitobjects/HitObject';
import { hitResult } from './constants/hitResult';
import { MapInfo } from './tools/MapInfo';
import { MapStars } from './tools/MapStars';
import { MapStats } from './utils/MapStats';
import { MathUtils } from './mathutil/MathUtils';
import { Mod } from './mods/Mod';
import { ModAuto } from './mods/ModAuto';
import { ModAutopilot } from './mods/ModAutopilot';
import { ModDoubleTime } from './mods/ModDoubleTime';
import { ModEasy } from './mods/ModEasy';
import { ModFlashlight } from './mods/ModFlashlight';
import { ModHalfTime } from './mods/ModHalfTime';
import { ModHardRock } from './mods/ModHardRock';
import { ModHidden } from './mods/ModHidden';
import { ModNightCore } from './mods/ModNightCore';
import { ModNoFail } from './mods/ModNoFail';
import { ModPerfect } from './mods/ModPerfect';
import { ModPrecise } from './mods/ModPrecise';
import { ModReallyEasy } from './mods/ModReallyEasy';
import { ModRelax } from './mods/ModRelax';
import { ModScoreV2 } from './mods/ModScoreV2';
import { ModSmallCircle } from './mods/ModSmallCircle';
import { ModSpunOut } from './mods/ModSpunOut';
import { ModSuddenDeath } from './mods/ModSuddenDeath';
import { ModTouchDevice } from './mods/ModTouchDevice';
import { ModUtil } from './utils/ModUtil';
import { modes } from './constants/modes';
import { movementType } from './constants/movementType';
import { OsuAim } from './difficulty/skills/OsuAim';
import { OsuFlashlight } from './difficulty/skills/OsuFlashlight';
import { OsuPerformanceCalculator } from './difficulty/OsuPerformanceCalculator';
import { OsuSpeed } from './difficulty/skills/OsuSpeed';
import { OsuStarRating } from './difficulty/OsuStarRating';
import { objectTypes } from './constants/objectTypes';
import { Parser } from './beatmap/Parser';
import { PathApproximator } from './utils/PathApproximator';
import { PathType } from './constants/PathType';
import { Precision } from './utils/Precision';
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
import { TailCircle } from './beatmap/hitobjects/sliderObjects/TailCircle';
import { ThreeFingerChecker } from './replay/analysis/ThreeFingerChecker';
import { TimingPoint } from './beatmap/timings/TimingPoint';
import { Utils } from './utils/Utils';
import { Vector2 } from './mathutil/Vector2';

import { config } from 'dotenv';
config();

export = {
    /**
     * An accuracy calculator that calculates accuracy based on given parameters.
     */
    Accuracy,

    /**
     * Represents a beatmap with advanced information.
     */
    Beatmap,

    /**
     * Represents a break period in a beatmap.
     */
    BreakPoint,

    /**
     * Utility to draw a graph with only node-canvas.
     * 
     * Used for creating strain graph of beatmaps.
     */
    Chart,

    /**
     * Represents a circle in a beatmap.
     * 
     * All we need from circles is their position. All positions
     * stored in the objects are in playfield coordinates (512*384
     * rectangle).
     */
    Circle,

    /**
     * Represents a cursor instance in an osu!droid replay.
     * 
     * Stores cursor movement data such as x and y coordinates, movement size, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    CursorData,

    /**
     * Represents an osu!standard hit object with difficulty calculation values.
     */
    DifficultyHitObject, 
    
    /**
     * A converter used to convert normal hitobjects into difficulty hitobjects.
     */
    DifficultyHitObjectCreator,

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    DroidAim,

    /**
     * API request builder for osu!droid.
     */
    DroidAPIRequestBuilder,

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    DroidFlashlight,

    /**
     * Represents the hit window of osu!droid.
     */
    DroidHitWindow,

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    DroidPerformanceCalculator,

    /**
     * Difficulty calculator for osu!droid gamemode.
     */
    DroidStarRating,

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    DroidSpeed: DroidTap,

    /**
     * Bitwise enum for gamemodes.
     */
    gamemode,

    /**
     * Represents the headcircle of a slider (sliderhead).
     */
    HeadCircle,

    /**
     * Represents a hitobject in a beatmap.
     */
    HitObject,
    /**
     * The result of a hit in an osu!droid replay.
     */
    hitResult,

    /**
     * Represents a beatmap with general information.
     */
    MapInfo,

    /**
     * A star rating calculator that configures which mode to calculate difficulty for and what mods are applied.
     */
    MapStars,

    /**
     * Holds general beatmap statistics for further modifications. 
     */
    MapStats,

    /**
     * Some math utility functions.
     */
    MathUtils,

    /**
     * Represents a mod.
     */
    Mod,

    /**
     * Represents the Auto mod.
     */
    ModAuto,

    /**
     * Represents the Autopilot mod.
     */
    ModAutopilot,

    /**
     * Represents the DoubleTime mod.
     */
    ModDoubleTime,

    /**
     * Represents the Easy mod.
     */
    ModEasy,

    /**
     * Represents the Flashlight mod.
     */
    ModFlashlight,

    /**
     * Represents the Halftime mod.
     */
    ModHalfTime,

    /**
     * Represents the HardRock mod.
     */
    ModHardRock,

    /**
     * Represents the Hidden mod.
     */
    ModHidden,

    /**
     * Represents the NightCore mod.
     */
    ModNightCore,

    /**
     * Represents the NoFail mod.
     */
    ModNoFail,

    /**
     * Represents the Perfect mod.
     */
    ModPerfect,

    /**
     * Represents the Precise mod.
     */
    ModPrecise,

    /**
     * Represents the ReallyEasy mod.
     */
    ModReallyEasy,

    /**
     * Represents the Relax mod.
     */
    ModRelax,

    /**
     * Represents the ScoreV2 mod.
     */
    ModScoreV2,

    /**
     * Represents the SmallCircle mod.
     */
    ModSmallCircle,

    /**
     * Represents the SpunOut mod.
     */
    ModSpunOut,

    /**
     * Represents the SuddenDeath mod.
     */
    ModSuddenDeath,

    /**
     * Utilities for mods.
     */
    ModUtil,

    /**
     * Represents the TouchDevice mod.
     */
    ModTouchDevice,

    /**
     * Mode enum to switch things between osu!droid and osu!standard.
     */
    modes,

    /**
     * Movement type of a cursor in an osu!droid replay.
     */
    movementType,

    /**
     * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
     */
    OsuAim,

    /**
     * API request builder for osu!standard.
     */
    OsuAPIRequestBuilder,

    /**
     * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
     */
    OsuFlashlight,

    /**
     * Represents the hit window of osu!standard.
     */
    OsuHitWindow,

    /**
     * A performance points calculator that calculates performance points for osu!standard gamemode.
     */
    OsuPerformanceCalculator,

    /**
     * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
     */
    OsuSpeed,

    /**
     * Difficulty calculator for osu!standard gamemode.
     */
    OsuStarRating,

    /**
     * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
     */
    objectTypes,

    /**
     * A beatmap parser with just enough data for pp calculation.
     */
    Parser,

    /**
     * Path approximator for sliders.
     */
    PathApproximator,

    /**
     * Types of slider paths.
     */
    PathType,

    /**
     * Precision utilities.
     */
    Precision,

    /**
     * Represents an osu!droid player.
     */
    Player,

    /**
     * Represents a repeat point in a slider.
     */
    RepeatPoint,
    
    /**
     * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
     * 
     * Once analyzed, the result can be accessed via the `data` property.
     */
    ReplayAnalyzer,

    /**
     * Represents a replay data in an osu!droid replay.
     * 
     * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    ReplayData,

    /**
     * Represents a hitobject in an osu!droid replay.
     * 
     * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
     * 
     * This is used when analyzing replays using replay analyzer.
     */
    ReplayObjectData,

    /**
     * Ranking status of a beatmap.
     */
    rankedStatus,

    /**
     * A namespace containing links of rank images and a method to return them.
     */
    rankImage,

    /**
     * Represents an osu!droid score.
     */
    Score,

    /**
     * Represents a slider in a beatmap.
     */
    Slider,

    /**
     * Represents a slider's path.
     */
    SliderPath,

    /**
     * Represents a slider tick in a slider.
     */
    SliderTick,

    /**
     * Represents a spinner in a beatmap.
     * 
     * All we need from spinners is their duration. The
     * position of a spinner is always at 256x192.
     */
    Spinner,
    
    /**
     * Represents the tailcircle of a slider (sliderend).
     */
    TailCircle,

    /**
     * Utility to check whether or not a beatmap is three-fingered.
     */
    ThreeFingerChecker,

    /**
     * Represents a timing point in a beatmap.
     */
    TimingPoint,

    /**
     * Some utilities, no biggie.
     */
    Utils,

    /**
     * Based on `Vector2` class in C#.
     */
    Vector2
};