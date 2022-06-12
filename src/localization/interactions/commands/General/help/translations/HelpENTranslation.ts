import { Translation } from "@alice-localization/base/Translation";
import { HelpStrings } from "../HelpLocalization";

/**
 * The English translation for the `help` command.
 */
export class HelpENTranslation extends Translation<HelpStrings> {
    override readonly translations: HelpStrings = {
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
    };
}
