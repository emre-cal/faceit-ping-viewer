// FACEIT match room'daki seçilmiş sunucu kartını bulan ve country code'unu
// çıkaran yardımcılar. content.js bu mantığın inline kopyasını içerir; bu
// modül dev/harness için aynı kodun "import edilebilir" sürümüdür.

export const COUNTRY_TO_LOCATION = {
  "nl": { label: "Netherlands",   host: "https://fsn1-speed.hetzner.com" },
  "de": { label: "Germany",       host: "https://fsn1-speed.hetzner.com" },
  "fi": { label: "Finland",       host: "https://hel1-speed.hetzner.com" },
  "se": { label: "Sweden",        host: "https://hel1-speed.hetzner.com" },
  "gb": { label: "UK",            host: "https://speedtest.london.linode.com" },
  "uk": { label: "UK",            host: "https://speedtest.london.linode.com" },
  "fr": { label: "France",        host: "https://fsn1-speed.hetzner.com" },
  "pl": { label: "Poland",        host: "https://fsn1-speed.hetzner.com" },
  "ru": { label: "Russia",        host: "https://hel1-speed.hetzner.com" },
  "tr": { label: "Turkey",        host: "https://fsn1-speed.hetzner.com" },
  "us": { label: "USA",           host: "https://ash-speed.hetzner.com" },
  "ca": { label: "Canada",        host: "https://ash-speed.hetzner.com" },
  "sg": { label: "Singapore",     host: "https://sin-speed.hetzner.com" },
  "au": { label: "Australia",     host: "https://speedtest.sydney1.linode.com" },
  "jp": { label: "Japan",         host: "https://speedtest.tokyo2.linode.com" }
};

/**
 * Match room'da `[data-testid="matchPreference"]` ile işaretli iki kart vardır
 * (server + map). Server kartını ayırt etmek için flag image URL pattern'ini
 * kullanıyoruz (`/flags/v1/xx.jpg`).
 */
export function findServerCard(root) {
  const cards = [...root.querySelectorAll('[data-testid="matchPreference"]')];
  return cards.find((c) => c.querySelector('[src*="/flags/v1/"]')) ?? null;
}

/**
 * Flag image URL'inden country code çıkarır ve COUNTRY_TO_LOCATION map'inden
 * label + ping host'u döner.
 * @returns {{ id: string, label: string, host: string } | null}
 */
export function extractServerInfo(card) {
  const flag = card.querySelector('[src*="/flags/v1/"]');
  if (!flag) return null;
  const src = flag.getAttribute("src") || "";
  const m = src.match(/\/flags\/v1\/([a-z]{2})\.(?:jpg|png|webp)/i);
  if (!m) return null;
  const code = m[1].toLowerCase();
  const info = COUNTRY_TO_LOCATION[code];
  if (!info) return null;
  const nameEl = card.querySelector('[class*="Name-sc-"]');
  const label = nameEl?.textContent?.trim() || info.label;
  return { id: code, label, host: info.host };
}
