export as namespace osudroid;

export declare class PlayInfo {
    constructor(values?: {
        uid?: number,
        score_id?: number,
        player_name?: string,
        title?: string,
        combo?: number,
        score?: number,
        rank?: string,
        date?: number,
        accuracy?: number,
        miss?: number,
        mods?: string,
        hash?: string
    });

    player_uid: number;
    score_id: number;
    player_name: string;
    title: string;
    combo: number;
    score: number;
    rank: string;
    date: Date;
    accuracy: number;
    miss: number;
    mods: string;
    hash: string;

    getFromHash(params: {
        uid: number,
        hash: string
    }): Promise<PlayInfo>;

    toString(): string
}

export declare class PlayerInfo {
    constructor();

    uid: number;
    name: string;
    avatarURL: string;
    location: string;
    email: string;
    rank: number;
    score: number;
    accuracy: number;
    play_count: number;
    recent_plays: PlayInfo[];

    get(params: {
        uid?: number,
        username?: string
    }): Promise<PlayerInfo>;

    toString(): string
}

export declare enum mods {
    n = 1 << 0,
    e = 1 << 1,
    h = 1 << 3,
    r = 1 << 4,
    d  = 1 << 6,
    t = 1 << 8,
    c = 1 << 9,

    nomod = 0,
    nf = 1 << 0,
    ez = 1 << 1,
    td = 1 << 2,
    hd = 1 << 3,
    hr = 1 << 4,
    dt = 1 << 6,
    rx = 1 << 7,
    ht = 1 << 8,
    nc = 1 << 9,
    fl = 1 << 10,
    so = 1 << 12,
    ap = 1 << 13,
    v2 = 1 << 29,

    speed_changing = dt | ht | nc,
    map_changing = hr | ez | speed_changing,
    unranked = ap | rx
}

export declare namespace mods {
    export function droid_to_modbits(mod?: string): number;
    export function droid_to_PC(mod?: string, detailed?: boolean): string;
    export function pc_to_detail(mod?: string): string;
    export function modbits_from_string(str?: string): number;
    export function modbits_to_string(mods?: number): string
}

export declare class ReplayAnalyzer {
    constructor(score_id: number);

    score_id: number;
    odr: Buffer|undefined;
    data: {
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
        mods: string,
        cursor_movement: {
            size: number,
            time: number[],
            x: number[],
            y: number[],
            id: number[]
        }[],
        hit_object_data: {
            accuracy: number,
            tickset: number[],
            result: number
        }[]
    }

    analyze(): Promise<ReplayAnalyzer>
}

export declare enum object_types {
    circle = 1 << 0,
    slider = 1 << 1,
    spinner = 1 << 3
}

export declare class MapInfo {
    constructor();

    title: string;
    full_title: string;
    artist: string;
    creator: string;
    version: string;
    approved: number;
    mode: number;
    beatmap_id: number;
    beatmapset_id: number;
    plays: number;
    favorites: number;
    last_update: number;
    hit_length: number;
    total_length: number;
    bpm: number;
    circles: number;
    sliders: number;
    spinners: number;
    objects: number;
    max_combo: number;
    cs: number;
    ar: number;
    od: number;
    hp: number;
    packs: string;
    diff_aim: number;
    diff_speed: number;
    diff_total: number;
    hash: string;
    osu_file: string;

    get(params: {
        beatmap_id?: number,
        hash?: string,
        file?: boolean
    }): Promise<MapInfo>;

    showStatistics(mods: string, option: number): string;

    statusColor(): number;

    max_score(mod?: string): number;

    toString(): string
}

export declare const rankImage: {
    S: string,
    A: string,
    B: string,
    C: string,
    D: string,
    SH: string,
    X: string,
    XH: string,

    get(rank?: string): string
}

export declare class MapStats {
    constructor(values?: {
        cs?: number,
        ar?: number,
        od?: number,
        hp?: number,
        mods?: string
    });

