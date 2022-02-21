import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface HelpStrings {
    readonly noCommandFound: string;
    readonly aliceHelp: string;
    readonly creator: string;
    readonly useHelpCommand: string;
    readonly issuesContact: string;
    readonly category: string;
    readonly requiredPermissions: string;
    readonly examples: string;
    readonly usage: string;
    readonly required: string;
    readonly optional: string;
    readonly details: string;
    readonly none: string;
}

/**
 * Localizations for the `help` command.
 */
export class HelpLocalization extends Localization<HelpStrings> {
    protected override readonly translations: Readonly<
        Translation<HelpStrings>
    > = {
            en: {
                noCommandFound: "I'm sorry, I cannot find the command!",
                aliceHelp: "Alice Synthesis Thirty Help",
                creator: "Made by <@132783516176875520> and <@386742340968120321>.",
                useHelpCommand:
                    "For detailed information about a command, use `/help [command name]`.",
                issuesContact:
                    "If you encounter any bugs or issues with the bot, please contact bot creators.",
                category: "Category",
                requiredPermissions: "Required Permissions",
                examples: "Examples",
                usage: "Usage",
                required: "Required",
                optional: "Optional",
                details: "Details",
                none: "None",
            },
        };
}
