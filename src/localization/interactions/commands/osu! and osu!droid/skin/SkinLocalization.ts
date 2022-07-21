import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SkinENTranslation } from "./translations/SkinENTranslation";
import { SkinESTranslation } from "./translations/SkinESTranslation";
import { SkinIDTranslation } from "./translations/SkinIDTranslation";
import { SkinKRTranslation } from "./translations/SkinKRTranslation";

export interface SkinStrings {
    readonly invalidSkinName: string;
    readonly invalidSkinLink: string;
    readonly skinNameNotAvailable: string;
    readonly skinNotFound: string;
    readonly skinNotOwnedByUser: string;
    readonly noSkinSetForUser: string;
    readonly previewImageTooBig: string;
    readonly invalidPreviewImage: string;
    readonly userSkinList: string;
    readonly addSkinFailed: string;
    readonly addSkinSuccess: string;
    readonly deleteSkinFailed: string;
    readonly deleteSkinSuccess: string;
    readonly editSkinFailed: string;
    readonly editSkinSuccess: string;
}

/**
 * Localizations for the `skin` command.
 */
export class SkinLocalization extends Localization<SkinStrings> {
    protected override readonly localizations: Readonly<
        Translations<SkinStrings>
    > = {
        en: new SkinENTranslation(),
        kr: new SkinKRTranslation(),
        id: new SkinIDTranslation(),
        es: new SkinESTranslation(),
    };
}
