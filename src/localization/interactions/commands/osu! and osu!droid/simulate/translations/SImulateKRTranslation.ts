import { Translation } from "@alice-localization/base/Translation";
import { SimulateStrings } from "../SimulateLocalization";

/**
 * The Korean translation for the `simulate` command.
 */
export class SimulateKRTranslation extends Translation<SimulateStrings> {
    override readonly translations: SimulateStrings = {
        noSimulateOptions: "",
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        playerNotFound: "죄송해요, 찾으시는 유저를 찾지 못했어요!",
        playerHasNoRecentPlays:
            "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
        noBeatmapProvided:
            "저기, 이 채널에서 얘기중인 비트맵이 없어요! 비트맵을 제공해 주세요!",
        beatmapProvidedIsInvalid: "저기, 유효한 비트맵을 제공해 주세요!",
        beatmapNotFound: "죄송해요, 찾으시려는 비트맵을 찾을 수 없었어요!",
        selfScoreNotFound:
            "죄송해요, 이 비트맵에 아무런 기록도 남기지 않으셨네요!",
        userScoreNotFound:
            "죄송해요, 이 유저는 해당 비트맵에 아무런 기록도 남기지 않았네요!",
        simulatedPlayDisplay: "",
    };
}
