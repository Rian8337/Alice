import { Translation } from "@alice-localization/base/Translation";
import { CalculateStrings } from "../CalculateLocalization";

/**
 * The English translation for the `calculate` command.
 */
export class CalculateENTranslation extends Translation<CalculateStrings> {
    override readonly translations: CalculateStrings = {
        noBeatmapProvided:
            "Hey, there is no beatmap being talked in this channel! Please provide a beatmap!",
        beatmapProvidedIsInvalid: "Hey, please provide a valid beatmap!",
        beatmapNotFound:
            "I'm sorry, I cannot find the beatmap that you are looking for!",
        rawDroidSr: "Raw droid stars",
        rawDroidPp: "Raw droid pp",
        rawPcSr: "Raw PC stars",
        rawPcPp: "Raw PC pp",
    };
}
