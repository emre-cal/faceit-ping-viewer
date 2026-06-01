// FACEIT match room'da server vote UI'ını izler, her server seçeneğinin yanına
// ping rozeti enjekte eder. Yeni keşfedilen sunucuları storage'a kaydeder.
//
// detector mantığı buraya inline edildi (content script'te ES module import
// çalışmıyor). dev/harness.js hâlâ src/detector.js'in modül halini kullanır.

(() => {
  const MATCH_URL_PATTERN = /\/(en|tr|[a-z]{2})\/cs2\/room\//i;
  const BADGE_CLASS = "fpv-badge";
  const REFRESH_INTERVAL_MS = 10_000;

  // ─── Detector ────────────────────────────────────────────────────────────
  // FACEIT matchmaking server vote vermez; sistem otomatik bir ülke seçer ve
  // "Server" preference card'ında gösterir. Detector bu kartı bulup country
  // code'unu flag image URL'inden ('/flags/v1/nl.jpg' → "nl") çıkarır.
  const COUNTRY_TO_LOCATION = {
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

  function findServerCard(root) {
    const cards = [...root.querySelectorAll('[data-testid="matchPreference"]')];
    return cards.find((c) => c.querySelector('[src*="/flags/v1/"]')) ?? null;
  }

  function extractServerInfo(card) {
    const flag = card.querySelector('[src*="/flags/v1/"]');
    if (!flag) return null;
    const src = flag.getAttribute("src") || "";
    const m = src.match(/\/flags\/v1\/([a-z]{2})\.(?:jpg|png|webp)/i);
    if (!m) return null;
    const code = m[1].toLowerCase();
    const info = COUNTRY_TO_LOCATION[code];
    if (!info) {
      console.debug(`[fpv] bilinmeyen ülke kodu: "${code}"`);
      return null;
    }
    const nameEl = card.querySelector('[class*="Name-sc-"]');
    const label = nameEl?.textContent?.trim() || info.label;
    return { id: code, label, host: info.host };
  }

  // ─── UI ──────────────────────────────────────────────────────────────────
  function classifyPing(ms) {
    if (ms == null) return "fpv-fail";
    if (ms < 40)  return "fpv-good";
    if (ms < 90)  return "fpv-mid";
    return "fpv-bad";
  }

  function attachBadge(targetEl, ping) {
    let badge = targetEl.querySelector(`:scope > .${BADGE_CLASS}`);
    if (!badge) {
      badge = document.createElement("span");
      badge.className = BADGE_CLASS;
      targetEl.appendChild(badge);
    }
    badge.classList.remove("fpv-good", "fpv-mid", "fpv-bad", "fpv-fail");
    badge.classList.add(classifyPing(ping));
    badge.textContent = ping == null ? "— ms" : `${ping} ms`;
  }

  async function pingAndDecorate(el, server) {
    const { ping } = await chrome.runtime.sendMessage({
      type: "measureOne", id: server.id, host: server.host
    });
    attachBadge(el, ping);
  }

  async function scanAndDecorate() {
    const card = findServerCard(document);
    if (!card) {
      console.debug("[fpv] scan: server preference card bulunamadı");
      return;
    }
    const info = extractServerInfo(card);
    if (!info) {
      console.debug("[fpv] scan: server card bulundu ama bilgi çıkarılamadı");
      return;
    }
    console.log(`[fpv] scan: server = ${info.label} (${info.id})`);
    await chrome.runtime.sendMessage({ type: "discoverServer", server: info });
    pingAndDecorate(card, info);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────
  let scanTimer = null;
  function startScanning() {
    if (scanTimer) return;
    scanAndDecorate();
    scanTimer = setInterval(scanAndDecorate, REFRESH_INTERVAL_MS);
  }
  function stopScanning() {
    clearInterval(scanTimer);
    scanTimer = null;
    document.querySelectorAll(`.${BADGE_CLASS}`).forEach((b) => b.remove());
  }

  function onUrlChange() {
    const isMatch = MATCH_URL_PATTERN.test(location.pathname);
    console.log(`[fpv] URL=${location.pathname} match=${isMatch}`);
    if (isMatch) startScanning();
    else stopScanning();
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      onUrlChange();
    } else if (scanTimer) {
      scanAndDecorate();
    }
  }).observe(document.body, { childList: true, subtree: true });

  onUrlChange();
})();
