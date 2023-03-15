import {Angles} from './Angles';
import {MathUtils} from './MathUtils';
import {Elp2000} from './Elp2000-82b';
import {TimeCorrelation, TimeConvention, TimeStamp} from './TimeCorrelation';
import {Vsop87A} from './Vsop87A';

/**
 * Static methods for computation of new moons and node passages.
 */
export class Moon
{
    /**
     * Compute a list of time for passage of the Moon through the Ecliptic 
     * Plane.
     * 
     * @param {number} yearStart 
     *      Start year.
     * @param {number} yearEnd
     *      End year. 
     * @returns {TimeStamp[]} Time stamp for each passage.
     */
    static moonNodePassages(timeCorr : TimeCorrelation, yearStart : number, 
        yearEnd : number) : TimeStamp[]
    {
        // List of Julian times.
        const listTimestamps : TimeStamp[] = [];
        // The algorithm follows Meeus - Astronomical Algorithms Ch. 51
        // to obtain the initial position for each individual value of k.

        const kStart = Math.floor((yearStart - 2000.05) * 13.4223);
        const kEnd   = Math.ceil((yearEnd - 2000.05) * 13.4223);

        for (let k = kStart; k < kEnd ; k++)
        {
            // Ascending node.
            listTimestamps.push(this.moonNodePassage(timeCorr, k));
            // Descending node.
            listTimestamps.push(this.moonNodePassage(timeCorr, k + 0.5));
        }

        // Fine tune positions assuming constant velocity of the Moon:
        for (let indList = 0; indList < listTimestamps.length; indList++)
        {
            const timeStampInitial = listTimestamps[indList];
            const timeStampMinute  = TimeCorrelation.addDelta(listTimestamps[indList], 1/(24*60));

            const posMoonInitial = Elp2000.osvEclGeo(timeStampInitial).position;
            const posMoonMinute  = Elp2000.osvEclGeo(timeStampMinute).position;
            const diffZ = posMoonMinute[2] - posMoonInitial[2];
            const numMinutes = -posMoonInitial[2] / diffZ;
            listTimestamps[indList] = TimeCorrelation.addDelta(timeStampInitial, 
                numMinutes / (24 * 60));
        }

        return listTimestamps;
    }

    /**
     * Compute a list of times for new Moon.
     * 
     * @param {number} yearStart 
     *      Start year.
     * @param {number} yearEnd
     *      End year. 
     * @returns {TimeStamp[]} List of timestamps for new Moons.
     */
    static moonNewList(timeCorr : TimeCorrelation, yearStart : number, yearEnd : number) : TimeStamp[]
    {
        const kStart = Math.floor((yearStart - 2000) * 12.3685);
        const kEnd = Math.ceil((yearEnd - 2000) * 12.3685);
        const listTimestamps : TimeStamp[] = [];

        // Approximate light travel time from the Sun to the Earth.
        const lightTimeJT = 1.495978707e9 / (3e6 * 86400.0);

        for (let k = kStart; k < kEnd; k++)
        {
            const timeStampInitial = this.moonNew(timeCorr, k);

            // Update initial estimate assuming linear increase in longitude
            // of the Sun and the Moon until the more accurate New Moon:
            const timeStampMinute = TimeCorrelation.addDelta(timeStampInitial, 1/(24*60));

            const posStart = Elp2000.osvEclGeo(timeStampInitial).position;
            const posMinute  = Elp2000.osvEclGeo(timeStampMinute).position;
            const osvStart = Vsop87A.planetHeliocentric("earth", 
                TimeCorrelation.addDelta(timeStampInitial, -lightTimeJT));
            const osvMinute = Vsop87A.planetHeliocentric("earth", 
                TimeCorrelation.addDelta(timeStampMinute, - lightTimeJT));
            const sunStart = MathUtils.vecMul(osvStart.position, -1);
            const sunMinute = MathUtils.vecMul(osvMinute.position, -1);

            const lonSunStart = MathUtils.atan2d(sunStart[1], sunStart[0]);
            const lonSunMinute = MathUtils.atan2d(sunMinute[1], sunMinute[0]);
            const lonMoonStart = MathUtils.atan2d(posStart[1], posStart[0]);
            const lonMoonMinute = MathUtils.atan2d(posMinute[1], posMinute[0]);

            const diffSun = Angles.angleDiff(lonSunMinute, lonSunStart);
            const diffMoon = Angles.angleDiff(lonMoonMinute, lonMoonStart);
            const numMin = Angles.angleDiff(lonSunStart, lonMoonStart) 
                / (diffMoon - diffSun);

            const timeStampNew = TimeCorrelation.addDelta(timeStampInitial, 
                numMin / (24*60));

            listTimestamps.push(timeStampNew);
        }

        return listTimestamps;
    }

