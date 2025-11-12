# System Patterns

## Sistem Mimarisi

### Genel Mimari Yapı
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │  Context │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       └─────────────┴─────────────┘                     │
│                     │                                    │
│              ┌──────┴──────┐                            │
│              │  API Layer  │                            │
│              └──────┬──────┘                            │
└─────────────────────┼────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      │
┌─────────────────────┼────────────────────────────────────┐
│                     ▼                                    │
│              Backend API                                 │
│         (JWT Authentication)                             │
│                     │                                    │
│              ┌──────┴──────┐                            │
│              │  SAP B1 API │                            │
│              └─────────────┘                            │
└──────────────────────────────────────────────────────────┘
```

### Klasör Yapısı
```
src/
├── api/                    # API çağrıları ve servisler
│   ├── auth.service.tsx    # Kimlik doğrulama servisi
│   ├── httpClient.service.tsx  # HTTP client wrapper
│   └── customFetch.tsx     # Özelleştirilmiş fetch fonksiyonu
│
├── auth/                   # Kimlik doğrulama ve yetkilendirme
│   └── ProtectedRoute.tsx  # Rol bazlı route koruması
│
├── components/             # Yeniden kullanılabilir bileşenler
│   ├── ui/                 # Temel UI bileşenleri (shadcn/ui)
│   ├── ItemSelectionDialog.tsx     # Malzeme seçim dialogu
│   ├── VendorSelectionDialog.tsx   # Tedarikçi seçim dialogu
│   ├── UserSelectionDialog.tsx     # Kullanıcı seçim dialogu
│   ├── SAPDateInput.tsx    # SAP format tarih inputu
│   ├── Sidebar.tsx         # Ana navigasyon sidebar
│   └── TalepEkleme.tsx     # Talep ekleme komponenti
│
├── constants/              # Sabitler ve yapılandırmalar
│   └── API_Routes.tsx      # API endpoint tanımları
│
├── context/                # React Context API
│   ├── UserContex.tsx      # Kullanıcı durumu yönetimi
│   ├── ui/UIContext.tsx    # UI durumu (spinner, toast)
│   └── index.tsx           # Context provider wrapper
│
├── lib/                    # Yardımcı fonksiyonlar
│   ├── decodeJwt.tsx       # JWT çözümleme
│   ├── handleTokenAndSettUser.tsx  # Token ve kullanıcı yönetimi
│   ├── logout.ts           # Çıkış işlemi
│   ├── formatDate.ts       # Tarih formatlama
│   └── fileToBase64.ts     # Dosya dönüştürme
│
├── pages/                  # Sayfa bileşenleri
│   ├── Login.tsx           # Giriş sayfası
│   ├── TalepListesi.tsx    # Talep listesi sayfası
│   ├── Admin.tsx           # Admin paneli
│   └── Home.tsx            # Ana sayfa
│
├── types/                  # TypeScript tip tanımları
│   ├── user.tsx            # Kullanıcı tipleri
│   ├── company.tsx         # Şirket tipleri
│   ├── PurchaseRequest.tsx # Satınalma talebi tipleri
│   └── CurrentUser.tsx     # Aktif kullanıcı tipi
│
├── App.tsx                 # Ana uygulama komponenti
└── main.tsx                # Uygulama giriş noktası
```

## Temel Tasarım Desenleri

### 1. Bileşen Desenleri

#### Compound Component Pattern
Dialog bileşenleri Radix UI'ın compound component desenini kullanır:
```typescript
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
    <DialogFooter />
  </DialogContent>
</Dialog>
```

#### Composition Pattern
Sidebar ve sayfa yapısı composition desenini kullanır:
- Sidebar + Ana İçerik alanı
- Yeniden kullanılabilir bileşenler

### 2. State Yönetimi

#### Context API Kullanımı
**UserContext:**
- Kullanıcı bilgilerini global olarak saklar
- JWT token'dan çözümlenen kullanıcı verileri
- Rol bazlı yetkilendirme kontrolü

**UIContext:**
- Spinner (loading) durumu
- Toast bildirimleri
- Global UI durumları

#### Local State
- Form verileri için useState
- Modal/Dialog açık/kapalı durumları
- Sayfalama ve filtreleme durumları

### 3. Kimlik Doğrulama Deseni

```typescript
// Token kontrolü ve kullanıcı ayarlama
localStorage.getItem("bearer") → JWT Token
    ↓
decodeJwt(token) → User Info
    ↓
setUser(userInfo) → Context'e kaydet
    ↓
ProtectedRoute → Rol kontrolü
```

**Token Yenileme:**
- Her API çağrısında token kontrolü
- Süre dolmuşsa otomatik logout
- `handleTokenAndSetUserNotLogin` fonksiyonu ile token yenileme

### 4. API Çağrı Deseni

**HttpClient Service:**
```typescript
class HttpClient {
  async get<T>(url: string): Promise<T>
  async post<T>(url: string, data: any): Promise<T>
  async put<T>(url: string, data: any): Promise<T>
  async delete<T>(url: string): Promise<T>
}
```

**Kullanım:**
```typescript
const response = await HttpClient.get<PurchaseRequest[]>(
  GetAllPurchaseRequestUrl
)
```

**Mock API (Development):**
- json-server ile mock backend (mock-api/server.cjs)
- Gerçek API formatına uyumlu response'lar
- Authentication endpoint: `/api/Auth/Login`
  - Response: `{ accessToken, userId, user: {...} }`
  - JWT Token payload: sub, userName, email, NameLastName, SAPSessionID, roles
- Items endpoint: `/api/items` (unitOfMeasurementGroup desteği)

### 5. Routing ve Koruma

**Route Yapısı:**
```
/ → redirect to /talep-listesi
/login → Public
/talep-listesi → Protected (user, admin, Purchaser)
/talep-olustur → Protected (user, admin, Purchaser)
/admin → Protected (admin only)
```

**ProtectedRoute Komponenti:**
- Rol bazlı erişim kontrolü
- JWT token kontrolü
- Yetkisiz erişimde /unauthorized'a yönlendirme

## Kritik İşlem Akışları

### 1. Talep Oluşturma Akışı

```
1. TalepEkleme Komponenti
   ↓
