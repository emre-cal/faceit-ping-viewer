const listEl = document.getElementById("list");
const btn = document.getElementById("refresh");

function cls(ms) {
  if (ms == null) return "fail";
  if (ms < 40) return "good";
  if (ms < 90) return "mid";
  return "bad";
}

function relTime(ts) {
  if (!ts) return "—";
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
  return `${Math.floor(diff / 86400)}g önce`;
}

function render(servers) {
  if (!servers.length) {
    listEl.innerHTML = `<li class="empty">Henüz bir maça girilmedi</li>`;
    return;
  }
  listEl.innerHTML = servers
    .sort((a, b) => (a.lastPing ?? 9999) - (b.lastPing ?? 9999))
    .map((s) => `
      <li>
        <div class="label">
          <div>${s.label}</div>
          <div class="meta">${s.seenCount}× görüldü · ${relTime(s.lastPingAt)}</div>
        </div>
        <span class="ping ${cls(s.lastPing)}">${s.lastPing == null ? "—" : s.lastPing + " ms"}</span>
      </li>`)
    .join("");
}

async function load() {
  const { servers } = await chrome.runtime.sendMessage({ type: "getServers" });
  render(servers ?? []);
}

async function measure() {
  listEl.innerHTML = `<li class="empty">Ölçülüyor…</li>`;
  const { results } = await chrome.runtime.sendMessage({ type: "measureAll" });
  render(results ?? []);
}

btn.addEventListener("click", measure);
load();
