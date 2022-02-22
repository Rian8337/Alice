import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface WhitelistStrings {
    readonly noBeatmapProvided: string;
    readonly noBeatmapIDorSetIDFound: string;
    readonly noBeatmapsFound: string;
    readonly whitelistSuccess: string;
    readonly whitelistFailed: string;
    readonly unwhitelistSuccess: string;
    readonly unwhitelistFailed: string;
    readonly noCachedBeatmapFound: string;
    readonly beatmapNotFound: string;
    readonly beatmapDoesntNeedWhitelist: string;
    readonly whitelistStatus: string;
    readonly whitelistedAndUpdated: string;
    readonly whitelistedNotUpdated: string;
    readonly notWhitelisted: string;
    readonly starRating: string; // see 63.8
}

/**
 * Localizations for the `whitelist` command.
 */
export class WhitelistLocalization extends Localization<WhitelistStrings> {
    protected override readonly translations: Readonly<
        Translation<WhitelistStrings>
    > = {
        en: {
            noBeatmapProvided:
                "Hey, please enter a beatmap link or beatmap ID!",
            noBeatmapIDorSetIDFound:
                "I'm sorry, I cannot find any beatmap ID or beatmapset ID!",
            noBeatmapsFound:
                "I'm sorry, I cannot find any beatmap with the provided beatmap ID or link!",
            whitelistSuccess: "Successfully whitelisted `%s`.",
            whitelistFailed: "I'm sorry, I'm unable to whitelist `%s`: `%s`.",
            unwhitelistSuccess: "Successfully unwhitelisted `%s`.",
            unwhitelistFailed:
                "I'm sorry, I'm unable to unwhitelist `%s`: `%s`.",
            noCachedBeatmapFound:
                "I'm sorry, there is no cached beatmap in this channel! Please enter a beatmap ID or beatmap link!",
            beatmapNotFound:
                "I'm sorry, I cannot find the beatmap in osu! beatmap listing!",
            beatmapDoesntNeedWhitelist:
                "Hey, this beatmap doesn't need to be whitelisted!",
            whitelistStatus: "`%s` is %s.",
            whitelistedAndUpdated: "whitelisted and updated",
            whitelistedNotUpdated: "whitelisted, but not updated",
            notWhitelisted: "not whitelisted",
            starRating: "Star Rating",
        },
        kr: {
            noBeatmapProvided: "화이트리스트에 있으며 업데이트됨",
            noBeatmapIDorSetIDFound:
                "죄송해요, 비트맵 ID나 비트맵셋 ID를 찾을 수 없어요!",
            noBeatmapsFound:
                "죄송해요, 제공해 주신 비트맵 ID나 링크로 비트맵을 찾을 수 없었어요!",
            whitelistSuccess: "성공적으로 %s를 화이트리스트에 넣었어요.",
            whitelistFailed: "성공적으로 %s를 화이트리스트에 넣었어요.",
            unwhitelistSuccess: "",
            unwhitelistFailed: "",
            noCachedBeatmapFound:
                "죄송해요, 이 채널에 캐시된 비트맵이 없어요! 비트맵 링크나 ID를 입력해 주세요!",
            beatmapNotFound:
                "죄송해요, 비트맵을 osu! 비트맵 목록에서 찾을 수 없었어요!",
            beatmapDoesntNeedWhitelist:
                "저기, 이 비트맵을 화이트리스트에 넣을 필요가 없어요!",
            whitelistStatus: "%s은 다음 상태에요: %s.",
            whitelistedAndUpdated: "화이트리스트에 있으며 업데이트됨",
            whitelistedNotUpdated: "화이트리스트에 있지만, 업데이트 되지 않음",
            notWhitelisted: "화이트리스트에 없음",
            starRating: "스타 레이팅",
        },
    };
}
