import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface BlacklistStrings {
    readonly noBeatmapProvided: string;
    readonly beatmapNotFound: string;
    readonly noBlacklistReasonProvided: string;
    readonly blacklistFailed: string;
    readonly blacklistSuccess: string;
    readonly unblacklistFailed: string;
    readonly unblacklistSuccess: string;
    readonly detectedBeatmapId: string;
    readonly blacklist: string;
    readonly blacklistAction: string;
    readonly unblacklist: string;
    readonly unblacklistAction: string;
}

/**
 * Localizations for the `blacklist` command.
 */
export class BlacklistLocalization extends Localization<BlacklistStrings> {
    protected override readonly translations: Readonly<
        Translation<BlacklistStrings>
    > = {
        en: {
            noBeatmapProvided:
                "Hey, please enter a beatmap to blacklist or unblacklist!",
            beatmapNotFound:
                "Hey, I cannot find the beatmap with the provided link or ID!",
            noBlacklistReasonProvided:
                "Hey, please enter a reason for blacklisting the beatmap!",
            blacklistFailed: "I'm sorry, I cannot blacklist the beatmap: `%s`.",
            blacklistSuccess: "Successfully blacklisted `%s`.",
            unblacklistFailed:
                "I'm sorry, I cannot unblacklist the beatmap: `%s`.",
            unblacklistSuccess: "Successfully unblacklisted `%s`.",
            detectedBeatmapId:
                "Detected beatmap ID: %s. Choose the action that you want to do.",
            blacklist: "Blacklist",
            blacklistAction: "Blacklist the beatmap.",
            unblacklist: "Unblacklist",
            unblacklistAction: "Unblacklist the beatmap.",
        },
        kr: {
            noBeatmapProvided: "",
            beatmapNotFound: "",
            noBlacklistReasonProvided: "",
            blacklistFailed: "",
            blacklistSuccess: "",
            unblacklistFailed: "",
            unblacklistSuccess: "",
            detectedBeatmapId:
                "감지된 비트맵 ID: %s. 원하는 행동을 선택해 주세요.",
            blacklist: "블랙리스트",
            blacklistAction: "비트맵을 블랙리스트에 넣어요.",
            unblacklist: "언블랙리스트",
            unblacklistAction: "비트맵을 블랙리스트에서 제거해요.",
        },
    };
}
