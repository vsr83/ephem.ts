import {TimeStamp, TimeCorrelation, TimeConvention} from "./TimeCorrelation";
import {Nutation, NutationData} from "./Nutation";
import {Elp2000} from "./Elp2000-82b";
import {MathUtils} from "./MathUtils";
import {Frame, Frames, OsvFrame} from "./Frames";
import {Vsop87A} from "./Vsop87A";
import {Moon} from "./Moon";
import {Rotations} from "./Rotations";
import {Aberration} from "./Aberration";
import {SiderealTime} from "./SiderealTime";

export interface SolarEclipse 
{
    timeStampNewMoon : TimeStamp;
    timeStampMax : TimeStamp;
    type : string;
    sigma : number;
    beta_m : number; 
    gamma : number; 
}

export interface BesselianElements 
{
    a : number; 
    d : number;
    x : number; 
    y : number;
    sin_d : number;
    cos_d : number;
    mu : number; 
    l1 : number;
    l2 : number;
    tan_f1 : number; 
    tan_f2 : number;
    a_dot : number;
    d_dot : number;
    x_dot : number;
    y_dot : number;
    mu_dot : number;
    l1_dot : number;
    l2_dot : number;
}

export interface CentralLine 
{
    rho1     : number;
    rho2     : number;
    sin_d1   : number;
    cos_d1   : number; 
    sin_d1d2 : number; 
    cos_d1d2 : number; 
    xi       : number; 
    eta      : number; 
    zeta     : number
}

/**
 * Class for computation of Solar Eclipses.
 */
export class SolarEclipses 
{
    /**
     * Compute longitude rate of the Moon. This estimates the first-order
     * derivative.
     * 
     * @param {TimeStamp} timeStamp 
     *      Timestamp.
     * @param {number} stepSeconds 
     *      Step in seconds.
     */
    static moonLonRateNode(timeStamp : TimeStamp, stepSeconds : number) : number
    {
        const timeStampPlus : TimeStamp = TimeCorrelation.addDelta(timeStamp, stepSeconds / 86400);
        const posEcl : number[] = Elp2000.osvEclGeo(timeStamp).position;
        const posEcl2 : number[] = Elp2000.osvEclGeo(timeStampPlus).position;;

        return (MathUtils.atan2d(posEcl2[1], posEcl2[0]) -MathUtils.atan2d(posEcl[1], posEcl[0])) 
            / stepSeconds;
    }

    /**
     * Compute inclination of the Moon at a node.
     * 
     * @param {TimeStamp} timeStamp 
     *      Timestamp at a node.
     * @param {number} stepSeconds 
     *      Step in seconds.
     * @returns The inclination at the node.
     */
    static moonNodeInclination(timeStamp : TimeStamp, stepSeconds : number) : number
    {
        const timeStampPlus : TimeStamp = TimeCorrelation.addDelta(timeStamp, stepSeconds / 86400);
        const posEcl : number[] = Elp2000.osvEclGeo(timeStamp).position;
        const posEcl2 : number[] = Elp2000.osvEclGeo(timeStampPlus).position;;
        const rDiff : number[] = MathUtils.vecDiff(posEcl2, posEcl);

        return MathUtils.asind(rDiff[2] / MathUtils.norm(rDiff));
    }

