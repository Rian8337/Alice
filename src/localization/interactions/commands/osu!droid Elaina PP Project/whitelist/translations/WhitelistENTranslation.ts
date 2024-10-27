import { Translation } from "@localization/base/Translation";
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
        filteringBeatmaps: "Filtering Whitelisted Beatmaps",
        filterOptionsTitle: "Filter Options",
        filterOptionsDescription: "`CS`, `AR`, `OD`, `HP`, `SR`, `BPM`",
        sortingOptionsTitle: "Sorting Options",
        sortingOptionsDescription:
            '`CS`, `AR`, `OD`, `HP`, `SR`, `BPM`, `mapid`, `mapname`, and `date`\n\nBy default, sorting is ascending. You can put "-" in front of a sorting option to use descend sort.',
        equalitySymbolsTitle: "Equality Symbols",
        equalitySymbolsDescription:
            "`<=` (less than or equal to), `<` (less than), `=` (equal to), `>` (more than), and `>=` (more than or equal to).",
        behaviorTitle: "Behavior",
        behaviorDescription:
            "By default, there is no filter, and the sort option is set to beatmap name.\n\nUsing SR and/or BPM sort option will override beatmap name sort option.\n\nAnything that doesn't fall into any of the filter or sort option will be treated as searching beatmap name.",
        examplesTitle: "Examples",
        examplesDescription1:
            "`cs>=4.2 cs<=5 sort=cs`\nwill search for beatmaps with CS between 4.2 (inclusive) and 5 (inclusive) and sort the search results by CS ascendingly",
        examplesDescription2:
            "`od>=5 od<9 ar>7 ar<=9.7 sort=-ar`\nwill search for beatmaps with AR between 7 (exclusive) and 9.7 (inclusive) and OD between 5 (inclusive) and 9 (exclusive), and sort the search results by AR descendingly",
        examplesDescription3:
            "`od>=7 bpm>=180`\nwill search for beatmaps with OD above 7 (inclusive) and BPM above 180 (inclusive) and sort the search results by BPM ascendingly",
        examplesDescription4:
            '`cs>=4.2 ar>9.3 od>=8 hp>=5 sort=-sr logic boi is the best`\nwill search for beatmaps with CS above 4.2 (inclusive), AR above 9.3 (exclusive), OD above 8 (inclusive), HP above 5 (inclusive), and matches the keyword "logic boi is the best" (much like osu! search function), and sort the search results by star rating descendingly',
        beatmapsFound: "Beatmaps Found",
        beatmapLink: "Beatmap Link",
        download: "Download",
        dateWhitelisted: "Date Whitelisted",
    };
}
