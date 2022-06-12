import { Translation } from "@alice-localization/base/Translation";
import { BlacklistStrings } from "../BlacklistLocalization";

/**
 * The English translation for the `blacklist` command.
 */
export class BlacklistENTranslation extends Translation<BlacklistStrings> {
    override readonly translations: BlacklistStrings = {
        noBeatmapProvided:
            "Hey, please enter a beatmap to blacklist or unblacklist!",
        beatmapNotFound:
            "Hey, I cannot find the beatmap with the provided link or ID!",
        noBlacklistReasonProvided:
            "Hey, please enter a reason for blacklisting the beatmap!",
        blacklistFailed: "I'm sorry, I cannot blacklist the beatmap: `%s`.",
        blacklistSuccess: "Successfully blacklisted `%s`.",
        unblacklistFailed: "I'm sorry, I cannot unblacklist the beatmap: `%s`.",
        unblacklistSuccess: "Successfully unblacklisted `%s`.",
        detectedBeatmapId:
            "Detected beatmap ID: %s. Choose the action that you want to do.",
        blacklist: "Blacklist",
        blacklistAction: "Blacklist the beatmap.",
        unblacklist: "Unblacklist",
        unblacklistAction: "Unblacklist the beatmap.",
    };
}
