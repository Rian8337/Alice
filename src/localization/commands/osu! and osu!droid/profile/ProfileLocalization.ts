import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ProfileENTranslation } from "./translations/ProfileENTranslation";
import { ProfileIDTranslation } from "./translations/ProfileIDTranslation";
import { ProfileKRTranslation } from "./translations/ProfileKRTranslation";

export interface ProfileStrings {
    readonly tooManyOptions: string;
    readonly selfProfileNotFound: string;
    readonly userProfileNotFound: string;
    readonly viewingProfile: string;
    readonly invalidRGBAformat: string;
    readonly invalidHexCode: string;
    readonly changeInfoTextColorConfirmation: string;
    readonly changeInfoBackgroundColorConfirmation: string;
    readonly changeInfoTextColorSuccess: string;
    readonly changeInfoBackgroundColorSuccess: string;
    readonly coinsToBuyBackgroundNotEnough: string;
    readonly buyBackgroundConfirmation: string;
    readonly switchBackgroundConfirmation: string;
    readonly switchBackgroundSuccess: string;
    readonly aliceCoinAmount: string;
    readonly userDoesntOwnAnyBadge: string;
    readonly badgeIsAlreadyClaimed: string;
    readonly equipBadgeSuccess: string;
    readonly unequipBadgeSuccess: string;
    readonly badgeUnclaimable: string;
    readonly beatmapToClaimBadgeNotValid: string;
    readonly beatmapToClaimBadgeNotFound: string;
    readonly beatmapToClaimBadgeNotRankedOrApproved: string;
    readonly userDoesntHaveScoreinBeatmap: string;
    readonly userCannotClaimBadge: string;
    readonly claimBadgeSuccess: string;
    readonly chooseBackground: string;
    readonly changeInfoBoxBackgroundColorTitle: string;
    readonly enterColor: string;
    readonly supportedColorFormat: string;
    readonly changeInfoBoxTextColorTitle: string;
    readonly chooseClaimBadge: string;
    readonly claimBadge: string;
    readonly enterBeatmap: string;
    readonly enterBeatmapRestriction: string;
    readonly chooseEquipBadge: string;
    readonly chooseBadgeSlot: string;
    readonly owned: string;
    readonly droidPpBadgeDescription: string;
    readonly totalScoreBadgeDescription: string;
    readonly rankedScoreBadgeDescription: string;
    readonly beatmapFcBadgeDescription: string;
    readonly tournamentBadgeDescription: string;
    readonly unequipBadge: string;
    readonly infoBoxTextColorInfo: string;
    readonly infoBoxBackgroundColorInfo: string;
    readonly changeBackgroundLabel: string;
    readonly changeBackgroundDescription: string;
    readonly listBackgroundLabel: string;
    readonly listBackgroundDescription: string;
    readonly customizationPlaceholder: string;
    readonly showBadgeTemplateLabel: string;
    readonly showBadgeTemplateDescription: string;
    readonly claimBadgeLabel: string;
    readonly claimBadgeDescription: string;
    readonly equipBadgeLabel: string;
    readonly equipBadgeDescription: string;
    readonly unequipBadgeLabel: string;
    readonly unequipBadgeDescription: string;
    readonly listBadgeLabel: string;
    readonly listBadgeDescription: string;
    readonly viewBackgroundColorLabel: string;
    readonly viewBackgroundColorDescription: string;
    readonly changeBackgroundColorLabel: string;
    readonly changeBackgroundColorDescription: string;
    readonly viewTextColorLabel: string;
    readonly viewTextColorDescription: string;
    readonly changeTextColorLabel: string;
    readonly changeTextColorDescription: string;
    readonly playerBindInfo: string;
    readonly avatarLink: string;
    readonly uid: string;
    readonly rank: string;
    readonly playCount: string;
    readonly country: string;
    readonly bindInformation: string;
    readonly binded: string;
    readonly playedVerificationMap: string;
    readonly notBinded: string;
}

/**
 * Localizations for the `profile` command.
 */
export class ProfileLocalization extends Localization<ProfileStrings> {
    protected override readonly localizations: Readonly<
        Translations<ProfileStrings>
    > = {
        en: new ProfileENTranslation(),
        kr: new ProfileKRTranslation(),
        id: new ProfileIDTranslation(),
    };
}
