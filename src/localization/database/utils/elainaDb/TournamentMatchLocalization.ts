import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TournamentMatchStrings {
    readonly scoreNotFound: string;
    readonly modsIsNotUsed: string;
    readonly replayNotFound: string;
    readonly unsupportedGameVersion: string;
    readonly modsExceptNotUsed: string;
    readonly modsWasUsed: string;
    readonly teamMembersIncorrectFMmod: string;
}

/**
 * Localizations for the `TournamentMatch` database utility.
 */
export class TournamentMatchLocalization extends Localization<TournamentMatchStrings> {
    protected override readonly translations: Readonly<
        Translation<TournamentMatchStrings>
    > = {
        en: {
            scoreNotFound: "Score not found",
            modsIsNotUsed: "%s is not used",
            replayNotFound: "Replay not found",
            unsupportedGameVersion: "Unsupported osu!droid version",
            modsExceptNotUsed: "Other mods except %s was used",
            modsWasUsed: "%s was used",
            teamMembersIncorrectFMmod: "No team members enabled HD/HR/EZ",
        },
        kr: {
            scoreNotFound: "기록이 발견되지 않음",
            modsIsNotUsed: "%s(이)가 사용되지 않음",
            replayNotFound: "리플레이가 발견되지 않음",
            unsupportedGameVersion: "지원하지 않는 osu!droid 버전",
            modsExceptNotUsed: "%s(이)가 아닌 다른 모드가 사용됨",
            modsWasUsed: "%s(이)가 사용됨",
            teamMembersIncorrectFMmod: "",
        },
    };
}
