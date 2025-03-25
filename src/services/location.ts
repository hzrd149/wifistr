import { Observable, ReplaySubject, share, timer } from "rxjs";

export const geolocation$ = new Observable<GeolocationPosition>(
  (subscriber) => {
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => subscriber.next(position),
      (error) => subscriber.error(error),
    );

    // Watch for position updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => subscriber.next(position),
      (error) => subscriber.error(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    // Cleanup when unsubscribed
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  },
);

export const location$ = geolocation$.pipe(
  share({
    connector: () => new ReplaySubject(1),
    resetOnError: true,
    // stay subscribed to the location for a minute after any UI element is using it
    resetOnRefCountZero: () => timer(60_000),
  }),
);
