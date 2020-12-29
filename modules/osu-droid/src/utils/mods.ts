/**
 * A namespace containing bitwise constant of mods in both osu!droid and osu!standard as well as conversion methods.
 */
export namespace mods {
    /**
     * Mods in osu!droid.
     */
    export enum droidMods {
        at = "a",
        rx = "x",
        ap = "p",
        ez = "e",
        nf = "n",
        hr = "r",
        hd = "h",
        fl = "i",
        dt = "d",
        nc = "c",
        ht = "t",
        pr = "s",
        sc = "m",
        su = "b",
        re = "l",
        pf = "f",
        sd = "u",
        v2 = "v"
    }

    /**
     * Mods in osu!standard.
     */
    export enum osuMods {
        nomod = 0,
        nf = 1<<0,
        ez = 1<<1,
        td = 1<<2,
        hd = 1<<3,
        hr = 1<<4,
        sd = 1<<5,
        dt = 1<<6,
        rx = 1<<7,
        ht = 1<<8,
        nc = 1<<9,
        fl = 1<<10,
        so = 1<<12,
        ap = 1<<13,
        pf = 1<<14,
        v2 = 1<<29,
        speed_changing = dt | ht | nc,
        map_changing = ez | hr | speed_changing,
        unranked = rx | ap | v2
    }

    /**
     * Converts droid mod string to PC mod string.
     * 
     * @param mod The string to convert.
     * @param detailed Whether or not to return a detailed string. Defaults to `false`.
     */
    export function droidToPC(mod: string = "", detailed: boolean = false): string {
        if (!mod) {
            return "";
        }
        mod = mod.toLowerCase();
        let res: string = '';
        
        if (detailed) {
            let count: number = 0;
            if (mod.includes("-")) {
                res += 'None ';
                count++;
            };
            if (mod.includes("n")) {
                res += 'NoFail ';
                count++;
            }
            if (mod.includes("e")) {
                res += 'Easy ';
                count++;
            }
            if (mod.includes("t")) {
                res += 'HalfTime ';
                count++;
            }
            if (mod.includes("h")) {
                res += 'Hidden ';
                count++;
            }
            if (mod.includes("d")) {
                res += 'DoubleTime ';
                count++;
            }
            if (mod.includes("r")) {
                res += 'HardRock ';
                count++;
            }
            if (mod.includes("c")) {
                res += 'NightCore ';
                count++;
            }
            if (mod.includes("s")) {
                res += 'Precise ';
                count++;
            }
            if (mod.includes("m")) {
                res += 'SmallCircle ';
                count++;
            }
            if (mod.includes("b")) {
                res += 'SpeedUp';
                count++;
            }
            if (mod.includes("l")) {
                res += 'ReallyEasy ';
                count++;
            }
            if (mod.includes("f")) {
                res += 'Perfect ';
                count++;
            }
            if (mod.includes("u")) {
                res += 'SuddenDeath ';
                count++;
            }
            if (mod.includes("v")) {
                res += 'ScoreV2 ';
                count++;
            }
            if (count > 1) {
                return res.trim().split(" ").join(", ");
            } else {
                return res.trim();
            }
        }

        mod = mod.toLowerCase();
        let tempMod: string = mod;
        while (tempMod) {
            for (const modEntry in droidMods) {
                const entry = modEntry as keyof typeof droidMods;
                if (tempMod.startsWith(droidMods[entry])) {
                    res += entry.toUpperCase();
                }
            }
            tempMod = tempMod.slice(1);
        }

        // format mod string properly
        res = modbitsToString(modbitsFromString(res));
        while (mod) {
            let nchars: number = 1;
            for (const modEntry in droidMods) {
                const entry = modEntry as keyof typeof droidMods;
                if (res.toLowerCase().includes(entry)) {
                    continue;
                }
                if (mod.startsWith(droidMods[entry])) {
                    nchars = 2;
                    res += entry.toUpperCase();
                }
            }
            mod = mod.slice(nchars);
        }

        return res;
    }
    
    /**
     * Converts PC mod string to droid mod string.
     * 
     * @param mod The string to convert.
     */
    export function pcToDroid(mod: string = ""): string {
        let res: string = "";
        mod = mod.toLowerCase();
        while (mod) {
            for (const modEntry in droidMods) {
                const entry = modEntry as keyof typeof droidMods;
                if (mod.startsWith(entry)) {
                    res += droidMods[entry];
                }
            }
            mod = mod.slice(2);
        }
        return res;
    }

    /**
     * Converts PC mods to a detailed string.
     * 
     * @param mod The string to convert.
     */
    export function pcToDetail(mod: string = ""): string {
        let res = '';
        if (!mod) return 'None';
        mod = mod.toLowerCase();
        let count = 0;
        if (mod.includes("nf")) {
            res += 'NoFail ';
            count++;
        }
        if (mod.includes("ez")) {
            res += 'Easy ';
            count++;
        }
        if (mod.includes("ht")) {
            res += 'HalfTime ';
            count++;
        }
        if (mod.includes("td")) {
            res += 'TouchDevice ';
            count++;
        }
        if (mod.includes("hd")) {
            res += 'Hidden ';
            count++;
        }
        if (mod.includes("dt")) {
            res += 'DoubleTime ';
            count++;
        }
        if (mod.includes("hr")) {
            res += 'HardRock ';
            count++;
        }
        if (mod.includes("nc")) {
            res += 'NightCore ';
            count++;
        }
        if (mod.includes("pf")) {
            res += 'Perfect ';
            count++;
        }
        if (mod.includes("so")) {
            res += 'SpunOut ';
            count++;
        }
        if (mod.includes('v2')) {
            res += 'ScoreV2 ';
            count++;
        }
        if (count > 1) {
            return res.trim().split(" ").join(", ");
        } else {
            return res.trim();
        }
    }

    /**
     * Converts an osu!standard mod string into modbits.
     * 
     * @param str The string to convert.
     */
    export function modbitsFromString(str: string = ""): number {
        let mask: number = 0;
        str = str.toLowerCase();
        while (str) {
            let nchars: number = 1;
            for (const modEntry in osuMods) {
                const entry = modEntry as keyof typeof osuMods;
                if (entry.length !== 2) {
                    continue;
                }
                if (str.startsWith(entry)) {
                    mask |= osuMods[entry];
                    nchars = 2;
                    break;
                }
            }
            str = str.slice(nchars);
        }
        return mask;
    }

    /**
     * Converts mods bitwise into a string, such as "HDHR".
     * 
     * @param mod The modbits to convert.
     */
    export function modbitsToString(mod: number = 0): string {
        let res: string = "";
        for (const modEntry in osuMods) {
            const entry = modEntry as keyof typeof osuMods;
            if (entry.length !== 2) {
                continue;
            }
            if (mod & osuMods[entry]) {
                res += entry.toUpperCase();
            }
        }
        if (res.indexOf("DT") >= 0 && res.indexOf("NC") >= 0) {
            res = res.replace("DT", "");
        }
        if (res.indexOf("SD") >= 0 && res.indexOf("PF") >= 0) {
            res = res.replace("SD", "");
        }
        return res;
    }
}