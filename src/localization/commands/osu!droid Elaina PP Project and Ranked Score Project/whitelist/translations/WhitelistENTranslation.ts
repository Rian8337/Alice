import { Translation } from "@alice-localization/base/Translation";
import { WhitelistStrings } from "../WhitelistLocalization";

/**
 * The English translation for the `whitelist` command.
 */
export class WhitelistENTranslation extends Translation<WhitelistStrings> {
    override readonly translations: WhitelistStrings = {
        noBeatmapProvided: "Hey, please enter a beatmap link or beatmap ID!",
        noBeatmapIDorSetIDFound:
            "I'm sorry, I cannot find any beatmap ID or beatmapset ID!",
        noBeatmapsFound:
            "I'm sorry, I cannot find any beatmap with the provided beatmap ID or link!",
        whitelistSuccess: "Successfully whitelisted `%s`.",
        whitelistFailed: "I'm sorry, I'm unable to whitelist `%s`: `%s`.",
        unwhitelistSuccess: "Successfully unwhitelisted `%s`.",
        unwhitelistFailed: "I'm sorry, I'm unable to unwhitelist `%s`: `%s`.",
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
    };
}
