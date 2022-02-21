import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface DeployStrings {
    readonly commandNotFound: string;
    readonly commandDeploySuccessful: string;
}

/**
 * Localizations for the `deploy` command.
 */
export class DeployLocalization extends Localization<DeployStrings> {
    protected override readonly translations: Readonly<
        Translation<DeployStrings>
    > = {
            en: {
                commandNotFound:
                    "I'm sorry, I cannot find any command with that name!",
                commandDeploySuccessful:
                    "Successfully registered command `%s`. Please wait for it to get updated in Discord.",
            },
        };
}
