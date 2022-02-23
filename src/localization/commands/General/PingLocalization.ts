import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PingStrings {
    readonly pong: string;
    readonly discordWs: string;
    readonly droidServer: string;
    readonly elainaDb: string;
    readonly aliceDb: string;
}

/**
 * Localizations for the `ping` command.
 */
export class PingLocalization extends Localization<PingStrings> {
    protected override readonly translations: Readonly<
        Translation<PingStrings>
    > = {
        en: {
            pong: "Pong!",
            discordWs: "Discord Websocket",
            droidServer: "osu!droid Server",
            elainaDb: "Elaina Database",
            aliceDb: "Alice Database",
        },
        kr: {
            pong: "Pong!",
            discordWs: "디스코드 웹소켓",
            droidServer: "osu!droid 서버",
            elainaDb: "Elaina 데이터베이스",
            aliceDb: "Alice 데이터베이스",
        },
        id: {
            pong: "",
            discordWs: "",
            droidServer: "",
            elainaDb: "",
            aliceDb: "",
        },
    };
}