2. Form Doldurma
   - Başlık bilgileri (tarih, aciliyet, vs.)
   - Satır ekleme (ItemSelectionDialog)
   - Tedarikçi seçimi (VendorSelectionDialog)
   - Dosya yükleme
   ↓
3. Validasyon
   - Zorunlu alanlar kontrolü
   - Tarih formatı kontrolü
   - Dosya boyutu kontrolü
   ↓
4. Data Preparation
   - SAP formatına dönüştürme
   - Base64 dosya encoding
   - DocumentLines array oluşturma
   ↓
5. API Call
   - CreatePurchaseRequestUrl
   - POST isteği
   ↓
6. Response Handling
   - Başarılı: Talep listesine yönlendirme
   - Hata: Toast ile hata mesajı
```

### 2. Talep Güncelleme Akışı

```
1. TalepListesi'nden detay görüntüleme
   ↓
2. Durum kontrolü
   - "Revize İstendi" ise düzenleme butonu aktif
   ↓
3. TalepEkleme'ye yönlendirme
   - location.state ile data taşıma
   ↓
4. Form doldurma (mevcut verilerle)
   ↓
5. Güncelleme
   - UpdatePurchaseRequestUrl
   - PUT isteği
```

### 3. Excel Export Akışı

```
1. TalepListesi sayfasında "Excel'e Aktar" butonu
   ↓
2. Mevcut veya filtrelenmiş verileri al
   ↓
3. ExcelJS ile workbook oluştur
   ↓
4. Her kolon için header ve data ekle
   - 21 kolon (tüm detaylar)
   - Kolon genişlikleri optimize
   ↓
5. Dosya indir
   - Otomatik tarih ile dosya adı
   - "Satinalma_Talepleri_DD.MM.YYYY.xlsx"
```

## Bileşen İlişkileri

### Ana Bileşen Hiyerarşisi

```
App
├── Router
│   ├── Login
│   │   └── Carousel (Ken Burns Effect)
│   │
│   └── ProtectedRoute
│       ├── TalepListesi
│       │   ├── Sidebar
│       │   ├── Search & Filters
│       │   ├── Table
│       │   │   └── Pagination
│       │   └── DetailDialog
│       │       ├── Request Info
│       │       ├── Items Table
│       │       └── File Download
│       │
│       ├── TalepEkleme
│       │   ├── Sidebar
│       │   ├── Header Form
│       │   ├── Items Table
│       │   │   ├── ItemSelectionDialog
│       │   │   ├── VendorSelectionDialog
│       │   │   └── UserSelectionDialog
│       │   └── Submit Button
│       │
│       └── Admin
│           └── Admin Panel Components
```

## SAP Veri Yapısı Eşleşmesi

### OPRQ (Header) → PurchaseRequest
```typescript
import { RequestItem } from "./RequestItem"

export type PurchaseRequest = {
    docEntry: number
    // id: number
  docNum: string
  // documentNumber: string
  docDate?: string
  // documentDate?: string
  
  requriedDate?: string
  // requiredDate?: string

  docDueDate:string;
  // validityDate?: string

  // taxDate?: string

  requester: string

  requesterRole?: string

  department: string

  createdDate: string

  itemCount: number

  u_TalepDurum : RequestStatus
  u_AcilMi?: boolean
  u_TalepOzeti?: string
  lines?: RequestItem[]
  comments?: string
}
```

### PRQ1 (Line Items) → RequestItem
```typescript
export type RequestItem = {
  docEntry: number
  departman: string
  itemCode: string
  itemName: string
  requiredDate: string
  quantity: string
  uomCode: string
  vendor: string
  description: string
  file: File | null
  fileData?: {
    name: string
    content: string
    type: string
  }
  isDummy?: boolean
}
```

## Önemli Teknik Kararlar

### 1. Tarih Formatı
- **UI Format:** DD/MM/YYYY
- **SAP Format:** YYYYMMDD
- **Conversion:** formatSapDate() ve toDate() fonksiyonları

### 2. Dosya Yönetimi
- **Upload:** File object → Base64 encoding
- **Download:** Base64 string → Blob → Download
- **Storage:** Backend'de base64 string olarak saklanıyor

### 3. State Persistence
- **JWT Token:** localStorage
- **User Data:** Context (session bazlı)
- **Form Data:** Component state (kaybolabilir)

### 4. Error Handling
- **API Errors:** Try-catch + Toast bildirimi
- **Token Expire:** Otomatik logout + login'e yönlendirme
- **Validation Errors:** Form level validation + kullanıcıya bildirim

### 5. Responsive Design
- **Mobile:** Sidebar collapse, simplified table
- **Tablet:** Optimized layout
- **Desktop:** Full feature set

## Performance Optimizasyonları

1. **Lazy Loading:** Route bazlı code splitting
2. **Memoization:** useMemo for filtered data
3. **Pagination:** Büyük veri setleri için sayfalama
4. **Debouncing:** Search input için (planlanıyor)
5. **Image Optimization:** Carousel görselleri optimize edilmiş
