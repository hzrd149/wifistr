import { BehaviorSubject } from "rxjs";
import { DEFAULT_LOOKUP_RELAYS } from "../const";

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