    cs: number;
    ar: number;
    od: number;
    hp: number;
    mods: string;
    droid_mods: number;
    pc_mods: number;

    calculate(params?: {
        mode?: string,
        mods?: string
    }): MapStats;

    toString(): string
}

export declare class Timing {
    constructor(values: {
        time: number,
        ms_per_beat: number,
        change?: boolean
    });

    time: number;
    ms_per_beat: number;
    change: boolean;

    toString(): string
}

export declare class Circle {
    constructor(values: {
        pos: [number, number]
    });

    pos: [number, number];

    toString(): string
}

export declare class Slider {
    constructor(values: {
        pos: [number, number],
        distance: number,
        repetitions: number
    });

    pos: [number, number];
    distance: number;
    repetitions: number;

    toString(): string
}

export declare class HitObject {
    constructor(values: {
        time: number,
        type: object_types,
        data?: Circle | Slider
    });

    typeStr(): string;

    toString(): string
}

export declare class Beatmap {
    constructor();

    format_version: number;
    mode: number;
    title: string;
    title_unicode: string;
    artist: string;
    artist_unicode: string;
    creator: string;
    version: string;
    ar?: number;
    cs: number;
    od: number;
    hp: number;
    sv: number;
    tick_rate: number;
    circles: number;
    sliders: number;
    spinners: number;
    objects: HitObject[];
    timing_points: Timing[];

    reset(): void;

    max_combo(): number;

    toString(): string
}

export declare class Parser {
    constructor();

    map: Beatmap;
    line: number;
    current_line: string;
    last_position: string;
    section: string;

    reset(): void;

    parse(str: string): Parser;

    toString(): string
}

export declare class StandardDiffHitObject {
    constructor(obj: HitObject);

    strains: [number, number];
    normpos: [number, number];
    angle: number;
    is_single: boolean;
    delta_time: number;
    d_distance: number;

    reset(): void;

    toString(): string
}

export declare class StandardDiff {
    constructor();

    objects: StandardDiffHitObject[];
    map?: Beatmap;
    mods: string;
    singletap_threshold: number;
    total: number;
    aim: number;
    aim_difficulty: number;
    aim_length_bonus: number;
    speed: number;
    speed_difficulty: number;
    speed_length_bonus: number;
    singles: number;
    singles_threshold: number;

    calculate(params: {
        map?: Beatmap,
        mods?: string,
        singletap_threshold: number
    }): StandardDiff;

    toString(): string
}

export declare class MapStars {
    constructor();

    droid_stars: StandardDiff;
    pc_stars: StandardDiff;

    calculate(params: {
        file: string,
        mods?: string
    }): MapStars;

    toString(): string
}

export declare class Accuracy {
    constructor(values: {
        percent?: number,
        nobjects?: number,
        n300?: number,
        n100?: number,
        n50?: number,
        nmiss?: number
    });

    percent: number;
    nobjects: number;
    n300: number;
    n100: number;
    n50: number;
    nmiss: number;

    value(nobjects?: number): number;

    toString(): string
}

export declare class MapPP {
    constructor();

    aim: number;
    speed: number;
    acc: number;
    computed_accuracy?: Accuracy;
    total: number;

    calculate(params: {
        map?: Beatmap,
        stars?: StandardDiff,
        acc_percent?: number,
        aim_stars?: number,
        speed_stars?: number,
        max_combo?: number,
        nsliders?: number,
        ncircles?: number,
        nobjects?: number,
        base_ar?: number,
        base_od?: number,
        mode?: number,
        mods?: string,
        combo?: number,
        n300?: number,
        n100?: number,
        n50?: number,
        nmiss?: number,
        score_version?: number
    }): MapPP;

    toString(): string
}

export function ppv2(params: {
    stars?: StandardDiff,
    mode: string,
    miss?: number,
    acc_percent?: number,
    combo?: number,
    file?: string
}): MapPP;