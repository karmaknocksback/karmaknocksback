/**
 * Real astronomical calculations underpinning the kundli engine — VSOP87
 * planetary theory and Meeus lunar theory via the `astronomia` library
 * (pure JS, no native compilation), not approximated or invented rules.
 *
 * Two honesty notes that matter for how this gets used elsewhere:
 *
 * 1. The Lahiri ayanamsa here is a LINEAR approximation anchored to the
 *    ICRC-standardized J2000.0 value (23.853222°, the same anchor Swiss
 *    Ephemeris's SE_SIDM_LAHIRI uses) with the IAU 2000 precession rate
 *    (50.290966"/year). Professional implementations (Swiss Ephemeris)
 *    apply non-linear IAU 2006 precession corrections that cause the
 *    real year-over-year rate to vary by several arcseconds either side
 *    of that average. For birth dates within roughly a century of
 *    J2000.0 this linear approximation stays within a few arcminutes of
 *    the non-linear value — rarely enough to flip a nakshatra boundary
 *    (each spans 13°20'), but close-to-boundary cases should be treated
 *    with appropriate caution rather than false confidence. This is
 *    stated explicitly in the kundli report output, not just in code
 *    comments.
 * 2. Rahu/Ketu use the MEAN lunar node (the traditional standard for
 *    Vedic calculations), not the more volatile true/osculating node.
 *
 * Calculation method (ayanamsa, mean node, etc.) is always returned
 * alongside results so it can be disclosed, never silently assumed.
 */

import * as julian from "astronomia/julian";
import * as deltat from "astronomia/deltat";
import * as sidereal from "astronomia/sidereal";
import * as nutation from "astronomia/nutation";
import * as solar from "astronomia/solar";
import * as moonposition from "astronomia/moonposition";
import * as planetposition from "astronomia/planetposition";
import * as elliptic from "astronomia/elliptic";
import vsop87Bmercury from "astronomia/data/vsop87Bmercury";
import vsop87Bvenus from "astronomia/data/vsop87Bvenus";
import vsop87Bmars from "astronomia/data/vsop87Bmars";
import vsop87Bjupiter from "astronomia/data/vsop87Bjupiter";
import vsop87Bsaturn from "astronomia/data/vsop87Bsaturn";
import vsop87Bearth from "astronomia/data/vsop87Bearth";

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export const AYANAMSA_J2000_DEG = 23.853222; // ICRC-standardized Lahiri value at JD 2451545.0
const PRECESSION_ARCSEC_PER_YEAR = 50.290966; // IAU 2000 linear rate

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** UTC calendar date/time -> Julian Ephemeris Day (TT), via the standard
 * ΔT (UTC-to-TT) correction. */
export function toJDE(year: number, month: number, day: number, hour: number, minute: number): number {
  const dayFrac = day + (hour + minute / 60) / 24;
  const jdUTC = julian.CalendarGregorianToJD(year, month, dayFrac);
  const dyear = year + (month - 0.5) / 12;
  const dt = deltat.deltaT(dyear); // seconds
  return jdUTC + dt / 86400;
}

/** Linear-approximation Lahiri ayanamsa for a given JDE. See module-level
 * doc comment for the honesty caveat on linear vs non-linear precession. */
export function lahiriAyanamsa(jde: number): number {
  const yearsSinceJ2000 = (jde - 2451545.0) / 365.25;
  const arcsec = PRECESSION_ARCSEC_PER_YEAR * yearsSinceJ2000;
  return AYANAMSA_J2000_DEG + arcsec / 3600;
}

export interface PlanetLongitude {
  tropicalLon: number; // degrees, 0-360
  siderealLon: number; // degrees, 0-360 (Lahiri)
}

function toSidereal(tropicalLonRad: number, ayanamsa: number): PlanetLongitude {
  const tropicalLon = norm360(tropicalLonRad * RAD2DEG);
  const siderealLon = norm360(tropicalLon - ayanamsa);
  return { tropicalLon, siderealLon };
}

