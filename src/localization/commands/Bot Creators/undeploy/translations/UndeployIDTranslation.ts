import { Translation } from "@alice-localization/base/Translation";
import { UndeployStrings } from "../UndeployLocalization";

/**
 * The Indonesian translation for the `undeploy` command.
 */
export class UndeployIDTranslation extends Translation<UndeployStrings> {
    override readonly translations: UndeployStrings = {
        commandNotFound:
            "Maaf, aku tidak dapat menemukan perintah dengan nama tersebut!",
        commandUndeploySuccessful:
            "Berhasil menghapus registrasi perintah `%s`.",
    };
}
