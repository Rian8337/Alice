import { Translation } from "@alice-localization/base/Translation";
import { DeployStrings } from "../DeployLocalization";

/**
 * The Indonesian translation for the `deploy` command.
 */
export class DeployIDTranslation extends Translation<DeployStrings> {
    override readonly translations: DeployStrings = {
        commandNotFound:
            "Maaf, aku tidak dapat menemukan perintah dengan nama tersebut!",
        commandDeploySuccessful:
            "Berhasil meregistrasi perintah `%s`. Mohon tunggu agar perintahnya diperbarui di Discord.",
    };
}
