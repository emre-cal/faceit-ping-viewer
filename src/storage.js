// chrome.storage.local üzerinde sunucu geçmişini yöneten ince bir wrapper.
//
// Şema:
//   servers: {
//     [id: string]: {
//       id:        string,   // stabil key (örn. "helsinki" veya "185.180.12.7")
//       label:     string,   // UI'da gösterilecek isim ("EU - Helsinki")
//       host:      string,   // ping atılacak endpoint (https://... veya host:port)
//       firstSeen: number,   // unix ms
//       lastSeen:  number,   // unix ms
//       seenCount: number,   // kaç maçta karşılaşıldı
//       lastPing:  number|null,
//       lastPingAt:number|null
//     }
//   }

const KEY = "servers";

export async function getServers() {
  const { [KEY]: servers = {} } = await chrome.storage.local.get(KEY);
  return servers;
}

export async function getServerList() {
  const servers = await getServers();
  return Object.values(servers);
}

/**
 * Yeni bir sunucu keşfedildiğinde veya tekrar görüldüğünde çağrılır.
 * Mevcutsa lastSeen/seenCount güncellenir, yoksa eklenir.
 */
export async function upsertServer({ id, label, host }) {
  const servers = await getServers();
  const now = Date.now();
  const existing = servers[id];
  servers[id] = existing
    ? { ...existing, label, host, lastSeen: now, seenCount: existing.seenCount + 1 }
    : { id, label, host, firstSeen: now, lastSeen: now, seenCount: 1, lastPing: null, lastPingAt: null };
  await chrome.storage.local.set({ [KEY]: servers });
  return servers[id];
}

export async function updatePing(id, ping) {
  const servers = await getServers();
  if (!servers[id]) return;
  servers[id].lastPing = ping;
  servers[id].lastPingAt = Date.now();
  await chrome.storage.local.set({ [KEY]: servers });
}

export async function removeServer(id) {
  const servers = await getServers();
  delete servers[id];
  await chrome.storage.local.set({ [KEY]: servers });
}
