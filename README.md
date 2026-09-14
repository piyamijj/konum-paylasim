# Konum Paylaşım

WhatsApp tarzı, gerçek zamanlı ve **onaya dayalı** konum paylaşım web uygulaması. Bir kullanıcı ("Konum Paylaşan") benzersiz bir bağlantı oluşturur; bu bağlantıyı açan kişi ("İzleyen") konumu görüntülemek için izin ister, paylaşan kişi bu isteği onayladığında canlı konum harita üzerinde gerçek zamanlı olarak akmaya başlar.

## Özellikler

- **Rol tabanlı akış**: "Konum Paylaşan" oda oluşturur, "İzleyen" paylaşılan bağlantı üzerinden katılım isteği gönderir.
- **Onay mekanizması**: İzleyen bir isteği tetiklediğinde, paylaşan kişinin ekranında WhatsApp tarzı bir onay penceresi açılır ("X konumunuzu görmek istiyor. Onaylıyor musunuz?"). Onay verilmeden hiçbir konum verisi izleyene ulaşmaz.
- **Gerçek zamanlı konum akışı**: Tarayıcının `watchPosition` Geolocation API'si ile paylaşanın konumu sürekli güncellenir ve onaylanan izleyicilere anlık olarak iletilir.
- **Canlı harita**: Leaflet.js ve OpenStreetMap kullanılarak (API anahtarı gerektirmeden) konum, harita üzerinde canlı bir işaretçi ile gösterilir.
- **Karanlık mod tasarım**: Gece mavisi arka plan, neon yeşil ve turuncu vurgu renkleriyle temiz, mobil öncelikli bir WhatsApp benzeri kullanıcı deneyimi.
- **Tamamen Türkçe arayüz**: Tüm butonlar, uyarılar, onay pencereleri ve gezinme metinleri Türkçe'dir.
- **Sunucusuz (serverless) mimari**: Vercel üzerinde çalışmaya uygun, Pusher gerçek zamanlı altyapısı üzerinden çalışır; ayrı bir backend sunucusu veya veritabanı gerekmez.

## Nasıl Çalışır?

1. Ana sayfada **"Konum Paylaşmaya Başla"** butonuna basılır, benzersiz bir oda kimliği (UUID) oluşturulur ve `/paylas/[id]` sayfasına yönlendirilir.
2. Paylaşan kişi tarayıcısından konum izni verir; `watchPosition` ile konum takibi başlar.
3. Paylaşan kişi, oluşan `/izle/[id]` bağlantısını istediği kişiyle (WhatsApp, SMS, e-posta vb. üzerinden) paylaşır.
4. Bağlantıyı açan İzleyen, adını girip **"İzin İsteği Gönder"** butonuna basar. Bu istek Pusher üzerinden anlık olarak paylaşanın ekranına ulaşır.
5. Paylaşan kişinin ekranında bir onay penceresi belirir: *"[İsim] konumunuzu görmek istiyor. Onaylıyor musunuz?"*. Paylaşan kişi **Onayla** veya **Reddet** seçeneklerinden birini seçer.
6. Onay verilirse, İzleyen'in ekranında canlı harita açılır ve paylaşanın konumu gerçek zamanlı olarak, işaretçi hareket ettikçe güncellenerek gösterilir.
7. Paylaşan kişi istediği zaman **"Paylaşımı Sonlandır"** butonuna basarak konum akışını durdurabilir.

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Stil | Tailwind CSS |
| Harita | Leaflet.js (client-side) + OpenStreetMap tile katmanı (API anahtarı gerektirmez) |
| Gerçek zamanlı iletişim | Pusher Channels (ücretsiz katman, Vercel ile uyumlu) |
| Konum verisi | Tarayıcı Geolocation API (`navigator.geolocation.watchPosition`) |
| Barındırma | Vercel (sunucusuz fonksiyonlar) |

## Klasör Yapısı

```
src/
  app/
    page.tsx                  → Ana sayfa / oda oluşturma ekranı
    paylas/[id]/page.tsx       → Paylaşan kişinin onay + takip ekranı
    izle/[id]/page.tsx         → İzleyenin canlı harita ekranı
    api/trigger/route.ts       → Pusher olaylarını tetikleyen sunucu uç noktası
    layout.tsx, globals.css    → Genel düzen ve karanlık tema stilleri
  components/
    LiveMap.tsx                → Leaflet tabanlı canlı harita bileşeni
    ConsentModal.tsx            → Onay/izin popup bileşeni
    StatusBadge.tsx             → Bağlantı/canlı yayın durum rozeti
  lib/
    pusher-server.ts            → Sunucu tarafı Pusher istemcisi (gizli anahtar burada kullanılır)
    pusher-client.ts            → Tarayıcı tarafı Pusher istemcisi ve olay isimleri
    types.ts                    → Paylaşılan TypeScript tipleri
```

## Yerel Geliştirme Ortamı Kurulumu

### 1. Gereksinimler