    /**
     * Compute occurrence of Solar Eclipses.
     * 
     * @param {TimeCorrelation} timeCorr
     *      Time correlation.
     * @param {number} startYear 
     *      Start year.
     * @param {number} endYear
     *      End year. 
     * @returns {SolarEclipse[]} List of Solar Eclipses.
     */
    static solarEclipses(timeCorr : TimeCorrelation, startYear : number, endYear : number) : SolarEclipse[]
    {
        // This computation is based on the section 11.2 of
        // Urban, Seidelmann - Explanatory Supplement to the Astronomcal Almanac
        // 3rd Edition, 2012.

        // List of eclipses.
        const eclipseList : SolarEclipse[] = [];

        // Average light traveltime from the Sun to the Earth.
        const lightTimeJT = 1.495978707e8 / (3e5 * 86400.0);

        // Find all nodes of Moon's orbit during the period.
        const nodePassages : TimeStamp[] = Moon.moonNodePassages(timeCorr, startYear, endYear + 1);
        // Find all new Moons during the period.
        const newMoons : TimeStamp[] = Moon.moonNewList(timeCorr, startYear, endYear + 1);

        // Inclination at each node:
        const nodeInclinations : number[] = [];
        // Longitude rate at each node.
        const nodeLonRates : number[] = [];

        // Find index of the closest match;
        let findClosests = function(arrayIn : TimeStamp[], timeStamp : TimeStamp)
        {
            let distMax = 1e10;
            let value = Number.NaN;

            for (let indItem = 0; indItem < arrayIn.length; indItem++)
            {
                const item = arrayIn[indItem];
                const distNew = Math.abs(item.JTtdb - timeStamp.JTtdb);

                if (distNew < distMax)
                {
                    value = indItem;
                    distMax = distNew;
                }
            }

            return value;
        }

        // Compute inclinations and longitude rates at nodes:
        for (let timeStamp of nodePassages)
        {
            nodeInclinations.push(SolarEclipses.moonNodeInclination(timeStamp, 60));
            nodeLonRates.push(SolarEclipses.moonLonRateNode(timeStamp, 60));
        }

        for (let timeStamp of newMoons)
        {
            // Find the index and time of closest (w.r.t. time) node of Moon's orbit.
            const indClosest : number = findClosests(nodePassages, timeStamp);
            const JTclosests : TimeStamp = nodePassages[indClosest];

            const osvEcl : OsvFrame = Elp2000.osvEclGeo(timeStamp);
            // Angular distance of the Moon from the Ecliptic.
            const beta_m = MathUtils.asind(osvEcl.position[2] / MathUtils.norm(osvEcl.position));
            // Inclination of the Moon's orbit computed at the closest node.
            const incl = nodeInclinations[indClosest];

            // Compute the Ratio of longtudal motions of the Moon and 
            // the Sun (11.1): 
            const lonRate = nodeLonRates[indClosest];
            const lonRateSun = 360 / (365.256 * 86400.0);
            const lambda = lonRate / lonRateSun;

            // (11.6)
            const gamma = MathUtils.atand(lambda * MathUtils.tand(incl) 
                        / (Math.pow(lambda - 1, 2) 
                        + lambda * lambda * MathUtils.tand(incl) * MathUtils.tand(incl)));

            // Minimum angular distance between Moon and the Sun near the 
            // new Moon (11.7)
            const sigma = beta_m * (lambda - 1) 
                        / Math.sqrt(Math.pow(lambda - 1, 2) 
                        + lambda * lambda * MathUtils.tand(incl) * MathUtils.tand(incl));

            // Sun longitude dfference to the minimum distance between Moon 
            // and the Sun.
            const lonDiffMin = beta_m * MathUtils.tand(gamma);
            
            // Julian time at minimum distance.
            const JTmax = timeStamp.JTtdb - (1 / 86400) * lonDiffMin / lonRateSun;

            const timeStampMinus = TimeCorrelation.addDelta(timeStamp, -lightTimeJT);

            // Position of the Earth in Heliocentric Ecliptic Frame.
            // Used only for the computation of the distance to the Sun.
            const osvEarth : OsvFrame = Vsop87A.planetHeliocentric('earth', timeStampMinus);
            // Semidiameter of the Moon at new Moon:
            const semiMoon : number = MathUtils.atand(1737400.0 / MathUtils.norm(osvEcl.position));
            // Semidiameter of the Sun at new Moon:
            const semiSun : number = MathUtils.atand(696340000 / MathUtils.norm(osvEarth.position));
            // Horizontal parallax of the Moon at new Moon:
            const horiMoon : number = MathUtils.atand(6371000 / MathUtils.norm(osvEcl.position));
            // Horizontal parallax of the Sun at new Moon:
            const horiSun : number = MathUtils.atand(6371000 / MathUtils.norm(osvEarth.position));

            // Limit for partial Solar Eclipse (11.21):
            const partialLimit : number = semiSun + semiMoon + horiMoon - horiSun;
            // Limit for total/annular Solar Eclipse (11.23):
            const totalLimit : number = semiSun - semiMoon + horiMoon - horiSun;

            if (Math.abs(sigma) < partialLimit)
            {
                let eclipseType = "Partial";
                if (Math.abs(sigma) < totalLimit)
                {
                    if (semiSun < semiMoon)
                    {
                        eclipseType = "Total";
                    }
                    else 
                    {
                        eclipseType = "Annular";
                    }
                }

                let eclipseInfo : SolarEclipse = {
                    timeStampNewMoon : timeStamp,
                    timeStampMax : timeCorr.computeTimeStamp(JTmax, TimeConvention.TIME_TDB, false),
                    type : eclipseType, 
                    sigma : sigma,
                    beta_m : beta_m, 
                    gamma : gamma
                };

                eclipseList.push(eclipseInfo);
            }
        }

        return eclipseList;
    }

