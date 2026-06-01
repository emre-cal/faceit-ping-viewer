// Tek bir host'a ping ölçer. Tarayıcı ICMP atamadığı için HTTP RTT'sini
// proxy olarak kullanıyoruz. measurePing(host) ms cinsinden sayı döndürmeli,
// hata/timeout durumunda null dönmeli.
//
// Yaklaşımlar (artıları/eksileri):
//
//   1) fetch + HEAD, no-cors, cache: 'no-store'
//      + Basit, CORS preflight gerektirmez.
//      - İlk istekte DNS + TCP + TLS handshake gecikmesi de ölçüme dahil olur.
//      - "Soğuk" ölçüm sonra "sıcak" ölçüm yapıp en küçüğü almak (best-of-N)
//        sadece gerçek RTT'ye yaklaştırır.
//
//   2) Image() load timing
//      + Cache'lenmemiş 1x1 image ile basit bir RTT proxy'si.
//      - HEAD'den daha az hassas, hata ayrımı yapmak zor.
//
//   3) WebRTC ICE candidate / STUN RTT
//      + UDP üzerinden gerçek RTT'ye en yakın değer.
//      - Çok daha karmaşık; STUN sunucularına ihtiyaç var.
//
// Önerilen: (1) — best-of-N ölçümle warm RTT'yi yakalamak.
//
// Şunu da düşünün:
//   * AbortController ile timeout (sunucu yanıt vermezse N saniye sonra iptal)
//   * Birden fazla ölçüm alıp min (veya median) almak (jitter'a karşı)
//   * Aynı host için "warm-up" isteği yapıp ilk ölçümü atmak

const TIMEOUT_MS = 3000;
const SAMPLES = 3;

/**
 * @param {string} host  Örn. "https://helsinki.faceit-cdn.net"
 * @returns {Promise<number|null>}  ms cinsinden ping, başarısızsa null
 */
export async function measurePing(host) {
  const samples = [];
  for (let i = 0; i < SAMPLES + 1; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const cacheBuster = `${host}/?_=${Date.now()}-${i}`;
    const t0 = performance.now();
    try {
      await fetch(cacheBuster, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
        redirect: "follow"
      });
      const rtt = performance.now() - t0;
      if (i > 0) samples.push(rtt); // ilk ölçümü warm-up olarak at
    } catch {
      if (i > 0) samples.push(null);
    } finally {
      clearTimeout(timer);
    }
  }
  const valid = samples.filter((v) => v != null);
  if (valid.length === 0) return null;
  return Math.round(Math.min(...valid));
}
