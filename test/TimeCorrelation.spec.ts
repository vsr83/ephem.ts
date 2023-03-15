import { checkFloat, checkFloatArray} from './common';
import 'mocha';
import {Wgs84, EarthPosition} from '../src/Wgs84'
import { TimeCorrelation, TimeConvention } from '../src';
import { JulianTime } from '../src';

describe('TimeCorrelation', function() {
    describe('correlationUt1Tai', function() {
        it('conversions', function() {
            const timeCorr = new TimeCorrelation();

            const JD1899Ut1 = JulianTime.dateJulianYmd(1899, 1, 1);
            const JD2000Ut1 = JulianTime.dateJulianYmd(2000, 1, 1);
            const JD2020Ut1 = JulianTime.dateJulianYmd(2020, 1, 1);
            const JD2040Ut1 = JulianTime.dateJulianYmd(2040, 1, 1);
            const JD1899Tai = timeCorr.correlationUt1Tai(JD1899Ut1);
            const JD2000Tai = timeCorr.correlationUt1Tai(JD2000Ut1);
            const JD2020Tai = timeCorr.correlationUt1Tai(JD2020Ut1);
            const JD2040Tai = timeCorr.correlationUt1Tai(JD2040Ut1);
            const JD1899Tdb = timeCorr.correlationUt1Tdb(JD1899Ut1);
            const JD2000Tdb = timeCorr.correlationUt1Tdb(JD2000Ut1);
            const JD2020Tdb = timeCorr.correlationUt1Tdb(JD2020Ut1);
            const JD2040Tdb = timeCorr.correlationUt1Tdb(JD2040Ut1);
            const JD1899Ut1_2 = timeCorr.correlationTaiUt1(JD1899Tai);
            const JD2000Ut1_2 = timeCorr.correlationTaiUt1(JD2000Tai);
            const JD2020Ut1_2 = timeCorr.correlationTaiUt1(JD2020Tai);
            const JD2040Ut1_2 = timeCorr.correlationTaiUt1(JD2040Tai);
            const JD1899Ut1_3 = timeCorr.correlationTdbUt1(JD1899Tdb);
            const JD2000Ut1_3 = timeCorr.correlationTdbUt1(JD2000Tdb);
            const JD2020Ut1_3 = timeCorr.correlationTdbUt1(JD2020Tdb);
            const JD2040Ut1_3 = timeCorr.correlationTdbUt1(JD2040Tdb);

            checkFloat(JD1899Tai - JD1899Ut1, 0.0001433/86400, 1e-8);
            checkFloat(JD2000Tai - JD2000Ut1, 31.6432070/86400, 1e-8);
            checkFloat(JD2020Tai - JD2020Ut1, 37.177333/86400, 1e-8);
            checkFloat(JD2040Tai - JD2040Ut1, 37.0180883/86400, 1e-8);
            checkFloat(JD1899Tdb - JD1899Ut1, (32.184 + 0.0001433)/86400, 1e-8);
            checkFloat(JD2000Tdb - JD2000Ut1, (32.184 + 31.6432070)/86400, 1e-8);
            checkFloat(JD2020Tdb - JD2020Ut1, (32.184 + 37.177333)/86400, 1e-8);
            checkFloat(JD2040Tdb - JD2040Ut1, (32.184 + 37.0180883)/86400, 1e-8);
            checkFloat(JD1899Ut1_2, JD1899Ut1, 1e-10);
            checkFloat(JD2000Ut1_2, JD2000Ut1, 1e-10);
            checkFloat(JD2020Ut1_2, JD2020Ut1, 1e-10);
            checkFloat(JD2040Ut1_2, JD2040Ut1, 1e-10);
            checkFloat(JD1899Ut1_3, JD1899Ut1, 1e-10);
            checkFloat(JD2000Ut1_3, JD2000Ut1, 1e-10);
            checkFloat(JD2020Ut1_3, JD2020Ut1, 1e-10);
            checkFloat(JD2040Ut1_3, JD2040Ut1, 1e-10);

            const timeStamp2000_1 = timeCorr.computeTimeStamp(JD2000Tai, TimeConvention.TIME_TAI, false);
            const timeStamp2000_2 = timeCorr.computeTimeStamp(JD2000Tdb, TimeConvention.TIME_TDB, false);
            const timeStamp2000_3 = timeCorr.computeTimeStamp(JD2000Ut1, TimeConvention.TIME_UT1, false);
            checkFloat(timeStamp2000_1.JTtai, JD2000Tai, 1e-10);
            checkFloat(timeStamp2000_2.JTtai, JD2000Tai, 1e-10);
            checkFloat(timeStamp2000_3.JTtai, JD2000Tai, 1e-10);
            checkFloat(timeStamp2000_1.JTut1, JD2000Ut1, 1e-10);
            checkFloat(timeStamp2000_2.JTut1, JD2000Ut1, 1e-10);
            checkFloat(timeStamp2000_3.JTut1, JD2000Ut1, 1e-10);

            checkFloat(timeStamp2000_1.JTtdb, JD2000Tdb, 1e-10);
            checkFloat(timeStamp2000_2.JTtdb, JD2000Tdb, 1e-10);
            checkFloat(timeStamp2000_3.JTtdb, JD2000Tdb, 1e-10);
        });
    });    
});