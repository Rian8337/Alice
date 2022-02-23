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
        kr: {
            commandNotFound: "죄송해요, 그런 이름의 명령어는 못 찾겠어요!",
            commandDeploySuccessful:
                "성공적으로 %s 명령어를 등록했어요. 디스코드에서 업데이트 되기를 기다려 주세요.",
        },
        id: {
            commandNotFound:
                "Maaf, aku tidak dapat menemukan perintah dengan nama tersebut!",
            commandDeploySuccessful:
                "Berhasil meregistrasi perintah `%s`. Mohon tunggu agar perintahnya diperbarui di Discord.",
        },
    };
}
