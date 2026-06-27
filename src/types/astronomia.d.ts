/**
 * `astronomia` ships no TypeScript declarations at all (pure JS library).
 * These ambient declarations cover only the submodules the kundli engine
 * actually uses, typed loosely (not `any` everywhere, but not exhaustively
 * precise either) — enough for type-checking to pass without pretending
 * to have full fidelity to the library's actual runtime shapes.
 */

declare module "astronomia/julian" {
  export function CalendarGregorianToJD(y: number, m: number, d: number): number;
}

declare module "astronomia/deltat" {
  export function deltaT(dyear: number): number;
}

declare module "astronomia/sidereal" {
  export function mean(jd: number): number;
  export function apparent(jd: number): number;
}

declare module "astronomia/nutation" {
  export function meanObliquity(jde: number): number;
}

declare module "astronomia/solar" {
  export function apparentLongitude(T: number): number;
}

declare module "astronomia/moonposition" {
  export function position(jde: number): { lon: number; lat: number; range: number };
}

declare module "astronomia/planetposition" {
  export class Planet {
    constructor(data: unknown);
    position(jde: number): { lon: number; lat: number; range: number };
    position2000(jde: number): { lon: number; lat: number; range: number };
  }
}

declare module "astronomia/elliptic" {
  import type { Planet } from "astronomia/planetposition";
  interface Ecliptic {
    lon: number;
    lat: number;
  }
  interface Equatorial {
    ra: number;
    dec: number;
    toEcliptic(eps: number): Ecliptic;
  }
  export function position(planet: Planet, earth: Planet, jde: number): Equatorial;
}

declare module "astronomia/data/vsop87Bmercury" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bvenus" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bmars" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bjupiter" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bsaturn" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
declare module "astronomia/data/vsop87Bearth" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}
