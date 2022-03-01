import { Translation } from "@alice-localization/base/Translation";
import { DeployStrings } from "../DeployLocalization";

/**
 * The English translation for the `deploy` command.
 */
export class DeployENTranslation extends Translation<DeployStrings> {
    override readonly translations: DeployStrings = {
        commandNotFound: "I'm sorry, I cannot find any command with that name!",
        commandDeploySuccessful:
            "Successfully registered command `%s`. Please wait for it to get updated in Discord.",
    };
}