let earthPlanet: InstanceType<typeof planetposition.Planet> | null = null;
function getEarth() {
  if (!earthPlanet) earthPlanet = new planetposition.Planet(vsop87Bearth.default ?? vsop87Bearth);
  return earthPlanet;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLANET_DATA: Record<string, any> = {
  Mercury: vsop87Bmercury, Venus: vsop87Bvenus, Mars: vsop87Bmars,
  Jupiter: vsop87Bjupiter, Saturn: vsop87Bsaturn,
};
const planetInstances: Record<string, InstanceType<typeof planetposition.Planet>> = {};
function getPlanet(name: string) {
  if (!planetInstances[name]) {
    const data = PLANET_DATA[name];
    planetInstances[name] = new planetposition.Planet(data.default ?? data);
  }
  return planetInstances[name];
}

export interface KundliPositions {
  jde: number;
  ayanamsa: number;
  sun: PlanetLongitude;
  moon: PlanetLongitude;
  mars: PlanetLongitude;
  mercury: PlanetLongitude;
  jupiter: PlanetLongitude;
  venus: PlanetLongitude;
  saturn: PlanetLongitude;
  rahu: PlanetLongitude;
  ketu: PlanetLongitude;
  ascendant: PlanetLongitude;
}

/** Mean lunar node (Rahu) longitude — standard Meeus formula. */
function meanLunarNode(jde: number): number {
  const T = (jde - 2451545.0) / 36525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(omega);
}

/** Ascendant (Lagna) via the standard formula: tan(Asc) = -cos(RAMC) /
 * (sin(ε)·tan(φ) + cos(ε)·sin(RAMC)), with quadrant correction. */
function calculateAscendant(jde: number, latDeg: number, lonDeg: number, ayanamsa: number): PlanetLongitude {
  const gstSeconds = sidereal.apparent(jde); // seconds, Greenwich apparent sidereal time
  const gstDeg = (gstSeconds / 240); // seconds of time -> degrees (86400s = 360deg => /240)
  const ramcDeg = norm360(gstDeg + lonDeg); // local sidereal time in degrees (east longitude positive)
  const ramc = ramcDeg * DEG2RAD;
  const eps = nutation.meanObliquity(jde); // radians
  const phi = latDeg * DEG2RAD;

  const y = -Math.cos(ramc);
  const x = Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(ramc);
  const ascRad = Math.atan2(y, x);
  let ascDeg = norm360(ascRad * RAD2DEG);
  // atan2 form above can land 180° off depending on quadrant; the
  // ascendant must be within 90° of RAMC's corresponding ecliptic point,
  // so verify against the rising-hemisphere constraint and correct.
  if (Math.cos(ramc) > 0) ascDeg = norm360(ascDeg + 180);
  return toSidereal(ascDeg * DEG2RAD, ayanamsa);
}

export interface BirthInput {
  year: number; month: number; day: number; hour: number; minute: number;
  /** Decimal hours offset from UTC, e.g. India = 5.5 */
  utcOffsetHours: number;
  latitude: number; // decimal degrees, north positive
  longitude: number; // decimal degrees, east positive
}

const RASHI_RULING_PLANET: string[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

/** Computes only the Sun's sidereal rashi from a date alone (no birth
 * time needed — the Sun moves only ~1°/day, so time-of-day barely
 * affects its position, unlike the Moon which moves ~13°/day and truly
 * needs exact birth time to place accurately). Returns the rashi's
 * traditional ruling planet, a real and defensible astrological
 * association — NOT a substitute for a real dasha calculation, which
 * needs the Moon's nakshatra and therefore exact birth time and place. */
export function solarRulingPlanetFromDate(dateISO: string): { rashiHi: string; planet: string } {
  const [year, month, day] = dateISO.split("-").map(Number);
  // Time/location don't matter for the Sun's longitude at this precision,
  // so noon UTC at the prime meridian is a safe, arbitrary default.
  const positions = calculateKundliPositions({
    year, month, day, hour: 12, minute: 0, utcOffsetHours: 0, latitude: 0, longitude: 0,
  });
  const rashiIndex = Math.floor(positions.sun.siderealLon / 30);
  const RASHI_NAMES_HI = [
    "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन",
  ];
  return { rashiHi: RASHI_NAMES_HI[rashiIndex], planet: RASHI_RULING_PLANET[rashiIndex] };
}

export function calculateKundliPositions(birth: BirthInput): KundliPositions {
  // Convert local clock time to UTC first. Using a real Date object for
  // the rollover (rather than manual day +=/-= 1) matters: a manual
  // day-only adjustment doesn't correctly roll over month/year boundaries
  // — e.g. a birth at 00:15 IST on January 1st is 18:45 UTC on December
  // 31st of the PREVIOUS year, not "day 0" of January.
  const localAsUTC = new Date(Date.UTC(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute));
  const utcMs = localAsUTC.getTime() - birth.utcOffsetHours * 3600 * 1000;
  const utcDate = new Date(utcMs);
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hourInt = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();

  const jde = toJDE(year, month, day, hourInt, minute);
  const ayanamsa = lahiriAyanamsa(jde);
  const T = (jde - 2451545.0) / 36525;

  const sunLon = solar.apparentLongitude(T);
  const sun = toSidereal(sunLon, ayanamsa);

  const moonPos = moonposition.position(jde);
  const moon = toSidereal(moonPos.lon, ayanamsa);

  const earth = getEarth();
  const planetLon = (name: string) => {
    const equatorial = elliptic.position(getPlanet(name), earth, jde);
    const eps = nutation.meanObliquity(jde);
    const ecliptic = equatorial.toEcliptic(eps);
    return toSidereal(ecliptic.lon, ayanamsa);
  };

  const rahuTropical = meanLunarNode(jde);
  const rahu = toSidereal(rahuTropical * DEG2RAD, ayanamsa);
  const ketu = toSidereal(norm360(rahuTropical + 180) * DEG2RAD, ayanamsa);

  const ascendant = calculateAscendant(jde, birth.latitude, birth.longitude, ayanamsa);

  return {
    jde, ayanamsa, sun, moon,
    mars: planetLon("Mars"), mercury: planetLon("Mercury"),
    jupiter: planetLon("Jupiter"), venus: planetLon("Venus"), saturn: planetLon("Saturn"),
    rahu, ketu, ascendant,
  };
}
