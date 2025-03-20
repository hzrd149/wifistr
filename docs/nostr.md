# Nostr events

## Wifi hot-spot event

A wifi hot-spot event is a kind `30784` event with a human readable name and a description in the `content` field and metadata in the `tags`

```jsonc
{
  "content": "This is a great little coffee shop with free wifi.",
  "tags": [
    // optional name for the wifi hot-spot ( optional )
    ["name", "Corner Café"],
    // the ssid of the wifi hot-spot ( required )
    ["ssid", "corner-coffee-shop"],
    ["h", "false"], // ["h", "true"]
    // whether the wifi hot-spot has a captive portal ( required )
    ["c", "true"], // ["c", "false"]

    // optional tags
    // the security type of the wifi hot-spot ( WEP, WPA, WPA2, WPA3, NONE ) ( optional )
    ["security", "WPA2"],
    // the password of the wifi hot-spot ( optional )
    ["password", "coffeeshop12345"],
    // whether the wifi hot-spot is hidden ( required )
  ],
}
```

## Comments

[NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) comments can be used to add comments and threads to wifi hot-spots.

## Reactions and zaps

[NIP-25](https://github.com/nostr-protocol/nips/blob/master/25.md) reactions and [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) can be used to rate and zap wifi hot-spots
