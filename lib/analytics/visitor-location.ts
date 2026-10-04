import { BlockList, isIP } from "node:net";
import { join } from "node:path";
import { open, type CityResponse, type Reader } from "maxmind";

type Location = { country: string | null; region: string | null; city: string | null };
type GeoRecord = { country_code?: unknown; state1?: unknown; city?: unknown };
type Options = { trustGeoHeaders?: boolean; lookup?: (ip: string) => Promise<GeoRecord | null> };
const empty: Location = { country: null, region: null, city: null };
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const readers = new Map<number, Promise<Reader<CityResponse>>>();

const excluded = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
  ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 3],
] as const) excluded.addSubnet(address, prefix, "ipv4");
excluded.addSubnet("2001:db8::", 32, "ipv6");
excluded.addSubnet("2001::", 32, "ipv6");
excluded.addSubnet("2002::", 16, "ipv6");
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");

function publicIp(value: string | null) {
  if (!value) return null;
  let ip = value.trim().toLowerCase();
  if (ip.startsWith("::ffff:") && isIP(ip.slice(7)) === 4) ip = ip.slice(7);
  const family = isIP(ip);
  if (!family || (family === 6 && !globalV6.check(ip, "ipv6"))) return null;
  return excluded.check(ip, family === 4 ? "ipv4" : "ipv6") ? null : ip;
}

function field(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

/** Production Nginx overwrites X-Real-IP; the app must stay behind that proxy. */
export async function resolveVisitorLocation(headers: Headers, options: Options = {}): Promise<Location> {
  const trustGeo = options.trustGeoHeaders ?? process.env.TRUST_ANALYTICS_PROXY === "true";
  const supplied: Location = trustGeo ? {
    country: field(headers.get("x-geo-country"), 100),
    region: field(headers.get("x-geo-region")),
    city: field(headers.get("x-geo-city")),
  } : { ...empty };
  if (supplied.country || supplied.region || supplied.city) return supplied;
  const ip = publicIp(headers.get("x-real-ip"));
  if (!ip) return supplied;
  try {
    const result = await (options.lookup ?? lookupLocal)(ip);
    if (!result) return supplied;
    const code = field(result.country_code, 100);
    const country = code && /^[A-Z]{2}$/.test(code) ? countryNames.of(code) ?? code : code;
    return { country, region: field(result.state1), city: field(result.city) };
  } catch {
    // A missing/corrupt database must never prevent the page visit from being saved.
    console.warn("Analytics local location lookup failed");
    return supplied;
  }
}

async function lookupLocal(ip: string): Promise<GeoRecord | null> {
  const family = isIP(ip);
  let reader = readers.get(family);
  if (!reader) {
    const directory = join(process.cwd(), "node_modules/@ip-location-db/dbip-city-mmdb");
    reader = open<CityResponse>(join(directory, `dbip-city-ipv${family}.mmdb`), { cache: { max: 1000 } });
    readers.set(family, reader);
    // Retain the rejected promise to avoid repeatedly reloading broken data.
  }
  return (await reader).get(ip) as unknown as GeoRecord | null;
}
