# q-study

Tamamlayıcı Sağlık Sigortası satın alma akışı — üç adımlı bir teklif formu
(kişisel bilgiler → sağlık beyanı → plan seçimi), Next.js App Router üzerinde
geliştirilmiştir.

## Başlangıç

```bash
bun install
bun run dev
```

Ardından [http://localhost:3000](http://localhost:3000) adresini ziyaret
edebilirsiniz.

## Komutlar

| Komut                   | Açıklama                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `bun run dev`           | Geliştirme sunucusunu başlatır                             |
| `bun run build`         | Prodüksiyon derlemesi alır                                 |
| `bun run typecheck`     | Rota tipleri + `tsc --noEmit`                              |
| `bun run lint`          | ESLint denetimini çalıştırır                               |
| `bun run test`          | Vitest — uygulama ve `me-ui` CLI suite'larını çalıştırır   |
| `bun run test:coverage` | Kapsam raporu üretir; eşiğin altına düşülmesi hata verir   |
| `bun run test:e2e`      | Playwright uçtan uca testlerini çalıştırır (Chromium)      |
| `bun run format`        | Prettier ile biçimlendirir                                 |
| `bun run analyze`       | Bundle analizi üretir → `.next/analyze/*.html`             |
| `bun run ui:sync`       | `src/` içeriğini registry kopyasına aktarır                |
| `bun run ui:check`      | Registry kopyası ile kaynak arasında fark varsa hata verir |

## Ortam Değişkenleri

Değişkenlerin hiçbiri zorunlu değildir. Tanımlanmadıklarında ilgili özellik
sessizce devre dışı kalır ve uygulama çalışmayı sürdürür.

| Değişken                     | Etkisi                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_KVKK_URL`       | KVKK aydınlatma metninin adresidir. Tanımlanmadığında bildirim düz metin olarak render edilir; çalışmayan bir bağlantı sunulmaz.          |
| `NEXT_PUBLIC_WEB_VITALS_URL` | Core Web Vitals ölçümlerinin gönderileceği uç noktadır. CSP'nin `connect-src` listesine otomatik olarak eklenir.                          |
| `NEXT_PUBLIC_SITE_URL`       | `robots.txt` ve `sitemap.xml` içindeki mutlak adreslerin kökü. Ayarlanmazsa Vercel üretim host'u, o da yoksa `localhost:3000` kullanılır. |
| `ANALYZE`                    | `true` değeriyle çalıştırıldığında `build` komutu bundle raporu üretir.                                                                   |

## Güvenlik

`Content-Security-Policy` başlığı her istekte
[`src/proxy.ts`](src/proxy.ts) içinde üretilir. Nonce değeri sunucu render'ı sırasında enjekte edildiğinden
sayfa dinamik olarak render edilir; bu, başlığın her istekte yeniden
üretilebilmesi için kabul edilmiş bilinçli olarak ödün verilmiştir.

Diğer güvenlik başlıkları [`next.config.ts`](next.config.ts) dosyasında yer alır.

## Bileşen Kütüphanesi

Projedeki yeniden kullanılabilir bileşenler `src/` altında yer alır ve
[`packages/me-ui`](packages/me-ui) dizinindeki `me-ui` CLI aracıyla başka
projelere taşınabilir. Kurulum için hesap, token veya ek yapılandırma gerekmez:

```bash
npx @mahiraltinkaya/me-ui list                  # katalog
npx @mahiraltinkaya/me-ui add input             # tek bileşen
npx @mahiraltinkaya/me-ui add form-fields tckn  # bağımlılıklarıyla birlikte
npx @mahiraltinkaya/me-ui add stepper --dry-run # hangi dosyaların yazılacağını önizleyebilirsiniz
```

Bileşenler `node_modules` üzerinden import edilmez; dosyalar hedef projeye
**kopyalanır** ve o noktadan sonra projenin bir parçası hâline gelir. Bunun
doğal sonucu olarak kurulmuş bir bileşen kendiliğinden güncellenmez. Yeni
sürümün alınması için açık bir talep gerekir:

```bash
npx @mahiraltinkaya/me-ui@latest add input --overwrite
```

CLI, bileşen dosyalarını kendi npm paketi içinde taşıdığından herhangi bir yere
deploy edilmesi gerekmez. `src/` dizini tek doğruluk kaynağı olarak kalır;
yayımlanan kopya bu dizinden üretilir. CLI'ın taşıdığı bir bileşende değişiklik
yapıldıktan sonra aşağıdaki komutları çalıştırmanız beklenir:

```bash
bun run ui:sync
bun run ui:check
```

Bileşen listesi ve yayımlama adımları için
[packages/me-ui/README.md](packages/me-ui/README.md) belgesini
inceleyebilirsiniz.

## Kalite Kapıları

Kontroller hız bütçesine göre ayrılmıştır. Tamamı CI ortamında, hızlı olanlar
ayrıca commit sırasında çalıştırılır.

| Aşama        | Çalışan kontroller                              | Yaklaşık süre |
| ------------ | ----------------------------------------------- | ------------- |
| `pre-commit` | lint-staged, `ui:check`, `tsc --noEmit`, `test` | ~16 sn        |
| `pre-push`   | `lint`, `format:check`, `build`                 | ~34 sn        |
| CI           | Tamamı + kapsam eşiği + uçtan uca testler       | —             |

Uçtan uca test suite'i yalnızca CI ortamında çalıştırılır; tarayıcı indirmesi
gerektirdiği için hook bütçesine sığmamaktadır. Yerel ortamda
`bun run test:e2e` komutuyla çalıştırabilirsiniz.
