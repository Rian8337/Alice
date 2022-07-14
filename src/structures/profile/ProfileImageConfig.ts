import { PartialProfileBackground } from "./PartialProfileBackground";

export interface ProfileImageConfig {
    /**
     * The badges that the user owns.
     */
    badges: PartialProfileBackground[];

    /**
     * The badges that are currently used by the user.
     */
    activeBadges: (PartialProfileBackground | null)[];

    /**
     * The profile backgrounds that the user owns.
     */
    backgrounds: PartialProfileBackground[];

    /**
     * The profile background that is currently active.
     */
    activeBackground: PartialProfileBackground;

    /**
     * The color of description box background.
     */
    bgColor: string;

    /**
     * The text color for description box.
     */
    textColor: string;
}
