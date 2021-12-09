import { BeatmapSection } from "./BeatmapSection";

/**
 * A section of a beatmap. This is used to detect dragged sections.
 */
export class ThreeFingerBeatmapSection extends BeatmapSection {
    /**
     * Whether or not this beatmap section is dragged.
     */
    isDragged: boolean;

    /**
     * The index of the cursor that is dragging this section.
     */
    dragFingerIndex: number;

    constructor(values: {
        firstObjectIndex: number;
        lastObjectIndex: number;
        isDragged: boolean;
        dragFingerIndex: number;
    }) {
        super(values.firstObjectIndex, values.lastObjectIndex);
        this.isDragged = values.isDragged;
        this.dragFingerIndex = values.dragFingerIndex;
    }
}
