import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UndeployStrings {
    readonly commandNotFound: string;
    readonly commandUndeploySuccessful: string;
}

/**
 * Localizations for the `undeploy` command.
 */
export class UndeployLocalization extends Localization<UndeployStrings> {
    protected override readonly translations: Readonly<
        Translation<UndeployStrings>
    > = {
            en: {
                commandNotFound:
                    "I'm sorry, I cannot find any command with that name!",
                commandUndeploySuccessful:
                    "Successfully unregistered `%s` command.",
            },
        };
}
