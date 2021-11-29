import { BaseRunnableFunction } from "./BaseRunnableFunction";

export interface BaseRunnable {
    /**
     * Executes the runnable.
     */
    run: BaseRunnableFunction;
}