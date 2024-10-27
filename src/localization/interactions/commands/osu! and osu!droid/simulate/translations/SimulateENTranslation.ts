import { Translation } from "@localization/base/Translation";
import { SimulateStrings } from "../SimulateLocalization";

/**
 * The English translation for the `simulate` command.
 */
export class SimulateENTranslation extends Translation<SimulateStrings> {
    override readonly translations: SimulateStrings = {
        noSimulateOptions:
            "I'm sorry, you did not specify any simulation options! You need to enter different mods or speed multiplier!",
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        playerNotFound:
            "I'm sorry, I cannot find the player that you are looking for!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
        noBeatmapProvided:
            "Hey, there is no beatmap being talked in this channel! Please provide a beatmap!",
        beatmapProvidedIsInvalid: "Hey, please provide a valid beatmap!",
        beatmapNotFound:
            "I'm sorry, I cannot find the beatmap that you are looking for!",
        selfScoreNotFound:
            "I'm sorry, you have not submitted any scores in the beatmap!",
        userScoreNotFound:
            "I'm sorry, this user has not submitted any scores in the beatmap!",
        simulatedPlayDisplay: "Simulated play for %s:",
    };
}
