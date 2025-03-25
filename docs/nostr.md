# Nostr events

## Wifi hot-spot event

A wifi hot-spot event is a kind `38787` event with a human readable name and a description in the `content` field and metadata in the `tags`

```jsonc
{
  "kind": 38787,
  "content": "This is a great little coffee shop with free wifi.",
  "tags": [
    // optional name for the wifi hot-spot ( optional )
    ["name", "Corner Café"],
    // the ssid of the wifi hot-spot ( required )
    ["ssid", "corner-coffee-shop"],
    // whether the wifi hot-spot is hidden ( required )
    ["h", "false"], // ["h", "true"]
    // whether the wifi hot-spot has a captive portal ( required )
    ["c", "true"], // ["c", "false"]

    // optional tags
    // the security type of the wifi hot-spot ( WEP, WPA, WPA2, WPA3, nopass ) ( optional )
    ["security", "WPA2"],
    // the password of the wifi hot-spot ( optional )
    ["password", "coffeeshop12345"],

    // Geohash tags for location
    ["g", "<geohash>"],
  ],
}
```

## Wifi correction event

A wifi correction event is a kind `8787` which is used to correct the details of a wifi hot-spot.

It can have the same tags as a wifi hot-spot event, but each tag is considered a correction to the original wifi hot-spot event.

```jsonc
{
  "kind": 8787,
  "content": "The wifi password has changed to morecoffeeplease",
  "tags": [
    // Update the security type of the wifi hot-spot ( optional )
    ["security", "WPA2"],
    // Update the password of the wifi hot-spot ( optional )
    ["password", "morecoffeeplease"],
  ],
}
```

## Comments

[NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) comments can be used to add comments and threads to wifi hot-spots.

## Reactions and zaps

[NIP-25](https://github.com/nostr-protocol/nips/blob/master/25.md) reactions and [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) can be used to rate and zap wifi hot-spots