    /**
     * Convert coordinates from true-of-date (ToD) to the fundamental system.
     * 
     * @param {OsvFrame} osv
     *      Orbit state vector with fields r, v and JT in ToD frame.
     * @param {number} a 
     *      Geocentric equatorial right-ascension (degrees).
     * @param {number} d
     *      Geocentric equatorial declination (degrees).
     * 
     * @returns {OsvFrame} Orbit state vector in fundamental frame.
     */
    static coordTodFund(osv : OsvFrame, a : number, d : number) : OsvFrame
    {
        const rFund = Rotations.rotateCart1d(Rotations.rotateCart3d(osv.position, a + 90), 90 - d);
        // TODO: Additional term
        const vFund = Rotations.rotateCart1d(Rotations.rotateCart3d(osv.position, a + 90), 90 - d);

        return {
            frame : Frame.FRAME_FUND, 
            position : rFund, 
            velocity : vFund, 
            timeStamp : osv.timeStamp
        };
    }

    /**
     * Convert coordinates from the fundamental system to the true-of-date (ToD)
     * system.
     * 
     * @param {OsvFrame} osv
     *      Orbit state vector in the fundamental frame.
     * @param {number} a 
     *      Geocentric equatorial right-ascension (degrees).
     * @param {number} d
     *      Geocentric equatorial declination (degrees).
     * 
     * @returns {OsvFrame} Orbit state vector in ToD frame.
     */
    static coordFundTod(osv : OsvFrame, a : number, d : number) : OsvFrame
    {
        const rToD = Rotations.rotateCart3d(Rotations.rotateCart1d(osv.position, -(90 - d)), -(a + 90));
        // TODO: Additional term
        const vToD = Rotations.rotateCart3d(Rotations.rotateCart1d(osv.velocity, -(90 - d)), -(a + 90));

        return {
            frame : Frame.FRAME_TOD,
            position : rToD, 
            velocity : vToD, 
            timeStamp : osv.timeStamp
        };
    }

    /**
     * Compute Besselian elements for a Solar Eclipse.
     * 
     * @param {SolarEclipse} eclipse 
     *     The eclipse JSON.
     * @param {TimeStamp} timeStamp 
     *     Timestamp.
     * @param {NutationData} nutParams
     *     Nutation parameters.
     */
    static besselianSolar(eclipse : SolarEclipse, timeStamp : TimeStamp, 
        nutParams : NutationData) : BesselianElements
    {
        // Average light traveltime from the Sun to the Earth.

        let earthEcl = Vsop87A.planetHeliocentric('earth', timeStamp);
        const lightTimeJT = MathUtils.norm(earthEcl.position) / (3e8 * 86400.0);
        const timeStampMinus = TimeCorrelation.addDelta(timeStamp, -lightTimeJT);
        earthEcl = Vsop87A.planetHeliocentric('earth', timeStampMinus);

        const sunEcl : OsvFrame = {
            frame : Frame.FRAME_ECLGEO,
            position : MathUtils.vecMul(earthEcl.position, -1), 
            velocity : MathUtils.vecMul(earthEcl.position, -1), 
            timeStamp : timeStamp
        };
        let sunJ2000 = Frames.coordEclEq(sunEcl);
        sunJ2000 = Aberration.aberrationStellar(sunJ2000, earthEcl);

        //sunJ2000.r = aberrationStellarCart(JT, sunJ2000.r);
        const sunMoD = Frames.coordJ2000Mod(sunJ2000);
        const sunToD = Frames.coordModTod(sunMoD, nutParams);
        
        //let moonPosToD = moonPositionTod(JT);
        let moonPosEcl = Elp2000.osvEclGeo(timeStamp);
        const moonPosJ2000 = Frames.coordEclEq(moonPosEcl);
        const osvMoonMod = Frames.coordJ2000Mod(moonPosJ2000);
        const osvMoonTod = Frames.coordModTod(osvMoonMod, nutParams);
        const moonPosToD = osvMoonTod.position;

        // The direction vector from Sun to the Moon.
        let g = MathUtils.vecDiff(sunToD.position, moonPosToD);
        const gUnit = MathUtils.vecMul(g, 1/MathUtils.norm(g));
        //console.log(gUnit);

        const a = MathUtils.atan2d(gUnit[1], gUnit[0]);
        const d = MathUtils. asind(gUnit[2]);
        const gast = SiderealTime.timeGast(timeStamp.JTut1, timeStamp.JTtdb, nutParams);
        const mu = gast - a;

        const moonFund = SolarEclipses.coordTodFund(osvMoonTod, a, d);

        // Radius of the Sun.
        const ds = 696340e3;
        // Radius of the Moon.
        const dm = 1737400;
        // Radius of the Earth.
        const de = 6378137;

        const x = moonFund.position[0] / de;
        const y = moonFund.position[1] / de;
        const z = moonFund.position[2] / de;
        //console.log("Moon_fund = " + moonFund.r);

        const k = dm / de;
        const f1 = MathUtils.asind((ds + dm) / MathUtils.norm(g));
        const f2 = MathUtils.asind((ds - dm) / MathUtils.norm(g));
        const c1 = z + k / MathUtils.sind(f1);
        const c2 = z - k / MathUtils.sind(f2);
        const l1 = c1 * MathUtils.tand(f1);
        const l2 = c2 * MathUtils.tand(f2);

        /*console.log(vecMul(intersection, 1/6371000));
        console.log("tan f1 " + tand(f1));
        console.log("tan f2 " + tand(f2));
        console.log("l1 " + l1);
        console.log("l2 " + l2);
        console.log("mu " + mu);
        console.log("d " + d);*/

        const delta_m = MathUtils.asind(moonPosToD[2] / MathUtils.norm(moonPosToD));
        const alpha_m = MathUtils.atan2d(moonPosToD[1], moonPosToD[0]);

        return {
            a : a, 
            d : d,
            x : x, 
            y : y, 
            sin_d : MathUtils.sind(d),
            cos_d : MathUtils.cosd(d),
            mu : mu, 
            l1 : l1, 
            l2 : l2, 
            tan_f1 : MathUtils.tand(f1), 
            tan_f2 : MathUtils.tand(f2), 
            a_dot : 0,
            d_dot : 0,
            x_dot : 0,
            y_dot : 0,
            mu_dot : 0,
            l1_dot : 0,
            l2_dot : 0
        };
    }

