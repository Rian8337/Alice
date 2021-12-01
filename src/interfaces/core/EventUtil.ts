import { EventUtilToggleScope } from "@alice-types/core/EventUtilToggleScope";
import { Permission } from "@alice-types/core/Permission";
import { Event } from "./Event";

/**
 * Defines an event utility.
 */
export interface EventUtil extends Event {
    /**
     * Configurations for this event utility.
     */
    readonly config: {
        /**
         * The description of this event utility.
         */
        readonly description: string;

        /**
         * The permissions needed to toggle thi event utility.
         */
        readonly togglePermissions: Permission[];

        /**
         * The scopes at which this event utility can be disabled/enabled.
         */
        readonly toggleScope: EventUtilToggleScope[];

        /**
         * Whether this event utility will be enabled in debug mode.
         */
        readonly debugEnabled?: boolean;
    };
}
