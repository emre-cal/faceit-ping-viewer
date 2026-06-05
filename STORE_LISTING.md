# Chrome Web Store — Listing Copy

Bu dosya doğrudan kullanılmaz; Web Store developer dashboard'a yapıştırılır.
Listing dili **English (en)** — eklenti tek dilli, UI metinleri doğrudan İngilizce gömülü.

---

## Listing language
**English (en)** — tek dil.

## Name
`FACEIT Ping Viewer`

## Short description (max 132 chars)
`See your ping to every FACEIT match server location and pick the best server from your history.`

## Category
**Tools**. (Chrome 2024'te taksonomiyi değiştirdi; eski "Productivity/Sports" artık yok.)
Eklenti bir yardımcı araç — ping ölçüp karar vermeye yardım ediyor; "Tools" en doğru oturan kategori.
Alternatif: **Games** (CS2'ye özel olduğu için gaming kitlesi). Kategori sonradan değiştirilebilir.

## Detailed description

```
FACEIT Ping Viewer helps CS2 players pick the best server on the pre-match server vote screen.

FEATURES

• Instant ping measurement from the popup to every known FACEIT server location
  - Helsinki, Frankfurt, Stockholm, Amsterdam, London, Paris, US East/West, Sydney and more
  - Each measurement is best-of-N (minimum of 3 samples) to resist jitter
  - Color-coded badges: green (<40ms), yellow (<90ms), red (90ms+)

• History tracking
  - Every server you encounter is remembered automatically
  - Metrics like "how many times seen" and "when it was last measured"
  - All data stays locally on your device (chrome.storage.local); nothing is sent to the cloud

• Match room integration (experimental)
  - Injects an inline ping badge next to the server vote UI on faceit.com/cs2/room pages
  - FACEIT's UI structure changes often; this feature may be temporarily unavailable

HOW IS PING MEASURED?

Browsers can't send low-level ICMP (classic ping), so the extension measures latency by issuing
HTTP requests to Hetzner and Linode datacenter speed-test endpoints located in the same regions as
FACEIT game servers. Since most FACEIT EU servers are themselves hosted on Hetzner, the measurements
are very close to your real in-game ping (usually within ±10ms).

PRIVACY

No personal information is collected, sent to our servers, or sold. Your entire server list is stored
locally on your device. Full privacy policy: https://github.com/emre-cal/faceit-ping-viewer/blob/main/PRIVACY.md

SOURCE CODE

Open source: https://github.com/emre-cal/faceit-ping-viewer

---

⚠ Not affiliated with FACEIT, Hetzner, or Linode. This is an independent community project.
```

## Privacy policy URL
`https://github.com/emre-cal/faceit-ping-viewer/blob/main/PRIVACY.md`

GitHub blob view markdown'ı render eder; Chrome Web Store bu URL'i privacy policy olarak kabul eder.

## Permissions justification (Web Store dashboard'a yazılacak)

**`storage`**
> Required to persist the user's encountered FACEIT server locations and their last measured ping value across browser sessions. All data is stored locally via `chrome.storage.local` and never leaves the user's device.

**Host permissions: `*.faceit.com`**
> Required to inject the in-page ping badges next to FACEIT's server vote UI on match room pages.

**Host permissions: `*.hetzner.com`, `*.linode.com`**
> Required to issue HTTP requests for latency measurement to cloud datacenter speed-test endpoints in the same regions as FACEIT game servers. No personal data is transmitted in these requests.

## Single purpose description
> Show ping latency to FACEIT match server locations and remember server history per user.

## Remote code use
**Cevap: No, I am not using remote code.**
Eklenti hiçbir uzak script/Wasm yüklemez veya `eval` etmez. Tüm JS paketin içinde gömülü.
Hetzner/Linode'a yapılan istekler sadece **gecikme ölçümü** için `no-cors` HTTP istekleridir;
dönen yanıt opak olduğu için okunmaz veya çalıştırılmaz (kod değil, sadece zamanlama ölçülür).
> (Eğer form yine de bir gerekçe metni isterse:) The extension does not load or execute any remotely
> hosted code. Outbound requests to Hetzner/Linode speed-test endpoints are latency measurements only;
> their responses are opaque and never parsed or executed.

## Data usage / certification (Privacy practices sekmesi)
- **Data collection:** "Does not collect or use user data" işaretle (hiçbir veri toplanmıyor; sunucu listesi sadece `chrome.storage.local`'de yerel).
- En altta üç onay kutusunu işaretle:
  - I do not sell or transfer user data to third parties (outside approved use cases)
  - I do not use or transfer user data for purposes unrelated to my item's single purpose
  - I do not use or transfer user data to determine creditworthiness or for lending purposes
- "I certify that my data usage complies with the Developer Program Policies" kutusunu işaretle.

## Contact email (Settings / Account sayfası)
- Settings → "Contact email" alanına bir e-posta gir ve **doğrula** (Google doğrulama maili gönderir).
- Yayınlamadan önce e-posta doğrulanmış olmalı (zorunlu).

## Screenshots needed (min 1, max 5)
- **Required**: 1280×800 px (or 640×400 px) PNG/JPG
- Recommended 3 screens:
  1. Match room — inline badge UI (green/yellow/red ping)
  2. Popup open — server history list + latest pings
  3. Marketing banner (optional) — feature highlight

## Promotional tile (optional)
- Small: 440×280
- Marquee: 1400×560

## Pricing
Free

## Distribution
- **Public** (visible to everyone on the Chrome Web Store) or
- **Unlisted** (shared via link, not shown in search) — recommended until the detector is proven
