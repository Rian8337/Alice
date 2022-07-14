export as namespace osu;

export const VERSION_MAJOR: number;
export const VERSION_MINOR: number;
export const VERSION_PATCH: number;

export declare class timing {
    constructor(values: {
        time: number,
        ms_per_beat: number
    });

    time: number;
    ms_per_beat: number;
    change: boolean;

    toString(): string;
}

export declare enum objtypes {
    circle = 1 << 0,
    slider = 1 << 1,
    spinner = 1 << 3
}

export declare class circle {
    constructor(values: {
        pos: [number, number]
    });

    pos: [number, number];

    toString(): string;
}

export declare class slider {
    constructor(values: {
        pos: [number, number],
        distance: number,
        repetitions: number
    });

    pos: [number, number];
    distance: number;
    repetitions: number;

    toString(): string;
}

export declare class hitobject {
    constructor(values: {
        time: number,
        type: objtypes,
        data?: circle | slider
    });

    time: number;
    type: objtypes;
    data?: circle | slider;

    typestr(): string;
    toString(): string;
}

export declare enum modes {
    std = 0
}

export declare class beatmap {
    constructor();

    format_version: number;
    mode: modes;
    title: string;
    title_unicode: string;
    artist: string;
    artist_unicode: string;
    creator: string;
    version: string;
    beatmapId?: number;
    beatmapsetId?: number;
    ar?: number;
    cs: number;
    od: number;
    hp: number;
    sv: number;
    tick_rate: number;
    ncircles: number;
    nsliders: number;
    nspinners: number;
    objects: hitobject[];
    timing_points: timing[];

    reset(): beatmap;
    max_combo(): number;
    toString(): string;
}

export declare class parser {
    constructor();

    map: beatmap;
    nline: number;
    curline: string;
    lastpos: string;
    section: string;

    reset(): parser;
    feed_line(line: string): parser;
    feed(str: string): parser;
    toString(): string;
}

export declare enum modbits {
    nomod = 0,
    nf = 1 << 0,
    ez = 1 << 1,
    td = 1 << 2,
    hd = 1 << 3,
    hr = 1 << 4,
    dt = 1 << 6,
    ht = 1 << 8,
    nc = 1 << 9,
    fl = 1 << 10,
    so = 1 << 12,
    speed_changing = dt | ht | nc,
    map_changing = hr | ez | speed_changing
}

export namespace modbits {
    export function from_string(str: string): modbits;
    export function string(mods: modbits): string;
}

export declare class std_beatmap_stats {
    constructor(values: {
        ar?: number,
        od?: number,
        hp?: number,
        cs?: number
    });

    ar?: number;
    od?: number;
    hp?: number;
    cs?: number;
    speed_mul: number;

    with_mods(mods: modbits): std_beatmap_stats;
}

export declare class std_diff_hitobject {
    constructor(obj: hitobject);

    strains: [number, number];
    normpos: [number, number];
    angle: number;
    is_single: boolean;
    delta_time: number;
    d_distance: number;

    reset(): std_diff_hitobject;
    toString(): string;
}

export declare class std_diff {
    constructor();

    objects: std_diff_hitobject[];
    map?: beatmap;
    mods: modbits;
    singletap_threshold: number;
    total: number;
    aim: number;
    aim_difficulty: number;
    aim_length_bonus: number;
    speed: number;
    speed_difficulty: number;
    speed_length_bonus: number;
    nsingles: number;
    nsingles_threshold: number;

    reset(): void;
    calc(params: {
        map?: beatmap,
        mods?: modbits,
        speed_mul?: number,
        singletap_threshold?: number
    }): std_diff;
    toString(): string;
}

export declare class diff {
    constructor();

    calculators: std_diff[];
    map?: beatmap;

    calc(params: {
        map?: beatmap,
        mods?: modbits,
        speed_mul?: number,
        singletap_threshold?: number
    }): std_diff;
}

export declare class std_accuracy {
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
    toString(): string;
}

export declare class std_ppv2 {
    constructor();

    aim: number;
    speed: number;
    acc: number;
    computed_accuracy?: std_accuracy;
    total: number;

    calc(params: {
        map?: beatmap,
        stars?: std_diff,
        acc_percent?: number,
        aim_stars?: number,
        speed_stars?: number,
        max_combo?: number,
        nsliders?: number,
        ncircles?: number,
        nobjects?: number,
        base_ar?: number,
        base_od?: number,
        mode?: modes,
        mods?: modbits,
        combo?: number,
        n300?: number,
        n100?: number,
        n50?: number,
        nmiss?: number,
        score_version?: number
    }): std_ppv2;
    toString(): string;
}

export function ppv2(params: {
    map?: beatmap,
    stars?: std_diff,
    acc_percent?: number,
    aim_stars?: number,
    speed_stars?: number,
    max_combo?: number,
    nsliders?: number,
    ncircles?: number,
    nobjects?: number,
    base_ar?: number,
    base_od?: number,
    mode?: modes,
    mods?: modbits,
    combo?: number,
    n300?: number,
    n100?: number,
    n50?: number,
    nmiss?: number,
    score_version?: number
}): std_ppv2;
