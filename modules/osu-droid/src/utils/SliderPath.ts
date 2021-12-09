import { PathType } from "../constants/PathType";
import { PathApproximator } from "../utils/PathApproximator";
import { Vector2 } from "../mathutil/Vector2";
import { Precision } from "./Precision";

/**
 * Represents a slider's path.
 */
export class SliderPath {
    /**
     * The path type of the slider.
     */
    readonly pathType: PathType;

    /**
     * The control points (anchor points) of the slider.
     */
    readonly controlPoints: Vector2[];

    /**
     * Distance that is expected when calculating slider path.
     */
    readonly expectedDistance: number;

    /**
     * Whether or not the instance has been initialized.
     */
    isInitialized: boolean = false;

    /**
     * The calculated path of the slider.
     */
    readonly calculatedPath: Vector2[] = [];

    /**
     * The cumulative length of the slider.
     */
    readonly cumulativeLength: number[] = [];

    constructor(values: {
        /**
         * The path type of the slider.
         */
        pathType: PathType;

        /**
         * The anchor points of the slider.
         */
        controlPoints: Vector2[];

        /**
         * The distance that is expected when calculating slider path.
         */
        expectedDistance: number;
    }) {
        this.pathType = values.pathType;
        this.controlPoints = values.controlPoints;
        this.expectedDistance = values.expectedDistance;

        this.ensureInitialized();
    }

    /**
     * Initializes the instance.
     */
    ensureInitialized(): void {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        this.calculatedPath.length = 0;
        this.cumulativeLength.length = 0;

        this.calculatePath();
        this.calculateCumulativeLength();
    }

    /**
     * Calculates the slider's path.
     */
    calculatePath(): void {
        this.calculatedPath.length = 0;

        let spanStart: number = 0;

        for (let i = 0; i < this.controlPoints.length; i++) {
            if (
                i === this.controlPoints.length - 1 ||
                this.controlPoints[i].equals(this.controlPoints[i + 1])
            ) {
                const spanEnd: number = i + 1;
                const cpSpan: Vector2[] = this.controlPoints.slice(
                    spanStart,
                    spanEnd
                );
                this.calculateSubPath(cpSpan).forEach((t) => {
                    if (
                        this.calculatedPath.length === 0 ||
                        !this.calculatedPath.at(-1)!.equals(t)
                    ) {
                        this.calculatedPath.push(t);
                    }
                });
                spanStart = spanEnd;
            }
        }
    }

    /**
     * Calculates the slider's subpath.
     */
    calculateSubPath(subControlPoints: Vector2[]): Vector2[] {
        switch (this.pathType) {
            case PathType.Linear:
                return PathApproximator.approximateLinear(subControlPoints);
            case PathType.PerfectCurve: {
                if (subControlPoints.length !== 3) {
                    break;
                }

                const subPath: Vector2[] =
                    PathApproximator.approximateCircularArc(subControlPoints);

                // If for some reason a circular arc could not be fit to the 3 given points, fall back to a numerically stable bezier approximation.
                if (subPath.length === 0) {
                    break;
                }

                return subPath;
            }
            case PathType.Catmull:
                return PathApproximator.approximateCatmull(subControlPoints);
        }

        return PathApproximator.approximateBezier(subControlPoints);
    }

    /**
     * Calculates the slider's cumulative length.
     */
    calculateCumulativeLength(): void {
        let calculatedLength: number = 0;
        this.cumulativeLength.length = 0;
        this.cumulativeLength.push(0);

        for (let i = 0; i < this.calculatedPath.length - 1; ++i) {
            const diff: Vector2 = this.calculatedPath[i + 1].subtract(
                this.calculatedPath[i]
            );
            calculatedLength += diff.length;
            this.cumulativeLength.push(calculatedLength);
        }

        if (calculatedLength !== this.expectedDistance) {
            // In osu-stable, if the last two control points of a slider are equal, extension is not performed.
            if (
                this.controlPoints.length >= 2 &&
                this.controlPoints.at(-1)!.equals(this.controlPoints.at(-2)!) &&
                this.expectedDistance > calculatedLength
            ) {
                this.cumulativeLength.push(calculatedLength);
                return;
            }

            // The last length is always incorrect
            this.cumulativeLength.pop();
            let pathEndIndex: number = this.calculatedPath.length - 1;

            if (calculatedLength > this.expectedDistance) {
                // The path will be shortened further, in which case we should trim any more unnecessary lengths and their associated path segments
                while (
                    this.cumulativeLength.length > 0 &&
                    this.cumulativeLength.at(-1)! >= this.expectedDistance
                ) {
                    this.cumulativeLength.pop();
                    this.calculatedPath.splice(pathEndIndex--, 1);
                }
            }

            if (pathEndIndex <= 0) {
                // The expected distance is negative or zero
                this.cumulativeLength.push(0);
                return;
            }

            // The direction of the segment to shorten or lengthen
            const dir: Vector2 = this.calculatedPath[pathEndIndex].subtract(
                this.calculatedPath[pathEndIndex - 1]
            );
            dir.normalize();

            this.calculatedPath[pathEndIndex] = this.calculatedPath[
                pathEndIndex - 1
            ].add(
                dir.scale(this.expectedDistance - this.cumulativeLength.at(-1)!)
            );
            this.cumulativeLength.push(this.expectedDistance);
        }
    }

    /**
     * Computes the position on the slider at a given progress that ranges from 0 (beginning of the path)
     * to 1 (end of the path).
     *
     * @param progress Ranges from 0 (beginning of the path) to 1 (end of the path).
     */
    positionAt(progress: number): Vector2 {
        this.ensureInitialized();

        const d: number = this.progressToDistance(progress);
        return this.interpolateVerticles(this.indexOfDistance(d), d);
    }

    /**
     * Returns the progress of reaching expected distance.
     */
    private progressToDistance(progress: number): number {
        return Math.min(Math.max(progress, 0), 1) * this.expectedDistance;
    }

    /**
     * Interpolates verticles of the slider.
     */
    private interpolateVerticles(i: number, d: number): Vector2 {
        if (this.calculatedPath.length === 0) {
            return new Vector2({ x: 0, y: 0 });
        }

        if (i <= 0) {
            return this.calculatedPath[0];
        }
        if (i >= this.calculatedPath.length) {
            return this.calculatedPath.at(-1)!;
        }

        const p0: Vector2 = this.calculatedPath[i - 1];
        const p1: Vector2 = this.calculatedPath[i];

        const d0: number = this.cumulativeLength[i - 1];
        const d1: number = this.cumulativeLength[i];

        // Avoid division by and almost-zero number in case two points are extremely close to each other.
        if (Precision.almostEqualsNumber(d0, d1)) {
            return p0;
        }

        const w: number = (d - d0) / (d1 - d0);
        return p0.add(p1.subtract(p0).scale(w));
    }

    /**
     * Returns the index of distance.
     */
    private indexOfDistance(d: number): number {
        const index: number = this.cumulativeLength.indexOf(d);

        if (index < 0) {
            for (let i: number = 0; i < this.cumulativeLength.length; ++i) {
                if (this.cumulativeLength[i] > d) {
                    return i;
                }
            }
            return this.cumulativeLength.length;
        }
        return index;
    }
}
