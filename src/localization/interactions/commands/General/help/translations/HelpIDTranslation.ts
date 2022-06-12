import { Translation } from "@alice-localization/base/Translation";
import { HelpStrings } from "../HelpLocalization";

/**
 * The Indonesian translation for the `help` command.
 */
export class HelpIDTranslation extends Translation<HelpStrings> {
    override readonly translations: HelpStrings = {
        noCommandFound: "",
        aliceHelp: "",
        creator: "",
        useHelpCommand: "",
        issuesContact: "",
        category: "",
        requiredPermissions: "",
        examples: "",
        usage: "",
        required: "",
        optional: "",
        details: "",
        none: "",
    };
}
