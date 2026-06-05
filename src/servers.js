// FACEIT'in CS2 maçlarında bilinen oyun sunucusu lokasyonları için seed listesi.
// Kullanıcı bir maça girdiğinde DOM'dan bulunanlar storage'a eklenir ve zamanla
// bu liste kullanıcıya özel hale gelir. Aşağıdaki seed sadece "boş başlangıç"
// deneyimi için — kullanıcı henüz hiç maç görmemişse de bir şeyler göstermek.
// host değerleri content.js'teki ölçüm map'iyle birebir aynı Hetzner/Linode
// speed-test endpoint'leri — manifest host_permissions'ta tanımlı olanlar.
export const SEED_SERVERS = [
  { id: "eu-helsinki",  label: "EU - Helsinki",  host: "https://hel1-speed.hetzner.com" },
  { id: "eu-frankfurt", label: "EU - Frankfurt", host: "https://fsn1-speed.hetzner.com" },
  { id: "eu-stockholm", label: "EU - Stockholm", host: "https://hel1-speed.hetzner.com" }
];
