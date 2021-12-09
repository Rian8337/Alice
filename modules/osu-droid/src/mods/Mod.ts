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
