# Agent Development Guide for Wifistr

This guide provides coding agents with essential information for working on Wifistr, an open wifi map powered by Nostr.

## Project Overview

Wifistr is a SolidJS-based Progressive Web App (PWA) that allows users to discover and share WiFi networks on a map using the Nostr protocol. The app uses Leaflet for mapping, Nostr for decentralized data storage, and applesauce libraries for Nostr event management.

## Build, Lint, and Test Commands

### Package Manager

- **Required**: Use `pnpm` (version 9.15.6)
- Install dependencies: `pnpm install`

### Development

- Start dev server: `pnpm dev` (Opens at http://localhost:5173)
- Preview production build: `pnpm preview` or `pnpm serve`

### Build

- Full production build: `pnpm build`
  - Runs TypeScript compiler check (`tsc -b`)
  - Creates Vite production bundle
  - Executes post-build script (`node scripts/build-index.js`)

### Formatting

- Format all files: `pnpm format` (Uses Prettier)
- Config: `.prettierrc` (2 spaces, no tabs)

### Type Checking

- Run TypeScript compiler: `tsc -b`
- No dedicated test runner configured

### Running Single Tests

**Note**: This project does not currently have a test framework configured. To add tests:

1. Install a test framework (e.g., Vitest): `pnpm add -D vitest`
2. Add test script to package.json: `"test": "vitest"`
3. Run single test file: `pnpm vitest path/to/test.spec.ts`

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── blueprints/      # Nostr event blueprints (event templates)
├── components/      # Reusable SolidJS components
├── const.ts         # Application constants (kinds, security types, relays)
├── helpers/         # Utility functions (toast, geohash, QR codes, etc.)
├── index.tsx        # Application entry point
├── lib/             # Third-party library integrations
├── operations/      # Nostr event operations
├── routes/          # Route-specific page components
└── services/        # Application services (accounts, loaders, stores, etc.)
```

## Code Style Guidelines

### Import Organization

1. Third-party imports first (React, SolidJS, libraries)
2. Blank line
3. Local imports grouped by type (components, services, helpers, constants)
4. Use absolute imports from `src/` root (e.g., `../../services/accounts`)

Example:

```typescript
import { A, useNavigate } from "@solidjs/router";
import { createSignal, from } from "solid-js";

import UserAvatar from "../../components/user-avatar";
import { WIFI_NETWORK_KIND } from "../../const";
import { accounts } from "../../services/accounts";
```

### TypeScript Standards

- **Strict mode enabled**: All strict TypeScript checks enforced
- **No implicit any**: Always specify types
- **No unused locals/parameters**: Remove or prefix with `_`
- **Target**: ES2022
- **Module system**: ESNext with bundler resolution
- **JSX**: Preserve mode with `solid-js` import source

### Formatting

- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Double quotes preferred
- **Line length**: No strict limit, but keep readable
- Use Prettier for auto-formatting

### Naming Conventions

- **Files**: kebab-case (e.g., `user-avatar.tsx`, `wifi-search.ts`)
- **Components**: PascalCase (e.g., `UserAvatar`, `WifiMap`)
- **Functions**: camelCase (e.g., `toastOperation`, `asyncAction`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `WIFI_NETWORK_KIND`, `DEFAULT_RELAYS`)
- **Services**: camelCase instances (e.g., `accounts`, `eventStore`)
- **Types/Interfaces**: PascalCase (e.g., `GeohashLatLng`)

### Component Patterns

#### SolidJS Components

- Use functional components with props
- Prefer `createSignal` for local state
- Use `from()` to convert RxJS observables to signals
- Use `createMemo` for derived values
- Use `createEffect` for side effects

Example:

```typescript
export default function UserName(props: { pubkey: string; class?: string }) {
  const profile = from(eventStore.profile(props.pubkey));

  return (
    <span class={props.class}>
      {profile()?.display_name || profile()?.name || "anon"}
    </span>
  );
}
```

#### Async Action Pattern

Use the `asyncAction` or `toastOperation` helpers for async operations with loading states:

```typescript
import { asyncAction } from "../helpers/async-action";

const { run, loading } = asyncAction(async (data) => await someAsyncOp(data), {
  success: "Success!",
  error: "Failed",
});
```

### State Management

- **Accounts**: Use `accounts` service from `applesauce-accounts`
- **Nostr Events**: Use `eventStore` from `services/stores`
- **RxJS**: Observables used extensively, convert to signals with `from()`
- **Local Storage**: Persist accounts and settings automatically

### Error Handling

- Use toast notifications for user-facing errors
- Prefer `.catch()` with toast.error() for async operations
- Log errors to console for debugging: `console.log()` or `console.error()`
- No global error boundary configured

### Nostr Event Patterns

#### Creating Events

Use blueprints and operations:

```typescript
import { blueprint } from "applesauce-factory";
import { WifiBlueprint } from "../blueprints/wifi";

const event = WifiBlueprint(
  { ssid: "MyWifi", password: "secret", security: "WPA2" },
  { lat: 40.7128, lng: -74.006 },
  "Coffee shop wifi",
);
```

#### Event Tags

- Use `ensureSingletonTag` for unique tags
- Use `ensureNamedValueTag` for multiple tags with same name
- Tag naming: lowercase letters (e.g., `g`, `ssid`, `name`)

### Styling

- **Framework**: TailwindCSS v4 with @tailwindcss/vite plugin
- **Approach**: Utility-first classes
- **Responsive**: Use Tailwind responsive prefixes (sm:, md:, lg:)
- **Custom CSS**: Minimal, prefer Tailwind utilities

Example:

```tsx
<div class="h-dvh bg-gray-100 flex flex-col overflow-hidden">
  <main class="flex-col flex-grow flex">{/* Content */}</main>
</div>
```

### Constants and Configuration

- Define app-wide constants in `src/const.ts`
- Nostr event kinds: `WIFI_NETWORK_KIND = 38787`
- Default relays in `services/settings.ts`
- Security types as string unions

### Comments

- Use JSDoc for functions/operations when behavior is non-obvious
- Inline comments for complex logic
- Avoid obvious comments (e.g., `// set loading` before `setLoading(true)`)

## Common Patterns

### Route Components

- Accept `RouteSectionProps` for routing context
- Use `useNavigate()` for programmatic navigation
- Use `<A>` component for links
- Access location state via `props.location.state`

### Observable to Signal

```typescript
import { from } from "solid-js";
const account = from(accounts.active$);
// Access with account() - note the parentheses
```

### Geohash Usage

```typescript
import ngeohash from "ngeohash";
const hash = ngeohash.encode(lat, lng, precision);
```

## Important Notes

- This is a PWA with offline support via Vite PWA plugin
- Map uses Leaflet with locate control for user positioning
- All network data stored on Nostr relays (decentralized)
- No backend server - client-side only
- Account management handles multiple Nostr accounts/signers
- Events loaded based on map viewport geohashes

## Getting Help

- Project README: `/README.md`
- Nostr protocol: https://github.com/nostr-protocol/nips
- SolidJS docs: https://www.solidjs.com/docs
- Applesauce libraries: Check individual package docs
