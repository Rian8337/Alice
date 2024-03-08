import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { EmbedCreatorENTranslation } from "./translations/EmbedCreatorENTranslation";
import { EmbedCreatorESTranslation } from "./translations/EmbedCreatorESTranslation";
import { EmbedCreatorIDTranslation } from "./translations/EmbedCreatorIDTranslation";
import { EmbedCreatorKRTranslation } from "./translations/EmbedCreatorKRTranslation";

export interface EmbedCreatorStrings {
    readonly beatmapObjects: string;
    readonly beatmapDroidStatistics: string;
    readonly beatmapOsuStatistics: string;
    readonly beatmapGeneralStatistics: string;
    readonly exitMenu: string;
    readonly result: string;
    readonly droidPP: string;
    readonly pcPP: string;
    readonly droidStars: string;
    readonly pcStars: string;
    readonly starRating: string;
    readonly rebalanceCalculationNote: string;
    readonly beatmapInfo: string;
    readonly dateAchieved: string;
    readonly penalties: string;
    readonly threeFinger: string;
    readonly sliderCheese: string;
    readonly forFC: string;
    readonly sliderTicks: string;
    readonly sliderEnds: string;
    readonly hitErrorAvg: string;
    readonly challengeId: string;
    readonly timeLeft: string;
    readonly weeklyChallengeTitle: string;
    readonly dailyChallengeTitle: string;
    readonly featuredPerson: string;
    readonly download: string;
    readonly points: string;
    readonly passCondition: string;
    readonly constrain: string;
    readonly modOnly: string;
    readonly rankableMods: string;
    readonly challengeBonuses: string;
    readonly auctionInfo: string;
    readonly auctionName: string;
    readonly auctionAuctioneer: string;
    readonly creationDate: string;
    readonly auctionMinimumBid: string;
    readonly auctionItemInfo: string;
    readonly auctionPowerup: string;
    readonly auctionItemAmount: string;
    readonly auctionBidInfo: string;
    readonly auctionBidders: string;
    readonly auctionTopBidders: string;
    readonly reportBroadcast: string;
    readonly reportBroadcast1: string;
    readonly reportBroadcast2: string;
    readonly mapShareSubmission: string;
    readonly mapShareStatusAndSummary: string;
    readonly mapShareStatus: string;
    readonly mapShareSummary: string;
    readonly mapShareStatusAccepted: string; // see MapshareLocalization
    readonly mapShareStatusDenied: string;
    readonly mapShareStatusPending: string;
    readonly mapShareStatusPosted: string;
    readonly musicYoutubeChannel: string;
    readonly musicDuration: string;
    readonly musicQueuer: string;
    readonly ppProfileTitle: string; // see PrototypecheckLocalization
    readonly totalPP: string;
    readonly ppProfile: string;
    readonly totalPPNoBonus: string;
    readonly warningInfo: string;
    readonly warnedUser: string;
    readonly warningId: string;
    readonly warningIssuedBy: string;
    readonly expirationDate: string; // see 22.140
    readonly reason: string; // see 43.9
    readonly channel: string;
    readonly recommendedStarRating: string;
    readonly none: string;
}

/**
 * Localizations for the `EmbedCreator` creator utility.
 */
export class EmbedCreatorLocalization extends Localization<EmbedCreatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<EmbedCreatorStrings>
    > = {
        en: new EmbedCreatorENTranslation(),
        kr: new EmbedCreatorKRTranslation(),
        id: new EmbedCreatorIDTranslation(),
        es: new EmbedCreatorESTranslation(),
    };
}
