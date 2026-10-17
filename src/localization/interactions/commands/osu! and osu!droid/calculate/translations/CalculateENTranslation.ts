import { Translation } from "@localization/base/Translation";
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
        variantNotFound: "I'm sorry, I cannot find the variant %s!",
        variantListUnavailable:
            "I'm sorry, I can't reach the variant list right now. Please try again later!",
        variantUnavailable:
            "I'm sorry, the variant %s is unavailable right now!",
        variantWrongMode: "I'm sorry, %s is not a %s variant!",
        rawDroidSr: "Raw droid stars",
        rawDroidPp: "Raw droid pp",
        rawPcSr: "Raw PC stars",
        rawPcPp: "Raw PC pp",
    };
}
