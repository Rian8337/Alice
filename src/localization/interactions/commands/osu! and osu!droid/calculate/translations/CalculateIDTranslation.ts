import { Translation } from "@localization/base/Translation";
import { CalculateStrings } from "../CalculateLocalization";

/**
 * The Indonesian translation for the `calculate` command.
 */
export class CalculateIDTranslation extends Translation<CalculateStrings> {
    override readonly translations: CalculateStrings = {
        noBeatmapProvided:
            "Hei, tidak ada beatmap yang sedang diobrolkan dalam channel ini!",
        beatmapProvidedIsInvalid: "Hei, mohon berikan beatmap yang benar!",
        beatmapNotFound:
            "Maaf, aku tidak dapat menemukan beatmap yang kamu berikan!",
        rawDroidSr: "Raw droid star",
        rawDroidPp: "Raw droid pp",
        rawPcSr: "Raw PC star",
        rawPcPp: "Raw PC pp",
    };
}
