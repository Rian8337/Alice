import { hrtime } from "process";

/**
 * Helper functions to hopefully ease development.
 */
export abstract class HelperFunctions {
    /**
     * Pauses the execution of a function for
     * the specified duration.
     * 
     * @param duration The duration to pause for, in seconds.
     */
    static sleep(duration: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, duration * 1000));
    }

    /**
     * Gets the fields of a class, stripping
     * any methods away.
     * 
     * @param o The class to get the fields from.
     * @returns An object with each class fields mapped respectively.
     */
    static getClassFields(o: any): any {
        const names: string[] = Object.getOwnPropertyNames(o);
        const values: any[] = Object.values(o);

        const final: any = {};

        for (let i = 0; i < names.length; ++i) {
            Object.defineProperty(final, names[i], { value: values[i], configurable: true, enumerable: true, writable: true })
        }

        return final;
    }

    /**
     * Converts a CSS RGB string to hex code.
     * 
     * @param rgb The CSS RGB string.
     * @returns The hex code from the RGB string.
     */
    static rgbToHex(rgb: string): string {
        const colors: string[] = rgb.split("(")[1].split(")")[0].split(",").map(v => {
            const hex: string = parseInt(v).toString(16);

            return hex.length === 1 ? `0${hex}` : hex;
        });

        return "#" + colors.join("");
    }
}