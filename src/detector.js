// FACEIT match room DOM'undan server vote seçeneklerini bulan ve içlerinden
// sunucu bilgisini çıkaran iki fonksiyon. FACEIT DOM'u bilinmiyor olduğu için
// birden fazla selector stratejisi sırayla deneniyor — biri tutarsa yeter.
// Gerçek FACEIT match'i incelendiğinde, çalışan stratejiyi en üste taşı veya
// gerçek selector'ı ekle.

const SELECTOR_STRATEGIES = [
  // En spesifikten en geneline:
  '[data-testid="server-vote-option"]',
  '[data-testid*="server-vote"]',
  '[data-testid*="server"][role="button"]',
  '[aria-label^="Vote for" i]',
  '.server-option',
  '[class*="ServerVote"] [role="button"]',
  '[class*="server-vote"] button',
  '[class*="server-vote"] [class*="option"]'
];

/**
 * Match room DOM'undaki server vote seçeneklerini bulur.
 * Birden fazla strateji dener, ilk tutan stratejinin sonucunu döner.
 * @param {Document|HTMLElement} root
 * @returns {HTMLElement[]}
 */
export function findServerVoteOptions(root) {
  for (const selector of SELECTOR_STRATEGIES) {
    const els = [...root.querySelectorAll(selector)];
    if (els.length > 0) {
      console.debug(`[fpv] selector tuttu: "${selector}" (${els.length} element)`);
      return els;
    }
  }
  return [];
}

/**
 * Bir server vote element'inden sunucu bilgisini çıkarır.
 * @param {HTMLElement} el
 * @returns {{ id: string, label: string, host: string } | null}
 */
export function extractServerInfo(el) {
  const name = extractLocationName(el);
  if (!name) return null;

  const host = hostFromLocation(name);
  if (!host) {
    console.debug(`[fpv] bilinmeyen lokasyon: "${name}" — host map'ine ekle`);
    return null;
  }

  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    label: name,
    host
  };
}

/** Element'in içinden lokasyon ismini birden fazla stratejiyle çıkarmaya çalışır. */
function extractLocationName(el) {
  // 1) aria-label="Vote for Helsinki" → "Helsinki"
  const aria = el.getAttribute("aria-label");
  if (aria) {
    const match = aria.match(/(?:vote\s+for\s+)?(.+)/i);
    if (match) {
      const candidate = match[1].trim();
      if (isKnownLocation(candidate)) return candidate;
    }
  }

  // 2) data-server-name veya benzeri attribute
  const dataName = el.dataset.serverName || el.dataset.location || el.dataset.region;
  if (dataName && isKnownLocation(dataName)) return dataName;

  // 3) İç metin: en uzun word grup'unu al, bilinen lokasyonla eşleşeni seç
  const text = el.textContent?.trim() ?? "";
  for (const known of Object.keys(LOCATION_TO_HOST)) {
    const re = new RegExp(`\\b${known.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (re.test(text)) {
      // Orijinal kelime yazımını koru (Helsinki, US East)
      return known
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
    }
  }

  // 4) En içteki span/text'i dene
  const nameEl = el.querySelector('[class*="name" i], [class*="label" i], .server-name');
  if (nameEl?.textContent) {
    const candidate = nameEl.textContent.trim();
    if (isKnownLocation(candidate)) return candidate;
  }

  return null;
}

function isKnownLocation(name) {
  return name.toLowerCase().trim() in LOCATION_TO_HOST;
}

// Bilinen FACEIT lokasyonları → ping ölçümü için HTTPS endpoint'i.
// FACEIT relay'lerinin tam IP'leri public değil; aynı şehirdeki cloud
// datacenter speed-test endpoint'leri proxy olarak kullanılıyor.
// FACEIT'in EU sunucularının çoğu Hetzner'da olduğu için Hetzner endpoint'leri
// gerçek FACEIT pingine çok yakın değer verir (±5-10ms).
export const LOCATION_TO_HOST = {
  // Hetzner (FACEIT'in büyük olasılıkla kullandığı sağlayıcı)
  "helsinki":  "https://hel1-speed.hetzner.com",
  "frankfurt": "https://fsn1-speed.hetzner.com",  // Falkenstein, Frankfurt'a ~250km
  "nuremberg": "https://nbg1-speed.hetzner.com",
  "us east":   "https://ash-speed.hetzner.com",    // Ashburn, VA
  "us west":   "https://hil-speed.hetzner.com",    // Hillsboro, OR
  "singapore": "https://sin-speed.hetzner.com",

  // Linode (diğer bölgeler için)
  "stockholm": "https://speedtest.london.linode.com",   // en yakın alternatif
  "amsterdam": "https://speedtest.frankfurt.linode.com", // en yakın alternatif
  "london":    "https://speedtest.london.linode.com",
  "paris":     "https://speedtest.frankfurt.linode.com", // en yakın alternatif
  "warsaw":    "https://speedtest.frankfurt.linode.com",
  "chicago":   "https://speedtest.dallas.linode.com",
  "oceania":   "https://speedtest.sydney1.linode.com",
  "sydney":    "https://speedtest.sydney1.linode.com",
  "tokyo":     "https://speedtest.tokyo2.linode.com",
  "mumbai":    "https://speedtest.mumbai1.linode.com"
};

export function hostFromLocation(label) {
  const key = label.toLowerCase().trim();
  return LOCATION_TO_HOST[key] ?? null;
}
