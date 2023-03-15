import { OsvFrame, Frames, Frame } from "./Frames";
import { MathUtils } from "./MathUtils";
    
/**
 * Class with static methods for handling of stellar and diurnal aberration.
 */
export class Aberration
{
    /**
     * Apply stellar and diurnal aberration to the position vector of J2000 OSV.
     * 
     * @param {OsvFrame} osvTargetJ2000 
     *      Target in J2000 frame.
     * @param {OsvFrame} osvEarthEclHel 
     *      The OSV for the Earth in ecliptic heliocentric frame. If diurnal
     *      aberration is included, this should be position of the observer
     *      on Earth.
     */
    static aberrationStellar(osvTargetJ2000 : OsvFrame, osvEarthEclHel : OsvFrame) : OsvFrame
    {
        const rJ2000 = osvTargetJ2000.position;
        const dist = MathUtils.norm(rJ2000);
        const RA0 = MathUtils.atan2d(rJ2000[1], rJ2000[0]);
        const decl0 = MathUtils.asind(rJ2000[2]/dist);

        const au = 149597870700;
        // From m/s to 10e-8 au/day;
        const factor = 86164.0905 * 1e8 / au;
        const osvEarthJ2000 = Frames.coordEclEq(osvEarthEclHel);

        const vX = osvEarthEclHel.velocity[0] * factor;
        const vY = osvEarthEclHel.velocity[1] * factor;
        const vZ = osvEarthEclHel.velocity[2] * factor;

        // Velocity of light in au/day.
        const c = 17314463350;
        
        // Updates to the RA and decl due to aberration.
        const delta_RA = (180/Math.PI) * (vY*MathUtils.cosd(RA0) - vX*MathUtils.sind(RA0))
                       / (c * MathUtils.cosd(decl0));
        const delta_decl = - (180/Math.PI) * ((vX*MathUtils.cosd(RA0) + vY*MathUtils.sind(RA0))
                         * MathUtils.sind(decl0) - vZ * MathUtils.cosd(decl0)) / c;
        
        // Update RA, decl and position.
        const RA = RA0 + delta_RA;
        const decl = decl0 + delta_decl;

        // TBD: Should we also apply similar correction to the velocity?
        const rJ2000Updated = [dist * MathUtils.cosd(RA) * MathUtils.cosd(decl), 
                               dist * MathUtils.sind(RA) * MathUtils.cosd(decl),
                               dist * MathUtils.sind(decl)];

        return {
            frame : Frame.FRAME_J2000,
            position : rJ2000Updated,
            velocity : osvTargetJ2000.velocity,
            timeStamp : osvTargetJ2000.timeStamp
        };
    }
}