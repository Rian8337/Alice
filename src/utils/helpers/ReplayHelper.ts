import { Config } from "@alice-core/Config";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

/**
 * A helper class for osu!droid replays.
 */
export abstract class ReplayHelper {
    /**
     * The path to the replay folder.
     */
    static readonly folderPath = join(
        homedir(),
        "..",
        "..",
        "DroidData",
        "osudroid",
        "zip",
        "upload"
    );

    /**
     * Retrievs the replay file of a score.
     *
     * @param scoreId The ID of the score.
     * @returns The replay file.
     */
    static async retrieveFile(scoreId: number): Promise<Buffer | null> {
        if (Config.isDebug) {
            return null;
        }

        try {
            return await readFile(
                join(this.folderPath, `${scoreId.toString()}.odr`)
            );
        } catch {
            return null;
        }
    }

    /**
     * Performs an analysis method to the replay analyzer or a score.
     *
     * @param input The replay analyzer or score.
     */
    static async analyzeReplay(input: ReplayAnalyzer | Score): Promise<void> {
        let analyzer: ReplayAnalyzer;

        if (input instanceof Score) {
            if (Config.isDebug) {
                await input.downloadReplay();
            }

            input.replay ??= new ReplayAnalyzer({ scoreID: input.scoreID });
            analyzer = input.replay;
        } else {
            analyzer = input;
        }

        if (!Config.isDebug) {
            analyzer.originalODR ??= await this.retrieveFile(input.scoreID);
        }

        if (!analyzer.data) {
            await analyzer.analyze();
        }
    }
}
