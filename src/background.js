import { SEED_SERVERS } from "./servers.js";
import { measurePing } from "./ping.js";
import { getServerList, upsertServer, updatePing } from "./storage.js";

// İlk kurulumda seed sunucuları storage'a ekle.
chrome.runtime.onInstalled.addListener(async () => {
  for (const s of SEED_SERVERS) await upsertServer(s);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    switch (msg?.type) {
      case "measureAll": {
        const servers = await getServerList();
        const results = await Promise.all(
          servers.map(async (s) => {
            const ping = await measurePing(s.host);
            await updatePing(s.id, ping);
            return { ...s, lastPing: ping, lastPingAt: Date.now() };
          })
        );
        sendResponse({ results });
        break;
      }
      case "measureOne": {
        const ping = await measurePing(msg.host);
        if (msg.id) await updatePing(msg.id, ping);
        sendResponse({ ping });
        break;
      }
      case "discoverServer": {
        // content script yeni bir sunucu keşfedince çağırır
        const saved = await upsertServer(msg.server);
        sendResponse({ saved });
        break;
      }
      case "getServers": {
        sendResponse({ servers: await getServerList() });
        break;
      }
    }
  })();
  return true; // async sendResponse
});
