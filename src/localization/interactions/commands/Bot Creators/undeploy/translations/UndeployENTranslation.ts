import { Translation } from "@alice-localization/base/Translation";
import { UndeployStrings } from "../UndeployLocalization";

/**
 * The English translation for the `undeploy` command.
 */
export class UndeployENTranslation extends Translation<UndeployStrings> {
    override readonly translations: UndeployStrings = {
        commandNotFound: "I'm sorry, I cannot find any command with that name!",
        commandUndeploySuccessful: "Successfully unregistered `%s` command.",
    };
}
