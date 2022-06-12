import { Translation } from "@alice-localization/base/Translation";
import { MapshareSubmissionStrings } from "../MapshareSubmissionLocalization";

/**
 * The Korean translation for the `mapshare-postsubmission` modal command.
 */
export class MapshareSubmissionKRTranslation extends Translation<MapshareSubmissionStrings> {
    override readonly translations: MapshareSubmissionStrings = {
        noBeatmapFound: "저기, 유효한 비트맵 ID나 링크를 입력해 주세요!",
        beatmapIsTooEasy: "죄송해요, 3성 이상의 비트맵만 제출할 수 있어요!",
        beatmapHasLessThan50Objects:
            "죄송해요, 비트맵의 오브젝트가 50개보다 적은 것 같네요!",
        beatmapHasNoCirclesOrSliders:
            "죄송해요, 이 비트맵은 서클과 슬라이더가 하나도 없네요!",
        beatmapDurationIsLessThan30Secs:
            "죄송해요, 비트맵 길이가 너무 짧아요! 최소한 30초는 되어야해요.",
        beatmapIsWIPOrQualified:
            "죄송해요, WIP(Work In Progress)또는 qualified상태의 비트맵을 제출할 수 없어요!",
        beatmapWasJustSubmitted:
            "죄송해요, 이 비트맵은 제출된지 일주일이 안됐어요!",
        beatmapWasJustUpdated:
            "죄송해요, 이 비트맵은 업데이트 된지 3일이 안됐어요!",
        beatmapHasBeenUsed:
            "죄송해요, 이 비트맵은 이전에 맵 공유로 제출된 적이 있어요!",
        summaryWordCountNotValid:
            "죄송해요, 지금 설명에 %s개의 단어가 있어요! 최소 50단어에서 120단어까지만 가능해요!",
        submitFailed: "죄송해요, 제출할 수 없었어요: %s.",
        submitSuccess: "성공적으로 제출했어요.",
    };
}
