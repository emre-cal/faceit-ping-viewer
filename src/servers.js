// FACEIT'in CS2 maçlarında bilinen oyun sunucusu lokasyonları için seed listesi.
// Kullanıcı bir maça girdiğinde DOM'dan bulunanlar storage'a eklenir ve zamanla
// bu liste kullanıcıya özel hale gelir. Aşağıdaki seed sadece "boş başlangıç"
// deneyimi için — kullanıcı henüz hiç maç görmemişse de bir şeyler göstermek.
export const SEED_SERVERS = [
  { id: "eu-helsinki",  label: "EU - Helsinki",  host: "https://helsinki.faceit-cdn.net" },
  { id: "eu-stockholm", label: "EU - Stockholm", host: "https://stockholm.faceit-cdn.net" },
  { id: "eu-frankfurt", label: "EU - Frankfurt", host: "https://frankfurt.faceit-cdn.net" }
];
