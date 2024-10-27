import { Translation } from "@localization/base/Translation";
import { MapsearchStrings } from "../MapsearchLocalization";

/**
 * The English translation for the `mapsearch` command.
 */
export class MapsearchENTranslation extends Translation<MapsearchStrings> {
    override readonly translations: MapsearchStrings = {
        requestFailed:
            "I'm sorry, I couldn't fetch your beatmap search result from Sayobot!",
        noBeatmapsFound:
            "I'm sorry, your beatmap search doesn't return any beatmaps!",
        serviceProvider: "Service provided by Sayobot",
        beatmapsFound: "Beatmaps Found",
        download: "Download",
        lastUpdate: "Last Update",
    };
}
