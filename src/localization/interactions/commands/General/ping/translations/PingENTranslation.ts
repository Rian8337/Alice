import { Translation } from "@localization/base/Translation";
import { PingStrings } from "../PingLocalization";

/**
 * The English translation for the `ping` command.
 */
export class PingENTranslation extends Translation<PingStrings> {
    override readonly translations: PingStrings = {
        pong: "Pong!",
        discordWs: "Discord Websocket",
        droidServer: "osu!droid Server",
        elainaDb: "Elaina Database",
        aliceDb: "Alice Database",
    };
}
