import { Translation } from "@localization/base/Translation";
import { PingStrings } from "../PingLocalization";

/**
 * The Spanish translation for the `ping` command.
 */
export class PingESTranslation extends Translation<PingStrings> {
    override readonly translations: PingStrings = {
        pong: "Pong!",
        discordWs: "Discord Websocket",
        droidServer: "Servidor de osu!droid",
        elainaDb: "Base de datos de Elaina",
        aliceDb: "Base de datos de Alice",
    };
}