    /**
     * Compute new moon time for integer k.
     * 
     * @param {TimeCorrelation} timeCorr
     *      Time correlation.
     * @param {number} k 
     *      Integer k as defined in Chapter 49 of Meeus.
     * @returns {TimeStamp} Timestamp for the new Moon.
     */
    static moonNew(timeCorr : TimeCorrelation, k : number) : TimeStamp
    {
        // Meeus - Astronomical Algorithms Ch 49.
        let T = k/1236.85;
        let JDE = 2451550.09766 + 29.530588861*k;

        const T2 = T*T;
        const T3 = T2*T;
        const T4 = T3*T;

        JDE += 0.00015437*T2 - 0.000000150*T3 + 0.00000000073*T4;
        const M = 2.5534 + 29.10535670 * k - 0.0000014*T2 - 0.00000011*T3;
        const Mdot = 201.5643 + 385.81693528*k + 0.0107582*T2 + 0.00001238*T3 - 0.000000058*T4;
        const F = 160.7108 + 390.67050284*k - 0.0016118*T2 - 0.00000227*T3 + 0.000000011*T4;
        const Omega = 124.7746 - 1.56375588*k + 0.0020672*T2 + 0.00000215*T3;

        const A1 = 299.77 + 0.107408*k - 0.009173*T2;
        const A2 = 251.88 + 0.016321*k;
        const A3 = 251.83 + 26.651886*k;
        const A4 = 349.42 + 36.412478*k; 
        const A5 = 84.66 + 18.206239*k;
        const A6 = 141.74 + 53.303771*k;
        const A7 = 207.14 + 2.453732*k;
        const A8 = 154.84 + 7.306860*k;
        const A9 = 34.52 + 27.261239*k;
        const A10 = 207.19 + 0.121824*k;
        const A11 = 291.34 + 1.844379*k;
        const A12 = 161.72 + 24.198154*k;
        const A13 = 239.56 + 25.513099*k;
        const A14 = 331.55 + 3.592518*k;

        const E = 1.0 - 0.002516 * T - 0.0000074 * T*T;
        const JDEcorr1 = -0.40720 * MathUtils.sind(Mdot)
            +0.17241 * E * MathUtils.sind(M)
            + 0.01608 * MathUtils.sind(2*Mdot)
            + 0.01039 * MathUtils.sind(2*F)
            + 0.00739 * E * MathUtils.sind(Mdot - M)
            - 0.00514 * E * MathUtils.sind(Mdot + M)
            + 0.00208 * E*E * MathUtils.sind(2*M)
            - 0.00111 * MathUtils.sind(Mdot - 2*F)
            - 0.00057 * MathUtils.sind(Mdot + 2*F)
            + 0.00056 * E * MathUtils.sind(2*Mdot + M)
            - 0.00042 * MathUtils.sind(3*Mdot)
            + 0.00042 * E * MathUtils.sind(M + 2*F)
            + 0.00038 * E * MathUtils.sind(M - 2*F)
            - 0.00024 * E * MathUtils.sind(2*Mdot - M)
            - 0.00017 * MathUtils.sind(Omega)
            - 0.00007 * MathUtils.sind(Mdot + 2*M)
            + 0.00004 * MathUtils.sind(2*Mdot - 2*F)
            + 0.00004 * MathUtils.sind(3*M)
            + 0.00003 * MathUtils.sind(Mdot + M - 2*F)
            + 0.00003 * MathUtils.sind(2*Mdot + 2*F)
            - 0.00003 * MathUtils.sind(Mdot + M + 2*F)
            + 0.00003 * MathUtils.sind(Mdot - M + 2*F)
            - 0.00002 * MathUtils.sind(Mdot - M - 2*F)
            - 0.00002 * MathUtils.sind(3*Mdot + M)
            + 0.00002 * MathUtils.sind(4*Mdot);

        const JDEcorr2 = 0.000325 * MathUtils.sind(A1) 
                    + 0.000165 * MathUtils.sind(A2)
                    + 0.000164 * MathUtils.sind(A3)
                    + 0.000126 * MathUtils.sind(A4)
                    + 0.000110 * MathUtils.sind(A5)
                    + 0.000062 * MathUtils.sind(A6)
                    + 0.000060 * MathUtils.sind(A7)
                    + 0.000056 * MathUtils.sind(A8)
                    + 0.000047 * MathUtils.sind(A9)
                    + 0.000042 * MathUtils.sind(A10)
                    + 0.000040 * MathUtils.sind(A11)
                    + 0.000037 * MathUtils.sind(A12)
                    + 0.000035 * MathUtils.sind(A13)
                    + 0.000023 * MathUtils.sind(A14);                   

        JDE += JDEcorr1 + JDEcorr2;
        return timeCorr.computeTimeStamp(JDE, TimeConvention.TIME_TDB, false);
    }

