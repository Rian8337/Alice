import { Vector2 } from '../mathutil/Vector2';
import { Precision } from './Precision';

/**
 * Path approximator for sliders.
 */
export class PathApproximator {
    private readonly bezierTolerance: number = 0.25;
    private readonly catmullDetail: number = 50;
    private readonly circularArcTolerance: number = 0.1;

    /**
     * Approximates a bezier slider's path.
     * 
     * @param controlPoints The anchor points of the slider.
     */
    approximateBezier(controlPoints: Vector2[]): Vector2[] {
        const output: Vector2[] = [];
        const count: number = controlPoints.length;
        if (count === 0) {
            return output;
        }

        const subdivisionBuffer1: Vector2[] = [];
        const subdivisionBuffer2: Vector2[] = [];
        for (let i = 0; i < count; ++i) {
            subdivisionBuffer1.push(new Vector2({x: 0, y: 0}));
        }

        for (let i = 0; i < count * 2 - 1; ++i) {
            subdivisionBuffer2.push(new Vector2({x: 0, y: 0}));
        }

        const toFlatten: Vector2[][] = [];
        const freeBuffers: Vector2[][] = [];

        const deepCopy: Vector2[] = [];
        controlPoints.forEach(c => {
            deepCopy.push(new Vector2({x: c.x, y: c.y}));
        });

        toFlatten.push(deepCopy);

        const leftChild: Vector2[] = subdivisionBuffer2;

        while (toFlatten.length > 0) {
            const parent: Vector2[] = toFlatten.pop() as Vector2[];
            if (this.bezierIsFlatEnough(parent)) {
                this.bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, count);
                freeBuffers.push(parent);
                continue;
            }

            let rightChild: Vector2[] = [];
            if (freeBuffers.length > 0) {
                rightChild = freeBuffers.pop() as Vector2[];
            } else {
                for (let i = 0; i < count; ++i) {
                    rightChild.push(new Vector2({x: 0, y: 0}));
                }
            }

            this.bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, count);

