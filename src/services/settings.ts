import { BehaviorSubject } from "rxjs";
import { DEFAULT_LOOKUP_RELAYS, DEFAULT_RELAYS } from "../const";
import { LatLngLiteral } from "leaflet";

// save and load settings from localStorage
function persist<T>(key: string, subject: BehaviorSubject<T>) {
  try {
    if (localStorage.getItem(key))
      subject.next(JSON.parse(localStorage.getItem(key)!));
  } catch {}
  subject.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
}

export const lookupRelays = new BehaviorSubject<string[]>(
  DEFAULT_LOOKUP_RELAYS,
);
persist("lookup-relays", lookupRelays);

export const defaultRelays = new BehaviorSubject<string[]>(DEFAULT_RELAYS);
persist("default-relays", defaultRelays);

export const homeMapCenter = new BehaviorSubject<{
  center: LatLngLiteral;
  zoom: number;
} | null>(null);
persist("home-map-center", homeMapCenter);
