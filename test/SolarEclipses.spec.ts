import { checkFloat, checkFloatArray} from './common';
import 'mocha';
import {Wgs84, EarthPosition} from '../src/Wgs84'
import {TimeCorrelation, TimeConvention} from '../src';
import {JulianTime} from '../src';
import {SolarEclipses, SolarEclipse} from '../src';
import {AssertionError, strict as assert} from 'assert';

describe('SolarEclipses', function() {
    describe('solarEclipses', function() {
        it('List of known Solar Eclipses', function() {
            let toFixed = function(num : number)
            {
                if (num < 10) {
                    return "0" + num;
                }
                else 
                {
                    return num;
                }
            }
            let toFixedFloat = function(num : number, fixed : number)
            {
                let str = "";
                if (num >= 0) {
                    str = str + " ";
                }
                if (Math.abs(num) < 100)
                {
                    str = str + " ";
                }
                if (Math.abs(num) < 10)
                {
                    str = str + " ";
                }
                str = str + num.toFixed(fixed);
                return str;
            }

            const JT = JulianTime.timeJulianTs(new Date("2022-05-15T23:53:20Z"));
            //console.log(JT);

            const expectedEclipses = [
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2001-06-21T12:04:46Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2001-12-14T20:53:01Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2002-06-10T23:45:22Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2002-12-04T07:32:16Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2003-05-31T04:09:22Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2003-11-23T22:50:22Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2004-04-19T13:35:05Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2004-10-14T03:00:23Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2005-04-08T20:36:51Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2005-10-03T10:32:47Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2006-03-29T10:12:23Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2006-09-22T11:41:16Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2007-03-19T02:32:57Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2007-09-11T12:32:24Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2008-02-07T03:56:10Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2008-08-01T10:22:12Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2009-01-26T07:59:45Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2009-07-22T02:36:25Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2010-01-15T07:07:39Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2010-07-11T19:34:38Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2011-01-04T08:51:42Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2011-06-01T21:17:18Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2011-07-01T08:39:30Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2011-11-25T06:21:34Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2012-05-20T23:53:54Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2012-11-13T22:12:55Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2013-05-10T00:26:20Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2013-11-03T12:47:36Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2014-04-29T06:04:33Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2014-10-23T21:45:39Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2015-03-20T09:46:47Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2015-09-13T06:55:19Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2016-03-09T01:58:19Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2016-09-01T09:08:02Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2017-02-26T14:54:33Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2017-08-21T18:26:40Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2018-02-15T20:52:33Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2018-07-13T03:02:16Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2018-08-11T09:47:28Z"))},
                {type : "Partial", JTmax : JulianTime.timeJulianTs(new Date("2019-01-06T01:42:38Z"))},
                {type : "Total",   JTmax : JulianTime.timeJulianTs(new Date("2019-07-02T19:24:08Z"))},
                {type : "Annular", JTmax : JulianTime.timeJulianTs(new Date("2019-12-26T05:18:53Z"))}
            ];

            const timeCorr : TimeCorrelation = new TimeCorrelation();
            const listEclipses = SolarEclipses.solarEclipses(timeCorr, 2001.1, 2019);
            
            for (let indEclipse = 0; indEclipse < listEclipses.length; indEclipse++)
            {
                const eclipse : SolarEclipse = listEclipses[indEclipse];
                //console.log(eclipse);
                const timeGreg = JulianTime.timeGregorian(eclipse.timeStampMax.JTutc);
                console.log("Computed : " + timeGreg.year + "-" + toFixed(timeGreg.month) + "-" + toFixed(timeGreg.mday) + 
                "T" + toFixed(timeGreg.hour) + ":" + toFixed(timeGreg.minute)
                + ":" + toFixed(Math.floor(timeGreg.second)) + " " + eclipse.type);

                const eclipseExp = expectedEclipses[indEclipse];
                //console.log(eclipse);

                const timeErr = 86400 * Math.abs(eclipse.timeStampMax.JTtdb - eclipseExp.JTmax);

                assert.equal(timeErr < 120.0, true);

                const timeGreg2 = JulianTime.timeGregorian(eclipseExp.JTmax);
                console.log("Expected : " + timeGreg2.year + "-" + toFixed(timeGreg2.month) + "-" + toFixed(timeGreg2.mday) + 
                "T" + toFixed(timeGreg2.hour) + ":" + toFixed(timeGreg2.minute)
                + ":" + toFixed(Math.floor(timeGreg2.second)) + " " + eclipseExp.type + " Error " + timeErr.toFixed(2) + " s");
            }            
        });
    });
});
