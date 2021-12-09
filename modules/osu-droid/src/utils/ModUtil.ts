import { Mod } from "../mods/Mod";
import { ModAuto } from "../mods/ModAuto";
import { ModAutopilot } from "../mods/ModAutopilot";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModNightCore } from "../mods/ModNightCore";
import { ModNoFail } from "../mods/ModNoFail";
import { ModPerfect } from "../mods/ModPerfect";
import { ModPrecise } from "../mods/ModPrecise";
import { ModReallyEasy } from "../mods/ModReallyEasy";
import { ModRelax } from "../mods/ModRelax";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModSmallCircle } from "../mods/ModSmallCircle";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSuddenDeath } from "../mods/ModSuddenDeath";
import { ModTouchDevice } from "../mods/ModTouchDevice";

/**
 * Utilities for mods.
 */
export abstract class ModUtil {
    /**
     * Mods that are incompatible with each other.
     */
    static readonly incompatibleMods: Mod[][] = [
        [new ModDoubleTime(), new ModNightCore(), new ModHalfTime()],
        [new ModNoFail(), new ModSuddenDeath(), new ModPerfect()],
        [new ModHardRock(), new ModEasy()],
        [new ModAuto(), new ModRelax(), new ModAutopilot()],
    ];

    /**
     * All mods that exists.
     */
    static readonly allMods: Mod[] = [
        // Janky order to keep the order on what players are used to
        new ModAuto(),
        new ModRelax(),
        new ModAutopilot(),
        new ModEasy(),
        new ModNoFail(),
        new ModHidden(),
        new ModHardRock(),
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
        new ModFlashlight(),
        new ModSuddenDeath(),
        new ModPerfect(),
        new ModPrecise(),
        new ModReallyEasy(),
        new ModScoreV2(),
        new ModSmallCircle(),
        new ModSpunOut(),
        new ModTouchDevice(),
    ];

    /**
     * Mods that change the playback speed of a beatmap.
     */
    static readonly speedChangingMods: Mod[] = [
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
    ];

    /**
     * Mods that change the way the map looks.
     */
    static readonly mapChangingMods: Mod[] = [
        new ModDoubleTime(),
        new ModNightCore(),
        new ModHalfTime(),
        new ModEasy(),
        new ModHardRock(),
        new ModSmallCircle(),
    ];

    /**
     * Gets a list of mods from a droid mod string, such as "hd".
     *
     * @param str The string.
     */
    static droidStringToMods(str: string): Mod[] {
        return this.checkDuplicateMods(
            this.allMods.filter(
                (m) =>
                    m.droidString && str.toLowerCase().includes(m.droidString)
            )
        );
    }

    /**
     * Gets a list of mods from a PC modbits.
     *
     * @param modbits The modbits.
     */
    static pcModbitsToMods(modbits: number): Mod[] {
        return this.checkDuplicateMods(
            this.allMods.filter((m) => m.bitwise & modbits)
        );
    }

    /**
     * Gets a list of mods from a PC mod string, such as "HDHR".
     *
     * @param str The string.
     */
    static pcStringToMods(str: string): Mod[] {
        const finalMods: Mod[] = [];

        str = str.toLowerCase();

        while (str) {
            let nchars: number = 1;

            for (const mod of this.allMods) {
                if (str.startsWith(mod.acronym.toLowerCase())) {
                    finalMods.push(mod);
                    nchars = 2;
                    break;
                }
            }

            str = str.slice(nchars);
        }

        return this.checkDuplicateMods(finalMods);
    }

    /**
     * Checks for mods that are duplicate and incompatible with each other.
     *
     * @param mods The mods to check for.
     */
    private static checkDuplicateMods(mods: Mod[]): Mod[] {
        for (const incompatibleMod of this.incompatibleMods) {
            const fulfilledMods: Mod[] = mods.filter((m) =>
                incompatibleMod.map((v) => v.acronym).includes(m.acronym)
            );

            if (fulfilledMods.length > 1) {
                mods = mods.filter(
                    (m) =>
                        !incompatibleMod
                            .map((v) => v.acronym)
                            .includes(m.acronym)
                );
                // Keep the first selected mod
                mods.push(fulfilledMods[0]);
            }
        }

        // Check for duplicate mod entries
        return Array.from(new Set(mods));
    }
}
