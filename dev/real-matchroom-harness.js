// Gerçek FACEIT DOM'una karşı detector + ping + progress ring testi.

import { findServerCard, extractServerInfo, COUNTRY_TO_LOCATION } from "../src/detector.js";
import { measurePing } from "../src/ping.js";

const REFRESH_INTERVAL_SEC = 3;
const MAX_MEASUREMENTS = 5;
const HTTP_TO_GAME_RATIO = 3.4;
const SVG_NS = "http://www.w3.org/2000/svg"; // önce tanımla — TDZ'den kaçın
const estimate = (rtt) => rtt == null ? null : Math.round(rtt / HTTP_TO_GAME_RATIO);

const out = document.getElementById("results");
const log = (msg) => { out.textContent += msg + "\n"; };
out.textContent = "";

const card = findServerCard(document);
const info = card ? extractServerInfo(card) : null;
let _lastPing = null;

if (!card || !info) {
  log("❌ Server card veya bilgisi bulunamadı");
} else {
  log(`✓ Server bulundu: ${info.label} (${info.id})  →  ${info.host}`);
  log(`✓ En fazla ${MAX_MEASUREMENTS} ölçüm, her ${REFRESH_INTERVAL_SEC}sn'de bir\n`);

  let measurements = 0;
  let timer = null;

  attachBadge(null, true);

  async function measure() {
    const t0 = performance.now();
    const ping = await measurePing(info.host);
    const elapsed = Math.round(performance.now() - t0);
    const est = estimate(ping);
    measurements++;
    const stamp = new Date().toLocaleTimeString();
    log(`#${measurements}/${MAX_MEASUREMENTS}  ${stamp}  oyun pingi=${est ?? "—"}ms  (HTTP=${ping ?? "fail"}ms, ölçüm ${elapsed}ms)`);

    const isLast = measurements >= MAX_MEASUREMENTS;
    attachBadge(ping, !isLast);
    if (isLast) {
      clearInterval(timer);
      log("\n✅ 5 ölçüm tamamlandı, halka durdu");
    }
  }

  measure(); // ilk ölçüm hemen
  timer = setInterval(measure, REFRESH_INTERVAL_SEC * 1000);
}

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
  fill.setAttribute("transform", "rotate(-90 8 8)");
  svg.append(track, fill);
  return svg;
}

function attachBadge(ping, withProgress) {
  if (ping !== null) _lastPing = ping;
  let badge = card.querySelector(".fpv-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "fpv-badge";
    const holder = card.querySelector(".styles__HolderDiv-sc-380ea27-1") || card;
    holder.appendChild(badge);
  }
  const est = estimate(_lastPing);
  badge.classList.remove("fpv-good", "fpv-mid", "fpv-bad", "fpv-fail");
  badge.classList.add(classify(est));
  badge.textContent = est == null ? "— ms" : `${est} ms`;
  if (withProgress) badge.appendChild(makeProgressRing());
}

function classify(ms) {
  if (ms == null) return "fpv-fail";
  if (ms < 40) return "fpv-good";
  if (ms < 80) return "fpv-mid";
  return "fpv-bad";
}
