import { PathType } from '../constants/PathType';
import { PathApproximator } from '../utils/PathApproximator';
import { Vector2 } from '../mathutil/Vector2';
import { Precision } from './Precision';

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
    readonly controlPoints: Vector2[] = [];

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

    /**
     * The path approximator of the slider.
     */
    readonly pathApproximator: PathApproximator = new PathApproximator();

    constructor(values: {
        /**
         * The path type of the slider.
         */
        pathType: PathType,

        /**
         * The anchor points of the slider.
         */
        controlPoints: Vector2[],

        /**
         * The distance that is expected when calculating slider path.
         */
        expectedDistance: number
    }) {
        this.pathType = values.pathType;
        this.controlPoints = values.controlPoints || [];
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

        let start: number = 0;
        let end: number = 0;

        for (let i = 0; i < this.controlPoints.length; i++) {
            ++end;
            if (
                i === this.controlPoints.length - 1 ||
                (this.controlPoints[i].x === this.controlPoints[i + 1].x && this.controlPoints[i].y === this.controlPoints[i + 1].y)
            ) {
                const cpSpan: Vector2[] = this.controlPoints.slice(start, end);
                this.calculateSubPath(cpSpan).forEach(t => {
                    if (
                        this.calculatedPath.length === 0 ||
                        this.calculatedPath[this.calculatedPath.length - 1].x !== t.x ||
                        this.calculatedPath[this.calculatedPath.length - 1].y !== t.y
                    ) {
                        this.calculatedPath.push(t);
                    }
                });
                start = end;
            }
        }
    }

    /**
     * Calculates the slider's subpath.
     */
    calculateSubPath(subControlPoints: Vector2[]): Vector2[] {
        switch (this.pathType) {
            case PathType.Linear:
                return this.pathApproximator.approximateLinear(subControlPoints);
            case PathType.PerfectCurve:
                if (this.controlPoints.length !== 3 || subControlPoints.length !== 3) {
                    break;
                }
                const subPath: Vector2[] = this.pathApproximator.approximateCircularArc(subControlPoints);
                // If for some reason a circular arc could not be fit to the 3 given points, fall back to a numerically stable bezier approximation.
                if (subPath.length === 0) {
                    break;
                }
                return subPath;
            case PathType.Catmull:
                return this.pathApproximator.approximateCatmull(subControlPoints);
        }

        return this.pathApproximator.approximateBezier(subControlPoints);
    }

    /**
     * Calculates the slider's cumulative length.
     */
    calculateCumulativeLength(): void {
        let calculatedLength: number = 0;
        this.cumulativeLength.length = 0;
        this.cumulativeLength.push(0);

        for (let i = 0; i < this.calculatedPath.length - 1; ++i) {
            const diff: Vector2 = this.calculatedPath[i + 1].subtract(this.calculatedPath[i]);
            calculatedLength += diff.length;
            this.cumulativeLength.push(calculatedLength);
        }

        if (calculatedLength !== this.expectedDistance) {
            // The last length is always incorrect
            this.cumulativeLength.pop();
            let pathEndIndex: number = this.calculatedPath.length - 1;

            if (calculatedLength > this.expectedDistance) {
                // The path will be shortened further, in which case we should trim any more unnecessary lengths and their associated path segments
                while (this.cumulativeLength.length > 0 && this.cumulativeLength[this.cumulativeLength.length - 1] >= this.expectedDistance) {
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
            const dir: Vector2 = this.calculatedPath[pathEndIndex].subtract(this.calculatedPath[pathEndIndex - 1]);
            dir.normalize();

            this.calculatedPath[pathEndIndex] = this.calculatedPath[pathEndIndex - 1].add(dir.scale(this.expectedDistance - this.cumulativeLength[this.cumulativeLength.length - 1]));
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
            return new Vector2({x: 0, y: 0});
        }

        if (i <= 0) {
            return this.calculatedPath[0];
        }
        if (i >= this.calculatedPath.length) {
            return this.calculatedPath[this.calculatedPath.length - 1];
        }

        const p0: Vector2 = this.calculatedPath[i - 1];
        const p1: Vector2 = this.calculatedPath[i];

        const d0: number = this.cumulativeLength[i - 1];
        const d1: number = this.cumulativeLength[i];

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
        let index: number = this.cumulativeLength.indexOf(d);

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