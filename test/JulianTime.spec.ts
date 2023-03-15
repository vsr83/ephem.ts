import {checkFloat, checkFloatArray} from './common';
import 'mocha';
import {JulianTime} from '../src';

describe('JulianTime', function() {
    describe('dateJulianYmd', function() {
        it('Values from 2020', function() {
            checkFloat(JulianTime.dateJulianYmd(2000, 1, 1),  2451544.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 1, 15), 2451558.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 2, 1),  2451575.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 2, 15), 2451589.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 3, 1),  2451604.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 3, 15), 2451618.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 4, 1),  2451635.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 4, 15), 2451649.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 5, 1),  2451665.5, 1e-9);
            checkFloat(JulianTime.dateJulianYmd(2000, 5, 15), 2451679.5, 1e-9);
        });
    });

    describe('timeGregorian', function() {
        it('2022-05-15 23:53:20', function() {
            const JT = JulianTime.timeJulianYmdhms(2022, 5, 15, 23, 53, 20);
            const JD = JulianTime.dateJulianYmd(2022, 5, 15);
            const tGreg = JulianTime.timeGregorian(JT);
            const tGregJD = JulianTime.timeGregorian(JD);
            checkFloat(tGreg.year, 2022, 1e-5);
            checkFloat(tGreg.month, 5, 1e-5);
            checkFloat(tGreg.mday, 15, 1e-5);
            checkFloat(tGreg.hour, 23, 1e-5);
            checkFloat(tGreg.minute, 53, 1e-5);
            checkFloat(tGreg.second, 20, 1e-4);

            checkFloat(tGregJD.year, 2022, 1e-5);
            checkFloat(tGregJD.month, 5, 1e-5);
            checkFloat(tGregJD.mday, 15, 1e-5);
            checkFloat(tGregJD.hour, 0, 1e-5);
            checkFloat(tGregJD.minute, 0, 1e-5);
            checkFloat(tGregJD.second, 0, 1e-4);
        });
        
        it('2022-05-15 00:00:00', function() {
            const JT = JulianTime.timeJulianYmdhms(2022, 5, 15, 0, 0, 0);
            const JD = JulianTime.dateJulianYmd(2022, 5, 15);
            const tGreg = JulianTime.timeGregorian(JT);
            const tGregJD = JulianTime.timeGregorian(JD);
            checkFloat(tGreg.year, 2022, 1e-5);
            checkFloat(tGreg.month, 5, 1e-5);
            checkFloat(tGreg.mday, 15, 1e-5);
            checkFloat(tGreg.hour, 0, 1e-5);
            checkFloat(tGreg.minute, 0, 1e-5);
            checkFloat(tGreg.second, 0, 1e-4);

            checkFloat(tGregJD.year, 2022, 1e-5);
            checkFloat(tGregJD.month, 5, 1e-5);
            checkFloat(tGregJD.mday, 15, 1e-5);
            checkFloat(tGregJD.hour, 0, 1e-5);
            checkFloat(tGregJD.minute, 0, 1e-5);
            checkFloat(tGregJD.second, 0, 1e-4);
        });
    });

    describe('timeJulianYmdhms', function() {
        it('2022-05-15 23:53:20', function() {
            const JT = JulianTime.timeJulianYmdhms(2022, 5, 15, 23, 53, 20);
            checkFloat(JT, 2459715.49537, 1e-6);
        });
    });

    describe('timeJulianTs', function() {
        it('2022-05-15 23:53:20', function() {
            const JT = JulianTime.timeJulianTs(new Date("2022-05-15T23:53:20Z"));
            checkFloat(JT, 2459715.49537, 1e-6);
        });
    });
});