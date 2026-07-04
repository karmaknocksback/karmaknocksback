"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface City { name: string; state: string; country: string; lat: number; lon: number; }

interface Props { value: string; onChange: (val: string) => void; }

export default function CityAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchCities(q: string) {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      // Use OpenStreetMap Nominatim — free, no API key needed
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&featuretype=city,town`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const cities: City[] = data.map((item: Record<string, unknown>) => {
        const address = (item.address || {}) as Record<string, string>;
        const name = (address.city || address.town || address.village || address.county || String(item.display_name || "")).split(",")[0];
        const state = address.state || "";
        const country = address.country || "";
        return { name, state, country, lat: Number(item.lat), lon: Number(item.lon) };
      }).filter((c: City) => c.name);
      // Deduplicate by name+state
      const seen = new Set<string>();
      const unique = cities.filter((c: City) => {
        const key = `${c.name}-${c.state}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setSuggestions(unique.slice(0, 6));
      setOpen(unique.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(val: string) {
    setQuery(val);
    onChange(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchCities(val), 400);
  }

  function selectCity(city: City) {
    const formatted = [city.name, city.state, city.country].filter(Boolean).join(", ");
    setQuery(formatted);
    onChange(formatted);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
        {loading && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 animate-spin" />}
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="kkb-input pl-9"
          placeholder="शहर का नाम टाइप करें — जैसे: Jaipur, Mumbai..."
          autoComplete="off"
          required
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-charcoal/10 bg-white shadow-xl overflow-hidden">
          {suggestions.map((city, i) => (
            <button key={i} type="button" onClick={() => selectCity(city)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-charcoal/5 transition-colors border-b border-charcoal/5 last:border-0">
              <MapPin size={13} className="text-gold-deep shrink-0" />
              <div>
                <p className="font-sans text-sm font-medium text-charcoal">{city.name}</p>
                <p className="font-sans text-xs text-charcoal/45">{[city.state, city.country].filter(Boolean).join(", ")}</p>
              </div>
            </button>
          ))}
          <p className="px-4 py-2 font-sans text-[10px] text-charcoal/30 bg-charcoal/[0.02]">
            Powered by OpenStreetMap
          </p>
        </div>
      )}
    </div>
  );
}