            for (let i = 0; i < count; ++i) {
                parent[i] = leftChild[i];
            }

            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }

        output.push(controlPoints[count - 1]);
        return output;
    }

    /**
     * Approximates a catmull slider's path.
     * 
     * @param controlPoints The anchor points of the slider.
     */
    approximateCatmull(controlPoints: Vector2[]): Vector2[] {
        const result: Vector2[] = [];

        for (let i = 0; i < controlPoints.length - 1; ++i) {
            const v1: Vector2 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
            const v2: Vector2 = controlPoints[i];
            const v3: Vector2 = i < controlPoints.length - 1 ? controlPoints[i + 1] : v2.add(v2).subtract(v1);
            const v4: Vector2 = i < controlPoints.length - 2 ? controlPoints[i + 2] : v3.add(v3).subtract(v2);

            for (let c = 0; c < this.catmullDetail; ++c) {
                result.push(this.catmullFindPoint(v1, v2, v3, v4, c / this.catmullDetail));
                result.push(this.catmullFindPoint(v1, v2, v3, v4, (c + 1) / this.catmullDetail));
            }
        }

        return result;
    }

    /**
     * Approximates a slider's circular arc.
     * 
     * @param controlPoints The anchor points of the slider.
     */
    approximateCircularArc(controlPoints: Vector2[]): Vector2[] {
        const a: Vector2 = controlPoints[0];
        const b: Vector2 = controlPoints[1];
        const c: Vector2 = controlPoints[2];

        const aSq: number = Math.pow(b.subtract(c).getLength(), 2);
        const bSq: number = Math.pow(a.subtract(c).getLength(), 2);
        const cSq: number = Math.pow(a.subtract(b).getLength(), 2);

        if ([aSq, bSq, cSq].some(v => Precision.almostEqualsNumber(v, 0))) {
            return [];
        }

        const s: number = aSq * (bSq + cSq - aSq);
        const t: number = bSq * (aSq + cSq - bSq);
        const u: number = cSq * (aSq + bSq - cSq);
        const sum: number = s + t + u;

        if (Precision.almostEqualsNumber(sum, 0)) {
            return [];
        }

        const scaledVec: Vector2 = a.scale(s).add(b.scale(t)).add(c.scale(u))
        const center: Vector2 = scaledVec.divide(sum);
        const dA: Vector2 = a.subtract(center);
        const dC: Vector2 = c.subtract(center);

        const r: number = dA.getLength();

        const thetaStart: number = Math.atan2(dA.y, dA.x);
        let thetaEnd: number = Math.atan2(dC.y, dC.x);

        while (thetaEnd < thetaStart) {
            thetaEnd += 2 * Math.PI;
        }

        let dir: number = 1;
        let thetaRange: number = thetaEnd - thetaStart;

        let orthoAtoC: Vector2 = c.subtract(a);
        orthoAtoC = new Vector2({x: orthoAtoC.y, y: -orthoAtoC.x});
        if (orthoAtoC.dot(b.subtract(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }

        const amountPoints: number = 2 * r <= this.circularArcTolerance ? 2 : Math.max(2, Math.ceil(thetaRange / (2 * Math.acos(1 - this.circularArcTolerance / r))));

        const output: Vector2[] = [];

        for (let i = 0; i < amountPoints; ++i) {
            const fract: number = i / (amountPoints - 1);
            const theta: number = thetaStart + dir * fract * thetaRange;
            const o: Vector2 = new Vector2({x: Math.cos(theta), y: Math.sin(theta)}).scale(r);
            output.push(center.add(o));
        }

        return output;
    }

    /**
     * Approximates a linear slider's path.
     * 
     * @param controlPoints The anchor points of the slider.
     */
    approximateLinear(controlPoints: Vector2[]): Vector2[] {
        return controlPoints;
    }

    /**
     * Checks if a bezier slider is flat enough to be approximated.
     * 
     * @param controlPoints The anchor points of the slider.
     */
    private bezierIsFlatEnough(controlPoints: Vector2[]): boolean {
        for (let i = 1; i < controlPoints.length - 1; ++i) {
            let prev: Vector2 = controlPoints[i - 1];
            let current: Vector2 = controlPoints[i];
            let next: Vector2 = controlPoints[i + 1];

            prev = prev.subtract(current.scale(2)).add(next);

            if (Math.pow(prev.getLength(), 2) > Math.pow(this.bezierTolerance, 2) * 4) {
                return false;
            }
        }

        return true;
    }

    /**
     * Approximates a bezier slider's path.
     * 
     * @param controlPoints The anchor points of the slider.
     * @param output The array that contains the output.
     * @param subdivisionBuffer1 Parts of the slider for approximation.
     * @param subdivisionBuffer2 Parts of the slider for approximation.
     * @param count The amount of anchor points in the slider.
     */
    private bezierApproximate(controlPoints: Vector2[], output: Vector2[], subdivisionBuffer1: Vector2[], subdivisionBuffer2: Vector2[], count: number): void {
        const l: Vector2[] = subdivisionBuffer2;
        const r: Vector2[] = subdivisionBuffer1;

        this.bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

        for (let i = 0; i < count - 1; ++i) {
            l[count + i] = r[i + 1];
        }

        output.push(controlPoints[0]);

        for (let i = 1; i < count - 1; ++i) {
            const index: number = 2 * i;
            const p: Vector2 = (l[index - 1].add(l[index].scale(2)).add(l[index + 1])).scale(0.25);
            output.push(p);
        }
    }

    /**
     * Subdivide a bezier slider's control points.
     * 
     * @param controlPoints The anchor points of the slider.
     * @param l Parts of the slider for approximation.
     * @param r Parts of the slider for approximation.
     * @param subdivisionBuffer Parts of the slider for approximation.
     * @param count The amount of anchor points in the slider.
     */
    private bezierSubdivide(controlPoints: Vector2[], l: Vector2[], r: Vector2[], subdivisionBuffer: Vector2[], count: number): void {
        const midpoints: Vector2[] = subdivisionBuffer;

        for (let i = 0; i < count; ++i) {
            midpoints[i] = controlPoints[i];
        }

        for (let i = 0; i < count; ++i) {
            l[i] = midpoints[0];
            r[count - i - 1] = midpoints[count - i - 1];

            for (let j = 0; j < count - i - 1; ++j) {
                midpoints[j] = midpoints[j].add(midpoints[j + 1]).divide(2);
            }
        }
    }

    /**
     * Finds the point of a catmull slider.
     * 
     * @param vec1 The first anchor point.
     * @param vec2 The second anchor point.
     * @param vec3 The third anchor point.
     * @param vec4 The fourth anchor point.
     * @param t The accuracy at which to detect the point.
     */
    private catmullFindPoint(vec1: Vector2, vec2: Vector2, vec3: Vector2, vec4: Vector2, t: number): Vector2 {
        const t2: number = Math.pow(t, 2);
        const t3: number = Math.pow(t, 3);

        return new Vector2({
            x:  0.5 * (2 * vec2.x + (-vec1.x + vec3.x) * t + (2 * vec1.x - 5 * vec2.x + 4 * vec3.x - vec4.x) * t2 + (-vec1.x + 3 * vec2.x - 3 * vec3.x + vec4.x) * t3),
            y:  0.5 * (2 * vec2.y + (-vec1.y + vec3.y) * t + (2 * vec1.y - 5 * vec2.y + 4 * vec3.y - vec4.y) * t2 + (-vec1.y + 3 * vec2.y - 3 * vec3.y + vec4.y) * t3)
        });
    }
}