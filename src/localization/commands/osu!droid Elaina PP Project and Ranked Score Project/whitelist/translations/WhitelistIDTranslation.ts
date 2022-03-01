import { Translation } from "@alice-localization/base/Translation";
import { WhitelistStrings } from "../WhitelistLocalization";

/**
 * The Indonesian translation for the `whitelist` command.
 */
export class WhitelistIDTranslation extends Translation<WhitelistStrings> {
    override readonly translations: WhitelistStrings = {
        noBeatmapProvided: "",
        noBeatmapIDorSetIDFound: "",
        noBeatmapsFound: "",
        whitelistSuccess: "",
        whitelistFailed: "",
        unwhitelistSuccess: "",
        unwhitelistFailed: "",
        noCachedBeatmapFound: "",
        beatmapNotFound: "",
        beatmapDoesntNeedWhitelist: "",
        whitelistStatus: "",
        whitelistedAndUpdated: "",
        whitelistedNotUpdated: "",
        notWhitelisted: "",
        starRating: "",
    };
}
