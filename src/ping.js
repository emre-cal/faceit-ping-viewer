// Tek bir host'a ping ölçer. Tarayıcı ICMP atamadığı için HTTP RTT'sini
// proxy olarak kullanıyoruz. Strateji:
//   1) fetch GET no-cors başlat
//   2) Response header geldiği anda (fetch promise resolve olur) zamanı al
//   3) AbortController ile body indirilmesini iptal et
//   4) İlk ölçüm (warm-up) handshake nedeniyle yavaş; min-of-N ile elenir
//   5) Sonraki ölçümler aynı TCP+TLS connection'ı keep-alive ile kullanır →
//      gerçek ICMP pinge çok yakın değer
//
// Neden fetch+abort (Image() değil):
//   - Image().onerror tam body indirildikten sonra ateşlenir → body size kadar
//     gecikme. fetch+abort response header'da resolve olur, body geçilir.
//   - fetch tarayıcı connection pool'una uyumlu; Image()'in bağlantı reuse
//     davranışı Chrome'da bazen güvenilmez.

const TIMEOUT_MS = 3000;
const SAMPLES = 3;

function pingOnce(host) {
  return new Promise((resolve) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      ctrl.abort();
      resolve(null);
    }, TIMEOUT_MS);

    const url = `${host}/?_=${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const t0 = performance.now();

    fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
      redirect: "follow"
    })
      .then(() => {
        clearTimeout(timer);
        const rtt = performance.now() - t0;
        ctrl.abort(); // body indirilmesini iptal et
        resolve(rtt);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

/**
 * @param {string} host
 * @returns {Promise<number|null>}
 */
export async function measurePing(host) {
  const samples = [];
  for (let i = 0; i < SAMPLES + 1; i++) {
    const rtt = await pingOnce(host);
    if (i > 0 && rtt != null) samples.push(rtt); // ilk = warm-up
  }
  if (samples.length === 0) return null;
  return Math.round(Math.min(...samples));
}
