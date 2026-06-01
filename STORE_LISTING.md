# Chrome Web Store — Listing Copy

Bu dosya doğrudan kullanılmaz; Web Store developer dashboard'a yapıştırılır.

---

## Listing language
Primary: **Turkish (tr)**. İngilizce çeviri opsiyonel ama önerilir.

## Name
`FACEIT Ping Viewer`

## Short description (max 132 chars)
`FACEIT maçlarındaki sunucu lokasyonlarına olan ping değerlerinizi görün ve geçmişe göre en iyi sunucuyu seçin.`

(132 char sayımı: 130. Sınır içinde.)

## Category
**Productivity** veya **Sports**. Productivity daha doğru — Sports kategorisi izleyici/skor uygulamaları için.

## Detailed description

```
FACEIT Ping Viewer, CS2 oyuncularının maç öncesi server vote ekranında en iyi sunucuyu seçmesini kolaylaştırır.

ÖZELLİKLER

• Popup'tan tüm bilinen FACEIT sunucu lokasyonlarına anlık ping ölçümü
  - Helsinki, Frankfurt, Stockholm, Amsterdam, London, Paris, US East/West, Sydney ve daha fazlası
  - Her ölçüm best-of-N (3 ölçümün minimumu) ile jitter'a karşı dirençli
  - Renkli rozetler: yeşil (<40ms), sarı (<90ms), kırmızı (90ms+)

• Geçmiş takibi
  - Karşılaştığınız her sunucu otomatik olarak hafızada tutulur
  - "Kaç kez görüldü", "son ölçümün ne zaman yapıldı" gibi metrikler
  - Tüm veriler cihazınızda yerel olarak (chrome.storage.local), buluta gönderilmez

• Match room entegrasyonu (deneysel)
  - faceit.com/cs2/room sayfalarında server vote butonlarının yanına inline ping rozeti enjekte eder
  - FACEIT'in UI yapısı sık değişebilir; bu özellik bazı durumlarda devre dışı kalabilir

PİNGLER NASIL ÖLÇÜLÜYOR?

Tarayıcılar düşük seviye ICMP (klasik ping) atamadığı için uygulama, FACEIT sunucularıyla aynı lokasyonlarda bulunan Hetzner ve Linode datacenter speed-test endpoint'lerine HTTP HEAD istekleri atarak gecikme ölçer. FACEIT EU sunucularının büyük kısmı zaten Hetzner'da host edildiğinden ölçümler gerçek match pinginize çok yakındır (genelde ±10ms).

GİZLİLİK

Hiçbir kişisel bilgi toplanmaz, sunucumuza gönderilmez veya satılmaz. Tüm sunucu listeniz cihazınızda yerel olarak saklanır. Detaylı gizlilik politikası: https://github.com/emre-cal/faceit-ping-viewer/blob/main/PRIVACY.md

KAYNAK KOD

Açık kaynak: https://github.com/emre-cal/faceit-ping-viewer

---

⚠ FACEIT veya Hetzner/Linode ile resmi bir bağlantısı yoktur. Bu eklenti bağımsız bir community projesidir.
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
> Required to issue HTTP HEAD requests for latency measurement to cloud datacenter speed-test endpoints in the same regions as FACEIT game servers. No personal data is transmitted in these requests.

## Single purpose description
> Show ping latency to FACEIT match server locations and remember server history per user.

## Screenshots needed (min 1, max 5)
- **Şart**: 1280×800 px (veya 640×400 px) PNG/JPG
- Önerilen 3 ekran:
  1. Fixture sayfası — inline rozet UI'ı (yeşil/sarı/kırmızı ping)
  2. Popup açık — geçmiş sunucu listesi + son pingler
  3. Marketing banner (opsiyonel) — feature highlight

## Promotional tile (opsiyonel)
- Small: 440×280
- Marquee: 1400×560

## Pricing
Free (ücretsiz)

## Distribution
- **Public** (Chrome Web Store'da herkese açık) veya
- **Unlisted** (link ile paylaşılır, search'te çıkmaz) — detector kanıtlanana kadar bu önerilir
