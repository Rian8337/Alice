import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CalculateStrings {
    readonly noBeatmapProvided: string;
    readonly beatmapProvidedIsInvalid: string;
    readonly beatmapNotFound: string;
    readonly rawDroidSr: string;
    readonly rawDroidPp: string;
    readonly rawPcSr: string;
    readonly rawPcPp: string;
}

/**
 * Localizations for the `calculate` command.
 */
export class CalculateLocalization extends Localization<CalculateStrings> {
    protected override readonly translations: Readonly<
        Translation<CalculateStrings>
    > = {
        en: {
            noBeatmapProvided:
                "Hey, there is no beatmap being talked in this channel! Please provide a beatmap!",
            beatmapProvidedIsInvalid: "Hey, please provide a valid beatmap!",
            beatmapNotFound:
                "I'm sorry, I cannot find the beatmap that you are looking for!",
            rawDroidSr: "Raw droid stars",
            rawDroidPp: "Raw droid pp",
            rawPcSr: "Raw PC stars",
            rawPcPp: "Raw PC pp",
        },
        kr: {
            noBeatmapProvided:
                "저기, 이 채널에서 얘기중인 비트맵이 없어요! 비트맵을 제공해 주세요!",
            beatmapProvidedIsInvalid: "저기, 유효한 비트맵을 제공해 주세요!",
            beatmapNotFound: "죄송해요, 찾으시려는 비트맵을 찾을 수 없었어요!",
            rawDroidSr: "Raw droid stars",
            rawDroidPp: "Raw droid pp",
            rawPcSr: "Raw PC stars",
            rawPcPp: "Raw PC pp",
        },
    };
}