- [Node.js](https://nodejs.org/) 18.17 veya üzeri
- npm (Node.js ile birlikte gelir)
- Ücretsiz bir [Pusher](https://pusher.com/) hesabı (Channels ürünü, Sandbox/ücretsiz plan yeterlidir)

### 2. Bağımlılıkları yükleyin

Proje klasörüne girip bağımlılıkları kurun:

```bash
npm install
```

### 3. Ortam değişkenlerini tanımlayın

Proje kök dizininde `.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

Ardından aşağıdaki değerleri kendi Pusher hesabınızdan alarak `.env` dosyasına girin (bkz. "Gerekli Ortam Değişkenleri" bölümü).

### 4. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlar.

> **Not:** Tarayıcı Geolocation API'si, `localhost` dışında yalnızca HTTPS bağlantılarda çalışır. Yerel geliştirmede `http://localhost:3000` üzerinden test etmek sorunsuz çalışır; ancak paylaşan ve izleyen ekranlarını aynı anda test etmek için iki farklı tarayıcı sekmesi (veya biri gizli/incognito modda) kullanmanız gerekir.

### 5. Üretim derlemesi (opsiyonel, dağıtım öncesi kontrol için)

```bash
npm run build
npm run start
```

## Gerekli Ortam Değişkenleri

Aşağıdaki değişkenler hem yerel geliştirmede (`.env` dosyasında) hem de Vercel'de (Environment Variables bölümünde) tanımlanmalıdır.

| Değişken | Açıklama | Nereden alınır |
|---|---|---|
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher uygulamanızın herkese açık anahtarı | Pusher Dashboard → App Keys → `key` |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher uygulamanızın barındırıldığı bölge kümesi (örn. `eu`, `us2`, `ap1`) | Pusher Dashboard → App Keys → `cluster` |
| `PUSHER_APP_ID` | Pusher uygulama kimliği (yalnızca sunucu tarafında kullanılır, gizli tutulmalıdır) | Pusher Dashboard → App Keys → `app_id` |
| `PUSHER_SECRET` | Pusher gizli anahtarı (yalnızca sunucu tarafında kullanılır, asla istemciye gönderilmez) | Pusher Dashboard → App Keys → `secret` |
| `NEXT_PUBLIC_APP_URL` | Uygulamanın yayınlandığı tam adres (paylaşım bağlantıları için) | Yerelde `http://localhost:3000`; Vercel'de kendi alan adınız |

### Pusher hesabı ve anahtarları nasıl alınır?

1. [pusher.com](https://pusher.com/) adresinden ücretsiz bir hesap oluşturun.
2. Dashboard'da **"Create app"** ile yeni bir Channels uygulaması oluşturun (bölge/cluster olarak size en yakın olanı seçebilirsiniz, örn. `eu`).
3. Oluşturduğunuz uygulamanın **"App Keys"** sekmesinden `app_id`, `key`, `secret` ve `cluster` değerlerini kopyalayıp yukarıdaki ortam değişkenlerine yerleştirin.
4. Ücretsiz (Sandbox) plan, bu projenin ihtiyaç duyduğu bağlantı ve mesaj hacmi için yeterlidir.

> Uygulama Supabase Realtime ile de uyumlu çalışacak şekilde tasarlanabilir; varsayılan ve önerilen yapılandırma Pusher'dır çünkü kurulumu daha basittir ve Vercel'in sunucusuz fonksiyonlarıyla doğrudan uyumludur.

## GitHub'a Yükleme ve Vercel'e Dağıtım (Adım Adım)

### Adım 1 — Projeyi GitHub'a gönderin

```bash
cd konum-paylasim
git init
git add .
git commit -m "İlk sürüm: Konum Paylaşım uygulaması"
git branch -M main
git remote add origin https://github.com/<kullanici-adiniz>/<repo-adi>.git
git push -u origin main
```

> `.env` dosyanız `.gitignore` içinde olduğu için GitHub'a **gönderilmez**; gizli anahtarlarınız güvende kalır.

### Adım 2 — Vercel hesabınızı bağlayın

1. [vercel.com](https://vercel.com/) adresine GitHub hesabınızla giriş yapın.
2. **"Add New..." → "Project"** seçeneğine tıklayın.
3. Az önce oluşturduğunuz GitHub deposunu (repo) seçip **"Import"** deyin.

### Adım 3 — Ortam değişkenlerini Vercel'e girin

Proje ayarları ekranında **"Environment Variables"** bölümüne yukarıdaki tabloda listelenen tüm değişkenleri (Pusher bilgileri ve `NEXT_PUBLIC_APP_URL`) tek tek ekleyin. `NEXT_PUBLIC_APP_URL` için henüz kesin adresi bilmiyorsanız, ilk dağıtımdan sonra Vercel'in size verdiği adresi (örn. `https://konum-paylasim.vercel.app`) girip yeniden dağıtabilirsiniz.

### Adım 4 — Dağıtın (Deploy)

**"Deploy"** butonuna basın. Vercel otomatik olarak `npm install` ve `npm run build` komutlarını çalıştırıp uygulamanızı yayına alır. İşlem birkaç dakika sürer.

### Adım 5 — Test edin

1. Vercel'in size verdiği canlı adrese (örn. `https://konum-paylasim.vercel.app`) tarayıcınızdan gidin.
2. **"Konum Paylaşmaya Başla"** ile bir oda oluşturun ve konum iznini verin.
3. Oluşan izleme bağlantısını kopyalayıp başka bir cihazda veya gizli sekmede açın.
4. İzleyen tarafında **"İzin İsteği Gönder"** dedikten sonra, paylaşan ekranında çıkan onay penceresinden **"Onayla"** seçin.
5. İzleyen ekranında canlı konumun haritada göründüğünü doğrulayın.

### Sonraki dağıtımlar

`main` dalına her `git push` yaptığınızda, Vercel projeyi otomatik olarak yeniden derleyip yayınlar — elle bir işlem yapmanıza gerek yoktur.

## Güvenlik Notu

Bu sürümde oda kanalları, tahmin edilmesi zor UUID tabanlı isimlerle herkese açık (public) Pusher kanalları olarak çalışır; erişim, bağlantının gizliliğine ve uygulama içi onay adımına dayanır. Daha yüksek güvenlik gerektiren bir üretim senaryosunda, Pusher'ın **private/presence kanalları** ve sunucu taraflı kimlik doğrulama (auth endpoint) ile bu katman güçlendirilebilir.

## Lisans

Bu proje, Piyami Polat / Cyber Project için özel olarak geliştirilmiştir.