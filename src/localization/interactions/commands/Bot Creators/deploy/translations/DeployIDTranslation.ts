import { Translation } from "@localization/base/Translation";
import { DeployStrings } from "../DeployLocalization";

/**
 * The Indonesian translation for the `deploy` command.
 */
export class DeployIDTranslation extends Translation<DeployStrings> {
    override readonly translations: DeployStrings = {
        commandNotFound:
            "Maaf, aku tidak dapat menemukan perintah dengan nama tersebut!",
        commandDeploySuccessful: "Berhasil meregistrasi perintah `%s`.",
    };
}
