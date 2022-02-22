import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CompareStrings {
    readonly tooManyOptions: string;
    readonly noCachedBeatmap: string;
    readonly playerNotFound: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly comparePlayDisplay: string;
}

/**
 * Localizations for the `compare` command.
 */
export class CompareLocalization extends Localization<CompareStrings> {
    protected override readonly translations: Readonly<
        Translation<CompareStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            noCachedBeatmap:
                "I'm sorry, there is no beatmap being talked in the channel!",
            playerNotFound:
                "I'm sorry, I cannot find the player that you are looking for!",
            selfScoreNotFound:
                "I'm sorry, you have not submitted any scores in the beatmap!",
            userScoreNotFound:
                "I'm sorry, this user has not submitted any scores in the beatmap!",
            comparePlayDisplay: "Comparison play for %s:",
        },
        kr: {
            tooManyOptions:
                "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
            noCachedBeatmap: "죄송해요, 이 채널에서 얘기중인 비트맵이 없네요!",
            playerNotFound: "죄송해요, 찾으시려는 플레이어를 못찾겠어요!",
            selfScoreNotFound:
                "죄송해요, 이 비트맵에 아무런 기록도 남기지 않으셨네요!",
            userScoreNotFound:
                "죄송해요, 이 유저는 해당 비트맵에 아무런 기록도 남기지 않았네요!",
            comparePlayDisplay: "%s의 플레이 비교:",
        },
    };
}
