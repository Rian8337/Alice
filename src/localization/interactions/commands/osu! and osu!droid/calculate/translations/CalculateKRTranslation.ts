import { Translation } from "@alice-localization/base/Translation";
import { CalculateStrings } from "../CalculateLocalization";

/**
 * The Korean translation for the `calculate` command.
 */
export class CalculateKRTranslation extends Translation<CalculateStrings> {
    override readonly translations: CalculateStrings = {
        noBeatmapProvided:
            "저기, 이 채널에서 얘기중인 비트맵이 없어요! 비트맵을 제공해 주세요!",
        beatmapProvidedIsInvalid: "저기, 유효한 비트맵을 제공해 주세요!",
        beatmapNotFound: "죄송해요, 찾으시려는 비트맵을 찾을 수 없었어요!",
        rawDroidSr: "Raw droid stars",
        rawDroidPp: "Raw droid pp",
        rawPcSr: "Raw PC stars",
        rawPcPp: "Raw PC pp",
    };
}
