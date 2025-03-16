import { EventStore, QueryStore } from "applesauce-core";
import rxNostr from "./nostr";

export const eventStore = new EventStore();
export const queryStore = new QueryStore(eventStore);

// add all events to the event store
rxNostr.createAllEventObservable().subscribe((packet) => {
  eventStore.add(packet.event, packet.from);
});
