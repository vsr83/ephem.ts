import { checkFloat, checkFloatArray} from './common';
import 'mocha';
import {AssertionError, strict as assert} from 'assert';
import {Elp2000} from '../src';
import {MathUtils} from '../src';
import { horizons_data_moon_1900_2100 } from '../test/data/horizons_data_moon_1900_2100';
import {TimeStamp, TimeCorrelation, TimeConvention} from '../src';
import {OsvFrame} from '../src/Frames';

/**
 * Compute the position of the Moon for a sequence of Julian times and compute
 * errors to the given coordinates.
 * 
 * @param {number[][]} array 
 *      The expected array with rows in the format [JT, X, Y, Z].
 * @returns Object with maximum, minimum and average errors.
 */
function checkArrayElp2000(array : number[][])
{
    let maxError = 0;
    let avgError = 0;
    let minError = 1e10;

    const timeCorr : TimeCorrelation = new TimeCorrelation();

    for (let indValue = 0; indValue < array.length; indValue++)
    {
        const values = array[indValue];
        const JT = values[0];
        const timeStamp : TimeStamp = timeCorr.computeTimeStamp(JT, 
            TimeConvention.TIME_TDB, false);

        const moonOsv : OsvFrame = Elp2000.osvEclGeo(timeStamp);
        const computed = MathUtils.vecMul(moonOsv.position, 0.001);
        const expected = [values[1], values[2], values[3]];

        // Difference between the two coordinate vectors.
        const diff = [
            computed[0] - expected[0], 
            computed[1] - expected[1], 
            computed[2] - expected[2]
        ];

        const diffNorm = Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2]);
        avgError += diffNorm;
        if (diffNorm > maxError)
        {
            maxError = diffNorm;
        }
        if (diffNorm < minError)
        {
            minError = diffNorm;
        }
        //console.log(JT + " " + diffNorm);
    }

    avgError /= array.length;

    return {avgError : avgError, maxError : maxError, minError : minError};
}

describe('Elp2000-82b', function() {
    describe('elp2000', function() {
        // Compare to data from the Fortran reference implementation.
        it('ELP2000-82b Reference Implementation 1900-2100 monthly', function() {
            const errInfo = checkArrayElp2000(horizons_data_moon_1900_2100);
            // Max error below 250 m.
            assert.equal(errInfo.maxError < 0.25, true);
        });
    });
});
