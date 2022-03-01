import { Translation } from "@alice-localization/base/Translation";
import { PingStrings } from "../PingLocalization";

/**
 * The Indonesian translation for the `ping` command.
 */
export class PingIDTranslation extends Translation<PingStrings> {
    override readonly translations: PingStrings = {
        pong: "",
        discordWs: "",
        droidServer: "",
        elainaDb: "",
        aliceDb: "",
    };
}
