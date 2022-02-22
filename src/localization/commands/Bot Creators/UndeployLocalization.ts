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
        kr: {
            commandNotFound: "죄송해요, 그런 이름의 명령어는 못 찾겠어요!",
            commandUndeploySuccessful:
                "성공적으로 %s 명령어를 등록 해제했어요.",
        },
    };
}
