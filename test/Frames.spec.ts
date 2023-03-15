import { checkFloat, checkFloatArray} from './common';
import 'mocha';
import {AssertionError, strict as assert} from 'assert';
import {MathUtils} from '../src';
import {TimeStamp, TimeCorrelation, TimeConvention} from '../src';
import {JulianTime} from '../src';
import {Frames, Frame, EnuAngles, OsvOutput, OsvFrame} from '../src/Frames';
import {Nutation, NutationData} from '../src/Nutation';
import { EarthPosition } from '../src/Wgs84';
import { nodeModuleNameResolver } from 'typescript';

const timeCorr : TimeCorrelation = new TimeCorrelation();

describe('Frames', function() {
    describe('coordEclEq, coordEqEcl', function() {
    });

    describe('coordJ2000Mod, coordModJ2000', function() {
        it('SOFA - iauPmat76', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2458849.5000000, 
                TimeConvention.TIME_TDB, false);
            const osvU1 : OsvFrame = {
                frame : Frame.FRAME_J2000, 
                position : [1, 0, 0], 
                velocity : [1, 0, 0], 
                timeStamp : timeStamp
            };
            const osvU2 : OsvFrame = {
                frame : Frame.FRAME_J2000, 
                position : [0, 1, 0], 
                velocity : [0, 1, 0], 
                timeStamp : timeStamp
            };
            const osvU3 : OsvFrame = {
                frame : Frame.FRAME_J2000, 
                position : [0, 0, 1], 
                velocity : [0, 0, 1], 
                timeStamp : timeStamp
            };

            const modU1 = Frames.coordJ2000Mod(osvU1);
            const modU2 = Frames.coordJ2000Mod(osvU2);
            const modU3 = Frames.coordJ2000Mod(osvU3);

            checkFloatArray(modU1.position, [0.999988111199653, 0.004472291295033, 0.001943211239994], 1e-12);
            checkFloatArray(modU2.position, [-0.004472291295323, 0.999989999245837, -0.000004345179820], 1e-12);
            checkFloatArray(modU3.position, [-0.001943211239326, -0.000004345478552, 0.999998111953816], 1e-12);
            assert.equal(modU1.frame, Frame.FRAME_MOD);
            assert.equal(modU2.frame, Frame.FRAME_MOD);
            assert.equal(modU3.frame, Frame.FRAME_MOD);
        });

        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_TDB, false);
            const osvJ2000 : OsvFrame = {
                frame : Frame.FRAME_J2000,
                position : [ 76539668614.71243,
                    -67916298380.10200,
                    -26095418302.98473],
                velocity : [2.472162821491882e+04,
                    6.481099018198909e+03,
                    8.328708368988578e+02],
                timeStamp : timeStamp
            };
            const osvModExp : OsvFrame = {
                frame : Frame.FRAME_MOD,
                position : [76932446023.74319,
                    -67534911860.58974,
                    -25929707721.04863
                  ],
                velocity : [2.468725514893796e+04,
                    6.603882768282808e+03,
                    8.862197838793985e+02],
                timeStamp : timeStamp
            };

            const osvMod = Frames.coordJ2000Mod(osvJ2000);
            checkFloatArray(osvMod.position, osvModExp.position, 1);
            checkFloatArray(osvMod.velocity, osvModExp.velocity, 1e-4);
            checkFloat(osvMod.timeStamp.JTtdb, osvModExp.timeStamp.JTtdb, 1e-16);
            assert.equal(osvMod.frame, Frame.FRAME_MOD);

            const osvJ20002 = Frames.coordModJ2000(osvMod);
            checkFloatArray(osvJ20002.position, osvJ2000.position, 1);
            checkFloatArray(osvJ20002.velocity, osvJ2000.velocity, 1e-4);
            checkFloat(osvJ20002.timeStamp.JTtdb, osvJ2000.timeStamp.JTtdb, 1e-6);
            assert.equal(osvJ20002.frame, Frame.FRAME_J2000);
        });
    });

    describe('coordModTod, coordTodMod', function() {
        it('SOFA - iauNutM80', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2458849.5000000, 
                TimeConvention.TIME_TDB, false);
            const osvU1 : OsvFrame = {
                frame : Frame.FRAME_TOD,
                position : [1, 0, 0], 
                velocity : [1, 0, 0], 
                timeStamp : timeStamp};
            const osvU2 : OsvFrame = {
                frame : Frame.FRAME_TOD,
                position : [0, 1, 0], 
                velocity : [0, 1, 0], 
                timeStamp : timeStamp
            };
            const osvU3 : OsvFrame = {
                frame : Frame.FRAME_TOD,
                position : [0, 0, 1], 
                velocity : [0, 0, 1], 
                timeStamp : timeStamp
            };
            const nutData : NutationData = Nutation.iau1980(timeStamp);

            const modU1 = Frames.coordModTod(osvU1, nutData);
            const modU2 = Frames.coordModTod(osvU2, nutData);
            const modU3 = Frames.coordModTod(osvU3, nutData);

            checkFloatArray(modU1.position, [0.999999996805767, -0.000073334097653, -0.000031789547170], 1e-14);
            checkFloatArray(modU2.position, [0.000073333834523, 0.999999997276809, -0.000008278356584], 1e-14);
            checkFloatArray(modU3.position, [0.000031790154169, 0.000008276025308, 0.999999999460447], 1e-14);
        });

        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_TDB, false);
            const nutData : NutationData = Nutation.iau1980(timeStamp);

            const osvMod : OsvFrame = {
                frame : Frame.FRAME_MOD,
                position : [76932446023.74319,
                    -67534911860.58974,
                    -25929707721.04863
                  ],
                velocity : [2.468725514893796e+04,
                    6.603882768282808e+03,
                    8.862197838793985e+02],
                timeStamp : timeStamp
            };
            const osvTodExp : OsvFrame = {
                frame : Frame.FRAME_TOD,
                position : [ 76927508947.49406,
                     -67539009327.52528,
                     -25933682729.27057],
                velocity : [2.468769303715834e+04,
                     6.602310869956531e+03,
                     8.857333632777005e+02],
                timeStamp : timeStamp
            };

            const osvTod = Frames.coordModTod(osvMod, nutData);
            checkFloatArray(osvTod.position, osvTodExp.position, 1);
            checkFloatArray(osvTod.velocity, osvTodExp.velocity, 1e-4);
            checkFloat(osvTod.timeStamp.JTtdb, osvTodExp.timeStamp.JTtdb, 1e-6);
            assert.equal(osvTod.frame, Frame.FRAME_TOD);

            const osvMod2 = Frames.coordTodMod(osvTod, nutData);
            checkFloatArray(osvMod2.position, osvMod.position, 1);
            checkFloatArray(osvMod2.velocity, osvMod.velocity, 1e-4);
            checkFloat(osvMod2.timeStamp.JTtdb, osvMod.timeStamp.JTtdb, 1e-6);
            assert.equal(osvMod2.frame, Frame.FRAME_MOD);
        });
    });

    describe('coordTodPef, coordPefTod', function() {
        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_UT1, false);
            const nutData : NutationData = Nutation.iau1980(timeStamp);

            const osvTod : OsvFrame = {
                frame : Frame.FRAME_TOD,
                position : [ 76927508947.49406,
                     -67539009327.52528,
                     -25933682729.27057],
                velocity : [2.468769303715834e+04,
                     6.602310869956531e+03,
                     8.857333632777005e+02],
                timeStamp : timeStamp
            };
            const osvPefExp : OsvFrame = {
                frame : Frame.FRAME_PEF,
                position : [-87793943599.69176,
                      52645824915.41444,
                     -25933682729.27057
                  ],
                velocity : [3.815891418527184e+06,
                     6.391112794089540e+06,
                     8.857333632777005e+02],
                timeStamp : timeStamp
            };
        });
    });

    describe('coordPefEfi, coordEfiPef', function() {
        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_TDB, false);
            const nutData : NutationData = Nutation.iau1980(timeStamp);

        });
    });

    describe('coordEfiEnu, coordEnuEfi', function() {
        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_TDB, false);
            const nutData : NutationData = Nutation.iau1980(timeStamp);
            
            const osvEfi : OsvFrame = {
                frame : Frame.FRAME_EFI,
                position : [-87838751662.35324,
                      52736029625.35403,
                     -25596488029.92342],
                velocity : [3.815926089266752e+06,
                    6.391070765456880e+06,
                    1.653485602488094e+04],
                timeStamp : timeStamp
            };
            const lat = 60.205490;
            const lon = 24.0206;
            const h = 0.0;

            const obsPos : EarthPosition = {
                lat : lat, 
                lon : lon,
                h : h
            }

            const osvEnuExp : OsvFrame = {
                frame : Frame.FRAME_ENU,
                position : [ 83925132910.53931,
                      38278260514.84691,
                     -51419041065.68192],
                velocity : [ 4284268.453380695,
                     -5274201.499041729,
                      3038946.069965863],
                timeStamp : timeStamp
            };

            const osvEnu = Frames.coordEfiEnu(osvEfi, obsPos);
            checkFloatArray(osvEnu.position, osvEnuExp.position, 1);
            checkFloatArray(osvEnu.velocity, osvEnuExp.velocity, 1e-4);
            checkFloat(osvEnu.timeStamp.JTtdb, osvEnuExp.timeStamp.JTtdb, 1e-6);
            assert.equal(osvEnu.frame, Frame.FRAME_ENU);

            const osvEfi2 = Frames.coordEnuEfi(osvEnu, obsPos);
            checkFloatArray(osvEfi2.position, osvEfi.position, 1);
            checkFloatArray(osvEfi2.velocity, osvEfi.velocity, 1e-4);
            checkFloat(osvEfi2.timeStamp.JTtdb, osvEfi.timeStamp.JTtdb, 1e-6);
            assert.equal(osvEfi2.frame, Frame.FRAME_EFI);
        });
    });

    describe('coordEnuAzEl, coordAzElEnu', function() {
        it('Venus', function() {
            const timeStamp : TimeStamp = timeCorr.computeTimeStamp(2459662.467361111, 
                TimeConvention.TIME_TDB, false);
            const nutData : NutationData = Nutation.iau1980(timeStamp);
            
            const osvEnu : OsvFrame= {
                frame : Frame.FRAME_ENU,
                position : [ 83925132910.53931,
                      38278260514.84691,
                     -51419041065.68192],
                velocity : [ 4284268.453380695,
                     -5274201.499041729,
                      3038946.069965863],
                timeStamp : timeStamp
            };
            const azExp = 65.48226691416835;
            const elExp = -29.13678780543464;
            const anglesExp : EnuAngles = {
                az : azExp, 
                el : elExp,
                dazdt : 0,
                deldt : 0,
                dist : MathUtils.norm(osvEnu.position)
            };

            const angles = Frames.coordEnuAzEl(osvEnu);
            checkFloat(angles.az, anglesExp.az, 1e-6);
            checkFloat(angles.el, anglesExp.el, 1e-6);
            checkFloat(angles.dist, anglesExp.dist, 1);

            const osvEnu2 = Frames.coordAzElEnu(angles, timeStamp);
            checkFloatArray(osvEnu2.position, osvEnu.position, 1);
            checkFloat(osvEnu2.timeStamp.JTtdb, osvEnu.timeStamp.JTtdb, 1e-6);
        });
    });

    /*describe('coordPerIne, coordInePer', function() {
        it('Venus', function() {
            const osvPer = {
                r : [2.593281124802490e+10,
                     1.468514157356373e+11,
                                         0],
                v : [-2.933489929039629e+04,
                      5.677830279125575e+03,
                                          0],
                JT : 2459662.467361111
            };

            const Omega = 347.6140484010017;
            const incl = 359.9971073661852;
            const omega = -244.6045207975887;
            
            const osvIneExp = {
                r : [-1.489199431961666e+11,
                     -7.790989491059203e+09,
                      1.996839980819461e+06],
                v : [1.071574068660730e+03,
                    -2.986010381659133e+04,
                     1.460825013954209e+00],
                JT : 2459662.467361111
            };

            const osvIne = coordPerIne(osvPer, Omega, incl, omega);
            checkFloatArray(osvIne.r, osvIneExp.r, 1);
            checkFloatArray(osvIne.v, osvIneExp.v, 1e-4);
            checkFloat(osvIne.JT, osvIneExp.JT, 1e-6);

            const osvPer2 = coordInePer(osvIne, Omega, incl, omega);
            checkFloatArray(osvPer2.r, osvPer.r, 1);
            checkFloatArray(osvPer2.v, osvPer.v, 1e-4);
            checkFloat(osvPer2.JT, osvPer.JT, 1e-6);
        });
    });*/
});
