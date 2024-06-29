import { Translation } from "@alice-localization/base/Translation";
import { FancyStrings } from "../FancyLocalization";

/**
 * The Indonesian translation of the `fancy` command.
 */
export class FancyIDTranslation extends Translation<FancyStrings> {
    override readonly translations: FancyStrings = {
        durationError: "Hei, mohon berikan durasi yang benar!",
        cannotRetrieveTatsuXP: "",
        tatsuXPRequirementNotMet: "",
        applicationMessageEmbedTitle: "",
        applicationMessageEmbedDescription: "",
        applicationMessageInitiateVote: "",
        applicationMessageRejectApplication: "",
        applicationFailed: "",
        applicationSent: "",
        lockProcessFailed:
            "Maaf, aku tidak dapat mengunci pengguna tersebut: %s.",
        unlockProcessFailed:
            "Maaf, aku tidak dapat membuka kunci pengguna tersebut: %s.",
        lockProcessSuccessful: "Berhasil mengunci pengguna.",
        unlockProcessSuccessful: "Berhasil membuka kunci pengguna.",
    };
}
