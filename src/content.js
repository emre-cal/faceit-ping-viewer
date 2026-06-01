// FACEIT match room'da server vote UI'ını izler, her server seçeneğinin yanına
// ping rozeti enjekte eder. Yeni keşfedilen sunucuları storage'a kaydeder.
//
// detector mantığı buraya inline edildi (content script'te ES module import
// çalışmıyor). dev/harness.js hâlâ src/detector.js'in modül halini kullanır.

(() => {
  const MATCH_URL_PATTERN = /\/(en|tr|[a-z]{2})\/cs2\/room\//i;
  const BADGE_CLASS = "fpv-badge";
  const REFRESH_INTERVAL_SEC = 3;
  const MAX_MEASUREMENTS = 5;
  // Opaque fetch DNS+TCP+TLS handshake overhead'i içerir. Empirik olarak
  // HTTP RTT ≈ oyun pingi × 3.4 (kullanıcı: terminal 50ms, biz 170ms).
  // Storage'a ham değer; ekranda dönüştürülmüş oyun pingi.
  const HTTP_TO_GAME_RATIO = 3.4;

  function estimatedPing(httpRtt) {
    return httpRtt == null ? null : Math.round(httpRtt / HTTP_TO_GAME_RATIO);
  }

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
    // ms = tahmini oyun pingi (HTTP RTT / 3.4)
    if (ms == null) return "fpv-fail";
    if (ms < 40)  return "fpv-good";   // <40ms — mükemmel
    if (ms < 80)  return "fpv-mid";    // 40-80ms — kabul edilebilir
    return "fpv-bad";                   // >80ms — kötü
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function makeProgressRing() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "fpv-progress");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    const track = document.createElementNS(SVG_NS, "circle");
    track.setAttribute("cx", "8"); track.setAttribute("cy", "8"); track.setAttribute("r", "6");
    track.setAttribute("class", "fpv-progress-track");
    const fill = document.createElementNS(SVG_NS, "circle");
    fill.setAttribute("cx", "8"); fill.setAttribute("cy", "8"); fill.setAttribute("r", "6");
    fill.setAttribute("class", "fpv-progress-fill");
    fill.setAttribute("transform", "rotate(-90 8 8)"); // SVG attribute — pixel-explicit origin
    svg.append(track, fill);
    return svg;
  }

  function attachBadge(targetEl, ping, withProgress) {
    let badge = targetEl.querySelector(`:scope .${BADGE_CLASS}`);
    if (!badge) {
      badge = document.createElement("span");
      badge.className = BADGE_CLASS;
      const holder = targetEl.querySelector(".styles__HolderDiv-sc-380ea27-1") || targetEl;
      holder.appendChild(badge);
    }
    const est = estimatedPing(ping);
    badge.classList.remove("fpv-good", "fpv-mid", "fpv-bad", "fpv-fail");
    badge.classList.add(classifyPing(est));

    const pingText = est == null ? "— ms" : `${est} ms`;
    badge.textContent = pingText;
    if (withProgress) badge.appendChild(makeProgressRing());
  }

  let lastPing = null;

  async function measureAndDecorate(card, info, isLast) {
    const { ping } = await chrome.runtime.sendMessage({
      type: "measureOne", id: info.id, host: info.host
    });
    lastPing = ping;
    attachBadge(card, ping, !isLast); // son ölçümde progress ring olmasın
  }

  async function discoverAndMeasure(isLast) {
    const card = findServerCard(document);
    if (!card) {
      console.debug("[fpv] scan: server preference card bulunamadı");
      return null;
    }
    const info = extractServerInfo(card);
    if (!info) return null;
    await chrome.runtime.sendMessage({ type: "discoverServer", server: info });
    await measureAndDecorate(card, info, isLast);
    return { card, info };
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────
  let tickTimer = null;
  let measurementCount = 0;
  let lastCard = null;

  async function runMeasurement() {
    const isLast = measurementCount + 1 >= MAX_MEASUREMENTS;
    const result = await discoverAndMeasure(isLast);
    if (result) {
      lastCard = result.card;
      measurementCount++;
      console.log(`[fpv] ölçüm #${measurementCount}/${MAX_MEASUREMENTS} = ${lastPing}ms`);
      if (measurementCount >= MAX_MEASUREMENTS) {
        clearInterval(tickTimer);
        tickTimer = null;
      }
    }
  }

  function startScanning() {
    if (tickTimer) return;
    console.log(`[fpv] scan başladı (en fazla ${MAX_MEASUREMENTS} ölçüm, ${REFRESH_INTERVAL_SEC}sn arayla)`);
    measurementCount = 0;
    runMeasurement(); // ilk ölçüm hemen
    tickTimer = setInterval(runMeasurement, REFRESH_INTERVAL_SEC * 1000);
  }

  function stopScanning() {
    clearInterval(tickTimer);
    tickTimer = null;
    measurementCount = 0;
    lastCard = null;
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
    }
    // URL aynı kaldıkça tick timer'ı zaten 3sn'de bir ölçüm yapıyor;
    // DOM değişimi için ek bir tetik yok (gereksiz ping atmamak için)
  }).observe(document.body, { childList: true, subtree: true });

  onUrlChange();
})();
