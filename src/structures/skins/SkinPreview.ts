import { SkinPreviewType } from "@alice-enums/utils/SkinPreviewType";
import { SkinPreviewData } from "./SkinPreviewData";

/**
 * Represents a preview for a skin.
 */
export type SkinPreview = Partial<Record<SkinPreviewType, SkinPreviewData>>;
