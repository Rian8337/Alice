import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface EmbedCreatorStrings {
    readonly exitMenu: string;
    readonly result: string;
    readonly droidPP: string;
    readonly pcPP: string;
    readonly estimated: string;
    readonly droidStars: string;
    readonly pcStars: string;
    readonly starRating: string;
    readonly rebalanceCalculationNote: string;
    readonly beatmapInfo: string;
    readonly dateAchieved: string;
    readonly penalized: string;
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
    readonly broadcast: string;
    readonly broadcast1: string;
    readonly broadcast2: string;
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
    readonly ppProfileTitle: string;
    readonly totalPP: string;
    readonly ppProfile: string;
}

/**
 * Localizations for the `EmbedCreator` creator utility.
 */
export class EmbedCreatorLocalization extends Localization<EmbedCreatorStrings> {
    protected override readonly translations: Readonly<Translation<EmbedCreatorStrings>> = {
        en: {
            exitMenu: "Type \"exit\" to exit this menu",
            result: "Result",
            droidPP: "Droid pp",
            pcPP: "PC pp",
            estimated: "estimated",
            droidStars: "droid stars",
            pcStars: "PC stars",
            starRating: "Star Rating",
            rebalanceCalculationNote: "The resulting values are subject to change.",
            beatmapInfo: "Beatmap Information",
            dateAchieved: "Achieved on %s",
            penalized: "penalized",
            forFC: "for %s FC",
            sliderTicks: "slider ticks",
            sliderEnds: "slider ends",
            hitErrorAvg: "hit error avg",
            challengeId: "Challenge ID",
            timeLeft: "Challenge ID",
            weeklyChallengeTitle: "osu!droid Weekly Bounty Challenge",
            dailyChallengeTitle: "osu!droid Daily Challenge",
            featuredPerson: "Featured by %s",
            download: "Download",
            points: "Points",
            passCondition: "Pass Condition",
            constrain: "Constrain",
            modOnly: "%s mod only",
            rankableMods: "Any rankable mod except EZ, NF, and HT",
            challengeBonuses: "Use `/daily challenges` to check bonuses.",
            auctionInfo: "Auction Information",
            auctionName: "Name",
            auctionAuctioneer: "Auctioneer",
            creationDate: "Creation Date",
            auctionMinimumBid: "Minimum Bid Amount",
            auctionItemInfo: "Item Information",
            auctionPowerup: "Powerup",
            auctionItemAmount: "Amount",
            auctionBidInfo: "Bid Information",
            auctionBidders: "Bidders",
            auctionTopBidders: "Top Bidders",
            broadcast: "Broadcast",
            broadcast1: "If you see a user violating the rules, misbehaving, or intentionally trying to be annoying, please report the user using `/report` command (more information is available using `/help report`)",
            broadcast2: "Keep in mind that only staff members can view reports, therefore your privacy is safe. We appreciate your contribution towards bringing a friendly environment!",
            mapShareSubmission: "Submission by %s",
            mapShareStatusAndSummary: "Status and Summary",
            mapShareStatus: "Status",
            mapShareSummary: "Summary",
            mapShareStatusAccepted: "accepted",
            mapShareStatusDenied: "denied",
            mapShareStatusPending: "pending",
            mapShareStatusPosted: "posted",
            musicYoutubeChannel: "Channel",
            musicDuration: "Duration",
            musicQueuer: "Queued/requested by %s",
            ppProfileTitle: "PP Profile for %s",
            totalPP: "Total PP",
            ppProfile: "PP Profile",
        }
    };
}