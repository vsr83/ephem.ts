import { checkFloat, checkFloatArray} from './common';
import 'mocha';
import {AssertionError, strict as assert} from 'assert';
import {Vsop87A} from '../src';
import {MathUtils} from '../src';
import {JulianTime} from '../src';
import { horizons_data_planets_1900_2100 } from '../test/data/horizons_data_planets_1900_2100';
import {TimeStamp, TimeCorrelation, TimeConvention} from '../src';

describe('Vsop87A', function() {
    describe('Heliocentric', function() {
        let JT = JulianTime.dateJulianYmd(2022, 6, 4);

        it('JPL Horizons 1900-2100', function() {
            const objects = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
            // VSOP87 error should be less than 1 arcsecond for 2000 years around the epoch.
            const maxErrorExp : {[index : string] : number} = {
                'mercury' :  100.0, // arcsec    46e6 km * sind(1/3600) =   223 km
                'venus' :    100.0, // arcsec 107.5e6 km * sind(1/3600) =   521 km
                'earth' :    100.0, // arcsec 147.1e6 km * sind(1/3600) =   713 km
                'mars'  :    200.0, // arcsec 206.7e6 km * sind(1/3600) =  1002 km
                'jupiter' : 3591.0, // arcsec 740.6e6 km * sind(1/3600) =  3591 km
                'saturn' :  6582.0, // arcsec 1357.e6 km * sind(1/3600) =  6582 km 
                'uranus' : 20000.0, // arcsec 2733.e6 km * sind(1/3600) = 13253 km
                'neptune': 55000.0, // arcsec 4471.e6 km * sind(1/3600) = 21677 km
            }
            const maxErrorExpV = {
                'mercury' :  0.0001, // arcsec    46e6 km * sind(1/3600) =   223 km
                'venus' :    0.0001, // arcsec 107.5e6 km * sind(1/3600) =   521 km
                'earth' :    0.0001, // arcsec 147.1e6 km * sind(1/3600) =   713 km
                'mars'  :    0.0002, // arcsec 206.7e6 km * sind(1/3600) =  1002 km
                'jupiter' :  0.003, // arcsec 740.6e6 km * sind(1/3600) =  3591 km
                'saturn' :   0.003, // arcsec 1357.e6 km * sind(1/3600) =  6582 km 
                'uranus' :   0.003, // arcsec 2733.e6 km * sind(1/3600) = 13253 km
                'neptune':   0.003, // arcsec 4471.e6 km * sind(1/3600) = 21677 km
            }

            const timeCorr = new TimeCorrelation();

            for (let indObject = 0; indObject < objects.length; indObject++)
            {
                const objName = objects[indObject];
                let maxError = 0;
                let maxErrorV = 0;

                for (let indValue = 0; indValue < horizons_data_planets_1900_2100[objName].length; indValue++)
                {
                    const values = horizons_data_planets_1900_2100[objName][indValue];
                    const rExp = [values[1], values[2], values[3]];
                    const vExp = [values[4], values[5], values[6]];
                    const JT = values[0];

                    const timeStamp = timeCorr.computeTimeStamp(JT, TimeConvention.TIME_TDB, false);
                    const planetOsv = Vsop87A.planetHeliocentric(objName, timeStamp);

                    const r = MathUtils.vecMul(planetOsv.position, 0.001);
                    const v = MathUtils.vecMul(planetOsv.velocity, 0.001);

                    const diff = MathUtils.vecDiff(r, rExp);
                    const diffNorm = MathUtils.norm(diff);
                    const diffV = MathUtils.vecDiff(v, vExp);
                    const diffNormV = MathUtils.norm(diffV);
                    //console.log(objName + " " + r + " " + rExp + " " + diffNorm);
                    maxError  = Math.max(maxError, diffNorm);
                    maxErrorV = Math.max(maxErrorV, diffNormV);
                }
                //console.log(objName + " " + maxError + " " + maxErrorExp[objName] + " " + maxErrorV);
                assert.equal(maxError < maxErrorExp[objName], true);
            }
        });
    });
});