    /**
     * Compute time of passage of the Moon through the node.
     * 
     * @param {TimeCorrelation} timeCorr
     *      Time correlation.
     * @param {number} k 
     *      Variable k in Meeus - Astronomical Algorithms Ch. 51
     * @returns {TimeStamp} Timestamp for the passage of the Moon through the node.
     */
    static moonNodePassage(timeCorr : TimeCorrelation, k : number) : TimeStamp
    {
        const T = k / 1342.23;
        const T2 = T*T;
        const T3 = T2*T;
        const T4 = T3*T;
        const D = 183.6380 + 331.73735682*k + 0.0014852*T2 + 0.00000209*T3 - 0.00000001 * T4;
        const M = 17.4006 + 26.82037250*k + 0.0001186*T2 + 0.00000006*T3;
        const Mdot = 38.3776 + 355.52747313*k + 0.0123499*T2 + 0.000014627*T3 - 0.000000069*T4;
        const Omega = 123.9767 - 1.44098956*k + 0.0020608*T2 + 0.00000214*T3  - 0.000000016*T4;
        const V = 299.75 + 132.85*T - 0.009173*T2;
        const P = Omega + 272.75 - 2.3 * T;

        const JDE = 2451565.1619 + 27.212220817*k
                + 0.0002762*T2 + 0.000000021*T3 - 0.000000000088*T4
                - 0.4721 * MathUtils.sind(Mdot)
                - 0.1649 * MathUtils.sind(2*D)
                - 0.0868 * MathUtils.sind(2*D - Mdot)
                + 0.0084 * MathUtils.sind(2*D + Mdot)
                - 0.0083 * MathUtils.sind(2*D - M)
                - 0.0039 * MathUtils.sind(2*D - M - Mdot)
                + 0.0034 * MathUtils.sind(2*Mdot)
                - 0.0031 * MathUtils.sind(2*D - 2*Mdot)
                + 0.0030 * MathUtils.sind(2*D + M)
                + 0.0028 * MathUtils.sind(M - Mdot)
                + 0.0026 * MathUtils.sind(M)
                + 0.0025 * MathUtils.sind(4*D)
                + 0.0024 * MathUtils.sind(D)
                + 0.0022 * MathUtils.sind(M + Mdot)
                + 0.0017 * MathUtils.sind(Omega)
                + 0.0014 * MathUtils.sind(4*D - Mdot)
                + 0.0005 * MathUtils.sind(2*D + M - Mdot)
                + 0.0004 * MathUtils.sind(2*D - M + Mdot)
                - 0.0003 * MathUtils.sind(2*D - 2*M)
                + 0.0003 * MathUtils.sind(4*D - M)
                + 0.0003 * MathUtils.sind(V)
                + 0.0003 * MathUtils.sind(P);

        return timeCorr.computeTimeStamp(JDE, TimeConvention.TIME_TDB, false);
    }
}