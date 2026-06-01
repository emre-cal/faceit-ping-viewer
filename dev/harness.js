// Fixture sayfasında detector.js'i extension kurulumu olmadan test eder.
// chrome.runtime'ı mock'lar; ping ölçümünü gerçek olarak yapar (HEAD fetch).

import { findServerVoteOptions, extractServerInfo } from "../src/detector.js";
import { measurePing } from "../src/ping.js";

function classify(ms) {
  if (ms == null) return "fpv-fail";
  if (ms < 40) return "fpv-good";
  if (ms < 90) return "fpv-mid";
  return "fpv-bad";
}

async function run() {
  document.querySelectorAll(".fpv-badge").forEach((b) => b.remove());

  const options = findServerVoteOptions(document);
  console.log(`[harness] ${options.length} server vote option bulundu`);

  if (!options.length) {
    console.warn("[harness] Detector hiçbir element bulamadı. findServerVoteOptions() içindeki selector'ı kontrol et.");
    return;
  }

  for (const el of options) {
    const info = extractServerInfo(el);
    if (!info) {
      console.warn("[harness] extractServerInfo null döndü:", el);
      continue;
    }
    console.log("[harness] keşfedildi:", info);

    const badge = document.createElement("span");
    badge.className = "fpv-badge fpv-fail";
    badge.textContent = "… ms";
    el.appendChild(badge);

    measurePing(info.host).then((ping) => {
      badge.className = `fpv-badge ${classify(ping)}`;
      badge.textContent = ping == null ? "— ms" : `${ping} ms`;
    });
  }
}

document.getElementById("rerun").addEventListener("click", run);
run();
