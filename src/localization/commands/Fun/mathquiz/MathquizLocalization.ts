import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MathquizENTranslation } from "./translations/MathquizENTranslation";
import { MathquizIDTranslation } from "./translations/MathquizIDTranslation";
import { MathquizKRTranslation } from "./translations/MathquizKRTranslation";

export interface MathquizStrings {
    readonly userStillHasActiveGame: string;
    readonly equationGeneratorError: string;
    readonly equationQuestion: string;
    readonly correctAnswer: string;
    readonly wrongAnswer: string;
    readonly operatorCount: string;
    readonly level: string;
}

/**
 * Localizations for the `mathquiz` command.
 */
export class MathquizLocalization extends Localization<MathquizStrings> {
    protected override readonly localizations: Readonly<
        Translations<MathquizStrings>
    > = {
        en: new MathquizENTranslation(),
        kr: new MathquizKRTranslation(),
        id: new MathquizIDTranslation(),
    };
}
