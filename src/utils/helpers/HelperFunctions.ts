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
}