    /**
     * Compute Besselian elements 
     * 
     * @param {*} eclipse
     *      Eclipse JSON. 
     * @param {TimeStamp} timeStamp 
     *      Julian time
     * @param {number} JTdelta 
     *      Delta-time used for the computation of the derivative.
     * @param {NutationData} nutParams
     *     Nutation parameters. Computed, if undefined.
     * @returns {BesselianElements} Besselian elements with time derivatives.
     */
    static besselianSolarWithDelta(eclipse : SolarEclipse, timeStamp : TimeStamp, 
        JTdelta : number, nutParams : NutationData) : BesselianElements
    {
        const timeStampDelta = TimeCorrelation.addDelta(timeStamp, JTdelta);

        const bessel0 = SolarEclipses.besselianSolar(eclipse, timeStamp, nutParams);
        const bessel1 = SolarEclipses.besselianSolar(eclipse, timeStampDelta, nutParams);

        bessel0.a_dot = (bessel1.a - bessel0.a) / JTdelta;
        bessel0.d_dot = (bessel1.d - bessel0.d) / JTdelta;
        bessel0.x_dot = (bessel1.x - bessel0.x) / JTdelta;
        bessel0.y_dot = (bessel1.y - bessel0.y) / JTdelta;
        bessel0.mu_dot = (bessel1.mu - bessel0.mu) / JTdelta;
        bessel0.l1_dot = (bessel1.l1 - bessel0.l1) / JTdelta;
        bessel0.l2_dot = (bessel1.l2 - bessel0.l2) / JTdelta;

        return bessel0;
    }

    /**
     * Compute point on a central line. The method will return zeta = NaN 
     * when the central line does not intersect the Earth. Note that this
     * implies zeta = NaN for all coordinates of a partial Eclipse.
     * 
     * @param {SolarEclipse} eclipse 
     *     The eclipse JSON.
     * @param {BesselianElements} bessel 
     *     The Besselian elements.
     * @returns {CentralLine} Central line.
     */
    static besselianCentralLine(eclipse : SolarEclipse, bessel : BesselianElements) : CentralLine
    {
        // (11.61) Auxiliary Besselian Elements and Summary.

        // Semi-major axis of the Earth ellipsoid.
        const a = 6378137;
        // Semi-minor axis of the Earth ellipsoid.
        const b = 6356752.3142;
        // Square of ellipticity (not flattening).
        const el2 = 1 - b*b/(a*a);
        const rho1 = Math.sqrt(1 - el2 * bessel.cos_d * bessel.cos_d);
        const rho2 = Math.sqrt(1 - el2 * bessel.cos_d * bessel.sin_d);
        const sin_d1 = bessel.sin_d / rho1;
        const cos_d1 = Math.sqrt(1 - el2) * bessel.cos_d / rho1;
        const sin_d1d2 = el2 * bessel.sin_d * bessel.cos_d / (rho1 * rho2);
        const cos_d1d2 = Math.sqrt(1 - el2) / (rho1 * rho2);

        // Coordinate conversions.
        const xi  = bessel.x;
        const eta = bessel.y;
        const eta1 = eta / rho1;
        const zeta1 = Math.sqrt(1 - xi*xi - eta1*eta1);
        const zeta = rho2 * (zeta1 * cos_d1d2 - eta1 * sin_d1d2);

        return {
            rho1 : rho1, rho2 : rho2, sin_d1 : sin_d1, cos_d1 : cos_d1, 
            sin_d1d2 : sin_d1d2, cos_d1d2 : cos_d1d2, xi : xi, eta : eta, zeta : zeta};
    }

}