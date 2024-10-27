import { Translation } from "@localization/base/Translation";
import { PingStrings } from "../PingLocalization";

/**
 * The Indonesian translation for the `ping` command.
 */
export class PingIDTranslation extends Translation<PingStrings> {
    override readonly translations: PingStrings = {
        pong: "Pong!",
        discordWs: "Soket Web Discord",
        droidServer: "Server osu!droid",
        elainaDb: "Basis Data Elaina",
        aliceDb: "Basis Data Alice",
    };
}
