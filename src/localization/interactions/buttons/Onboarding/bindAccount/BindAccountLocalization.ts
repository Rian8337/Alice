import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { BindAccountENTranslation } from "./translations/BindAccountENTranslation";

export interface BindAccountStrings {
    readonly bindAccountEmbedTitle: string;
    readonly bindingDefinition: string;
    readonly bindingConstraints: string;
    readonly bindingRequirement: string;
    readonly accountRegistrationQuote: string;
    readonly bindingProcedure: string;
    readonly furtherBindQuote: string;
}

/**
 * Localizations for the `bindAccount` button command.
 */
export class BindAccountLocalization extends Localization<BindAccountStrings> {
    protected override readonly localizations: Readonly<
        Translations<BindAccountStrings>
    > = {
        en: new BindAccountENTranslation(),
    };
}
