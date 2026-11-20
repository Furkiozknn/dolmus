# Değişiklik günlüğü

## v2.1 · Kasım 2026

Yenilikler
- **Yenilikler penceresi ve sürüm etiketi:** açılış ekranında `v2.1 · Kasım 2026` ve "Yenilikler" düğmesi. Pencere güncelleme notlarını, rekor tablosunu ve rozetleri gösterir (TR/EN).
- **Yerel rekor tablosu:** bitirdiğin en iyi 5 vardiya (net TL, yıldız, seviye, tarih) bu cihazda `arena.dolmus.board` anahtarında saklanır.
- **Rozetler:** Kusursuz vardiya (çarpışma, kırmızıda geçme ve sert fren yok), Üç yıldız, Islak yol ustası (3, 5 ya da 8. seviyeyi çarpmadan bitir), Günün vardiyası, Hat veteranı (10 vardiya). Yeni rozet vardiya özetinde görünür. Anahtar: `arena.dolmus.rozet`.
- **Diğer oyunlar:** açılış ekranının altında https://furkiozknn.github.io/ bağlantısı.

Sayfa
- Türkçe sayfa açıklaması, `og:locale`, Twitter kartı (başlık, açıklama, görsel), canonical bağlantı, paylaşım görseli için alternatif metin.
- Türkçe `404.html` (oyuna ve diğer oyunlara dönüş düğmeleri).

Kod ve test
- `test/duman.mjs`: hızlı duman testi (sayfa açılıyor, konsol hatası yok, oyun başlıyor, gaz/duraklatma, bot bir vardiya bitiriyor, telefonda taşma yok).
- Mevcut kayıt anahtarları (`arena.dolmus.save`, `arena.dolmus.settings`) ve oynanış değişmedi; eski kayıtla açılış çalışır.

## v2.0 · Ekim 2026
- Üç-iki-bir başlangıç, koçlu ilk durak, "Müsait bir yerde" inişleri, ücret zinciri, yolcu çeşitliliği (ayrıntı: README, "v2 update").
