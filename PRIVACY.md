# FACEIT Ping Viewer — Privacy Policy

_Last updated: 2026-05-31_

FACEIT Ping Viewer is a Chrome extension that helps players see ping latency to FACEIT match server locations. We take your privacy seriously.

## What we collect

**Nothing.** This extension does not collect, transmit, store on remote servers, or share any personal information.

## What we store locally

The extension uses `chrome.storage.local` (your browser's built-in local storage) to remember:
- A list of FACEIT server locations you have encountered (e.g., "Helsinki", "Frankfurt")
- The most recent ping measurement for each location
- A counter of how many times each location has been seen

This data **never leaves your device**. It is not synchronized to any cloud, not transmitted to us, and not shared with any third party. You can wipe it any time by removing the extension or via Chrome's extension storage controls.

## Network requests we make

To measure ping (round-trip time), the extension issues HTTP HEAD requests to public speed-test endpoints provided by cloud datacenter operators in the same regions as FACEIT match servers:

- `*.hetzner.com` (Hetzner Cloud speed-test endpoints in Helsinki, Falkenstein, Nuremberg, Ashburn, Hillsboro, Singapore)
- `speedtest.*.linode.com` (Linode speed-test endpoints in London, Frankfurt, Dallas, Sydney, Tokyo, Mumbai)

These requests contain no personal identifiers — they are anonymous HEAD requests whose only purpose is to measure latency. We do not own or operate these endpoints, and we do not share any information with them beyond what is required for a standard HTTP request (your IP address, which is also visible to any website you visit).

## Faceit.com integration

The extension's content script runs on `https://www.faceit.com/*` pages to:
1. Detect server vote UI elements (read-only DOM inspection)
2. Inject small "ping" badges next to those elements

The content script does **not** read your FACEIT account information, chat messages, match history, or any other private data on the page. It only reads the publicly rendered DOM nodes related to server selection.

## Permissions justification

- **`storage`**: Required to persist your server list locally between browser sessions.
- **`host_permissions` for faceit.com**: Required to inject the in-page UI on FACEIT match rooms.
- **`host_permissions` for hetzner.com / linode.com**: Required so the extension's service worker can perform HTTP requests to those endpoints for latency measurement.

## Changes

If we ever change this policy, we will update the `Last updated` date above and bump the extension version.

## Contact

Questions? Open an issue at the extension's homepage or contact the developer listed on the Chrome Web Store listing.
