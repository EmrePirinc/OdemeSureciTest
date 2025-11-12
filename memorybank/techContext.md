# Tech Context

## Teknoloji Stack'i

### Frontend Core
- **React 18.3.1**: UI framework
- **TypeScript 5.6.3**: Tip güvenliği ve geliştirici deneyimi
- **Vite 5.4.11**: Build tool ve development server
- **React Router DOM 6.26.2**: Client-side routing

### UI Framework ve Bileşenler
- **Tailwind CSS 3.4.15**: Utility-first CSS framework
- **shadcn/ui (Radix UI)**: Headless UI bileşenleri
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-tabs
  - @radix-ui/react-toast
  - Ve daha fazlası...
- **Lucide React 0.454.0**: Icon kütüphanesi
- **class-variance-authority**: Variant bazlı className yönetimi
- **clsx & tailwind-merge**: className utility fonksiyonları

### Form ve Validasyon
- **React Hook Form (latest)**: Form state yönetimi
- **Zod 3.25.67**: Schema validation
- **@hookform/resolvers 3.10.0**: Zod ile RHF entegrasyonu

### Özel Kütüphaneler
- **ExcelJS 4.4.0**: Excel dosyası oluşturma ve okuma
- **xlsx 0.18.5**: Excel parsing (alternatif)
- **jwt-decode 4.0.0**: JWT token çözümleme
- **date-fns 4.1.0**: Tarih işlemleri
- **sonner (latest)**: Toast bildirimleri

### UI Enhancements
- **embla-carousel-react**: Carousel/slider bileşeni
- **react-day-picker**: Tarih seçici
- **vaul**: Drawer bileşeni
- **cmdk**: Command menu

### Development Tools
- **ESLint**: Code linting
- **PostCSS 8.5**: CSS processing
- **Autoprefixer 10.4.20**: CSS vendor prefix
- **@vitejs/plugin-react 4.3.3**: Vite React plugin
- **json-server**: Mock API server (development)
- **jsonwebtoken**: JWT generation (mock API)

## Development Setup

### Gereksinimler
- **Node.js**: v16+ (önerilen v18+)
- **npm**: v8+
- **Modern Browser**: Chrome, Firefox, Safari, Edge (son 2 versiyon)

### Kurulum
```bash
npm install
```

### Development Server
```bash
npm run dev
# Vite dev server başlatır (genellikle http://localhost:5173)

npm run mock-api
# Mock API server başlatır (json-server on port 3001)
# Kullanım: Development ortamında gerçek API olmadan test için
```

**Mock API Özellikleri:**
- json-server tabanlı mock backend
- Gerçek API formatına uyumlu response'lar
- Authentication, items, vendors, purchase requests endpoints
- JWT token generation (mock)
- Dosya: mock-api/server.cjs + db.json

### Production Build
```bash
npm run build
# 1. TypeScript compile (tsc)
# 2. Vite build
# Çıktı: dist/ klasörü
```

### Preview Build
```bash
npm run preview
# Production build'i lokal olarak test et
```

### Linting
```bash
npm run lint
# ESLint kontrolü
```

## Konfigürasyon Dosyaları

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### tsconfig.json
- **target**: ES2020
- **module**: ESNext
- **jsx**: react-jsx
- **strict**: true
- **baseUrl**: "."
- **paths**: { "@/*": ["./src/*"] }

### tailwind.config.ts
- **darkMode**: "class"
- **content**: HTML ve TSX dosyaları
- **theme.extend**: Özel animasyonlar
  - Ken Burns efekti
  - Gradient animasyonları
  - Pastel renkler
  - Glassmorphism efektleri

### Tailwind Animasyonları
```javascript
animations: {
  'ken-burns': 'kenBurns 8s ease-in-out infinite alternate',
  'gradient': 'gradient 3s ease infinite',
  'float': 'float 3s ease-in-out infinite',
  'shimmer': 'shimmer 2s linear infinite',
  // ... ve daha fazlası (toplam 12 animasyon)
}
```

## Veri Akışı ve Tablo Yapısı

### Liste Çekme İşlemi (SAP → Web) - TEK SEFER VERİ AKTARIMI

**⚠️ ÖNEMLİ: SAP ile veri etkileşimi SADECE bu aşamada olur. Sonrasında tüm işlemler Web üzerinden yönetilir.**

#### 1. **Liste Çek** Butonu (Geçici Sorgu)
   - SAP OPCH tablosundan faturalar sorgulanır:
     ```sql
     WHERE
       OPCH.DocStatus = 'O'
       AND OPCH.DocDueDate BETWEEN @StartDate AND @EndDate
       AND OPCH.DocCur = @Currency
       AND U_ExclusionList = 'N'  -- Sadece N olanları al (varsayılan N)
     ```
   - SAP'tan çekilen veriler **geçici olarak** Web'te gösterilir
   - **Henüz kayıt atılmaz**, sadece önizleme

#### 2. **Kaydet / Özet Oluştur** Butonu (Kalıcı Kayıt)
   - SAP'tan çekilen **TÜM veriler** Web tablolarına kaydedilir:
     - SAP OPCH alanları (DocNum, CardCode, DocTotal, vb.)
     - Web alanları (ProcessID, StageID, U_PayableAmount, vb.)
   - ProcessID oluşturulur (UUID/GUID)
   - StageID = 1 (Aşama 1 başlatılır)
   - **SAP ile bağlantı burada KOPAR**

#### 3. **Bundan Sonra: Tamamen Web Üzerinde**
   - ✅ Tüm düzenlemeler Web tablolarında yapılır
   - ✅ Ödenecek tutar güncellemeleri → Web
   - ✅ Fatura silme (isDeleted) → Web
   - ✅ Aşama geçişleri → Web
   - ✅ Onaylar/Redler → Web
   - ❌ SAP'a geri sorgu atılmaz
   - 📌 Sadece Aşama 6'da Excel talimat oluşturulur (SAP'a import için)

### SAP Alanları (OPCH Tablosundan Gelen)
```
✅ SAP'ten Okunan Alanlar:
- OPCH.DocNum (Fatura No)
- OPCH.DocDate (Fatura Tarihi)
- OPCH.DocDueDate (Vade Tarihi)
- OPCH.CardCode (Cari Kod)
- OPCH.CardName (Cari Ünvan)
- OPCH.DocTotal / DocTotalFC (Fatura Tutarı)
- OPCH.DocCur (Döviz Türü)
- OPCH.DocRate (Kur)
- OPCH.PaidToDate / PaidFC (Ödenen Tutar)
- OPCH.Comments (Açıklama)
- OPCH.DocStatus (Belge Durumu)
```


####  SAP'te KTA (User Defined Field) Olarak Açılacak Alanlar:
```
🔧 SAP OPCH Tablosu:
1. U_ExclusionList (Hariç Tutma Listesi - FATURA BAZLI)
   - Tip: Y/N (Varsayılan: N)
   - N = Fatura listeye dahil edilir
   - Y = Fatura listeden çıkarılır
   - Liste çekerken: WHERE U_ExclusionList = 'N'
   - Tek sefer kontrol, sonrası Web'te devam

2. U_PaymentType (Ödeme Türü: TRY/USD/EUR)
   - İleride kullanılacak (şimdilik kullanılmıyor)

🔧 SAP OCRD Tablosu (Cari Master):
3. U_DeptMgr (Cari Amiri - Departman Müdürü)
   - İç Piyasa / Dış Piyasa Müdürü
   - Aşama 2'de fatura ataması için kullanılır

4. U_DebitAccTRY (Borçlu Hesap No - TRY)
   - TRY para birimi için borçlu hesap numarası
   - Talimat oluştururken kullanılır

5. U_DebitAccUSD (Borçlu Hesap No - USD)
   - USD para birimi için borçlu hesap numarası
   - Talimat oluştururken kullanılır

6. U_DebitAccEUR (Borçlu Hesap No - EUR)
   - EUR para birimi için borçlu hesap numarası
   - Talimat oluştururken kullanılır
```

### Web Tablo Yapısı Önerisi (SAP B1 Alan İsimlendirmesi)

**🎯 SAP Business One Alan İsimlendirme Mantığı (Tablo İsimleri Açık):**

## 1️⃣ PaymentHeaders (Ana Süreç Tablosu)
```sql
-- Ana süreç tablosu - SQL Server standard naming
CREATE TABLE PaymentHeaders (
  ID uniqueidentifier PRIMARY KEY NOT NULL,  -- Benzersiz tanımlayıcı (GUID)
  Numarator INT UNIQUE NOT NULL,              -- Ödeme belge numarası

  -- Audit Alanları
  CreatedDate datetime2(7) NOT NULL,
  CreatedBy nvarchar(100) NOT NULL,
  UpdatedDate datetime2(7) NULL,
  UpdatedBy nvarchar(100) NULL,

  -- Durum Bilgileri
  CurrentStage INT NOT NULL,                -- Mevcut Aşama (1-6)

  -- Aşama Notları
  Stage1_Remarks nvarchar(2000) NULL,       -- Aşama 1: Finans Çalışanı notları
  Stage2_Remarks nvarchar(max) NULL,        -- Aşama 2: Bölüm Müdürleri notları
  Stage3_Remarks nvarchar(max) NULL,        -- Aşama 3: Finans Çalışanı notları
  Stage4_Remarks nvarchar(max) NULL,        -- Aşama 4: Finans Müdürü notları
  Stage5_Remarks nvarchar(max) NULL         -- Aşama 5: Genel Müdür notları
);
```

---

## 2️⃣ PaymentDetails (Fatura Detay Tablosu)
```sql
-- Fatura detayları - SAP B1 alan isimlendirmesi
CREATE TABLE PaymentDetails (
  ID uniqueidentifier PRIMARY KEY NOT NULL,  -- Benzersiz tanımlayıcı (GUID)
  PaymentHeaderId uniqueidentifier NOT NULL, -- FK -> PaymentHeaders.ID
  DocEntry INT NOT NULL,                     -- SAP DocEntry (referans)
  DocNum VARCHAR(20) NOT NULL,               -- SAP OPCH.DocNum (Fatura No)

  -- SAP Fatura Bilgileri (OPCH Snapshot)
  DocDate DATE,                              -- Fatura Tarihi
  DocDueDate DATE,                           -- Vade Tarihi
  CardCode VARCHAR(50),                      -- Cari Kod
  CardName VARCHAR(200),                     -- Cari Ünvan
  DocTotal DECIMAL(18,2),                    -- Fatura Tutarı
  DocCurrency VARCHAR(3),                    -- Döviz (TRY, USD, EUR, GBP)
  DocRate DECIMAL(10,4),                     -- Kur
  PaidToDate DECIMAL(18,2),                  -- Ödenen Tutar
  OpenBal DECIMAL(18,2),                     -- Vadesi Gelmiş Bakiye
  Comments TEXT,                             -- Açıklama

  -- User Defined Fields
  U_PaymentType VARCHAR(10) NULL,            -- TRY/USD/EUR (SAP KTA - İleride kullanılacak)
  U_PayableAmount DECIMAL(18,2) NOT NULL,    -- Ödenecek Tutar (düzenlenebilir)
  U_IsDeleted VARCHAR(1) DEFAULT 'N',        -- Y/N (Soft Delete)
  U_ExclusionList VARCHAR(1) DEFAULT 'N',    -- Hariç Tutma Listesi (Y/N - SAP KTA)

  -- Audit Fields
  CreatedDate DATETIME DEFAULT GETDATE(),    -- Oluşturulma Tarihi
  CreatedBy VARCHAR(100),                    -- Oluşturan Kullanıcı
  Stage INT,                                 -- Aşama Bilgisi (1-6, detay listesinde gösterilir)

  FOREIGN KEY (PaymentHeaderId) REFERENCES PaymentHeaders(ID) ON DELETE CASCADE
);
```

---

## 3️⃣ PaymentSummaries (Cari Özet Tablosu)
```sql
-- Cari bazında özet - SAP B1 alan isimlendirmesi
CREATE TABLE PaymentSummaries (
  ID uniqueidentifier PRIMARY KEY NOT NULL,  -- Benzersiz tanımlayıcı (GUID)
  PaymentHeaderId uniqueidentifier NOT NULL, -- FK -> PaymentHeaders.ID

  -- Cari Bilgileri
  CardCode VARCHAR(50) NOT NULL,             -- Cari Kod
  CardName VARCHAR(200) NOT NULL,            -- Cari Ünvan
  DocCurrency VARCHAR(3) NOT NULL,           -- Döviz Türü (TRY, USD, EUR, GBP)

  -- Toplamlar (PaymentDetails'dan hesaplanmış)
  TotalDocTotal DECIMAL(18,2),               -- Toplam Fatura Tutarı
  TotalPayable DECIMAL(18,2),                -- Toplam Ödenecek Tutar
  InvoiceCount INT,                          -- Fatura Sayısı
  
  -- Aşama Bilgisi
  Stage INT,                                 -- Aşama Bilgisi (1-6, özet listesinde gösterilir)

  -- Borçlu Hesap No (SAP OCRD'den çekilir, para birimine göre)
  U_DebitAccount VARCHAR(50),                -- Borçlu Hesap No (DocCurrency'e göre belirlenir)


  FOREIGN KEY (PaymentHeaderId) REFERENCES PaymentHeaders(ID) ON DELETE CASCADE
);
```

## API Entegrasyonu

### Base URL
Environment variable veya config dosyasından alınmalı:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
```

### API Endpoints (constants/API_Routes.tsx)
```typescript
// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Şirket veritabanı bilgilerini getiren endpoint
 * SAP B1 sisteminde hangi şirket DB'sine bağlanılacağını belirler
 */
export const getCompanyDbUrl="Auth/GetCompanyDb";

/**
 * Kullanıcı giriş endpoint'i
 * POST: { userName: string, password: string }
 * Response: { token: string, user: UserObject }
 */
export const userLoginUrl="Auth/Login";


// ============================================
// USER & ROLE ENDPOINTS
// ============================================

/**
 * Kullanıcının rollerini getiren endpoint
 * SAP EmpId veya UserId ile kullanıcının yetkilerini çeker
 * Web DB'deki Roles ve UserRoles tablolarını kullanır
 */
export const userRoleUrl="Roles/GetRolesByUserId";

/**
 * Tüm kullanıcıları getiren endpoint
 * Web DB'deki Users tablosundan kullanıcıları listeler
 * Admin yetkisi gerektirir
 */
export const getAllUsersUrl="Users/GetAll";

/**
 * Yeni kullanıcı oluşturma endpoint'i
 * POST: UserCreateDto
 */
export const CreateUserUrl="Users/Create";

/**
 * Kullanıcı güncelleme endpoint'i
 * PUT: UserUpdateDto
 */
export const UpdateUserUrl="Users/Update";

/**
 * Kullanıcı silme endpoint'i
 * DELETE: userId query parameter
 */
export const DeleteUserUrl="Users/Delete";


// ============================================
// SAP B1 MASTER DATA ENDPOINTS
// ============================================

/**
 * Tüm malzeme kodlarını getiren endpoint
 * SAP B1 OITM (Items Master Data) tablosundan veri çeker
 * Malzeme seçim dialogunda kullanılır
 */
export const getAllItemsUrl="Items/GetAll";

/**
 * Tüm çalışanları getiren endpoint
 * SAP B1 OHEM (Human Resources - Employee Master) tablosundan veri çeker
 * Talep eden kişi seçiminde kullanılır
 * EmpID ile Web DB Users tablosuna bağlanır
 */
export const GetAllHumanResourceUrl="HumanResourceEmployee/GetAll";

/**
 * Tüm iş ortaklarını (tedarikçi/müşteri) getiren endpoint
 * SAP B1 OCRD (Business Partners) tablosundan veri çeker
 * Tedarikçi seçim dialogunda kullanılır
 */
export const GetAllBusinessPartnersRequestUrl="BusinessPartners/GetAll";


// ============================================
// PURCHASE REQUEST ENDPOINTS
// ============================================

/**
 * Yeni satınalma talebi oluşturma endpoint'i
 * POST: PurchaseRequestCreateDto
 * SAP B1 OPRQ (Header) ve PRQ1 (Lines) tablolarına kayıt oluşturur
 */
export const CreatePurchaseRequestUrl="PurchaseRequests/Create";

/**
 * Tüm satınalma taleplerini getiren endpoint
 * Query params: ?page=1&pageSize=20
 * SAP B1 OPRQ tablosundan sayfalanmış veri döner
 * Response: { totalCount: number, servicelayerObjects: PurchaseRequest[] }
 */
export const GetAllPurchaseRequestUrl="PurchaseRequests/GetAll";

/**
 * Belirli bir satınalma talebinin detayını getiren endpoint
 * SAP B1 DocEntry'ye göre arama yapar
 * OPRQ ve PRQ1 join'lenmiş detaylı veri döner
 */
export const GetByDocentryPurchaseRequestUrl="PurchaseRequests/GetByDocentry";

/**
 * Satınalma talebini güncelleme endpoint'i
 * PUT: PurchaseRequestUpdateDto
 * SAP B1 OPRQ ve PRQ1 tablolarını günceller
 * Revize durumundaki talepleri düzenlemek için kullanılır
 */
export const UpdatePurchaseRequestUrl="PurchaseRequests/Put";

/**
 * Satınalma talebini iptal etme endpoint'i
 * POST: { docEntry: number, reason: string }
 * SAP B1'de talebi iptal durumuna getirir
 */
export const CancelPurchaseRequestUrl="PurchaseRequests/Cancel";


// ============================================
// PAYMENT PROCESS ENDPOINTS
// ============================================

/**
 * Belirli bir ödeme sürecinin header bilgisini getiren endpoint
 * GET: /Payment/Headers/:id
 */
export const GetPaymentHeaderUrl="Payment/Headers/:id";


// ============================================
// PAYMENT TASK ENDPOINTS
// ============================================

/**
 * Tüm ödeme görevlerini getiren endpoint
 */
export const GetAllPaymentTasksUrl="Payment/Tasks/GetAll";

/**
 * Ödeme görevini üzerine alma endpoint'i
 * PUT: { assignedTo: string, assignedToId: string }
 */
export const ClaimPaymentTaskUrl="Payment/Tasks/:id/Claim";
```

### HTTP Client Pattern
```typescript
class HttpClient {
  private async request<T>(
    url: string,
    method: string,
    data?: any
  ): Promise<T> {
    const token = localStorage.getItem('bearer')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      // Error handling
    }

    return response.json()
  }
}
```

## Environment Variables

### .env.local (oluşturulmalı)
```env
VITE_API_BASE_URL=http://your-backend-api.com
VITE_SAP_COMPANY_DB=SBODEMOUS
```

## Build ve Deployment

### GitHub Pages Deployment
```bash
npm run deploy
# Build oluştur ve GitHub Pages'e push et
```

### Vercel Deployment
- GitHub repo'ya bağlı otomatik deployment
- Base directory: `./`
- Build command: `npm run build`
- Output directory: `dist`

## Browser Support

### Target Browsers
- Chrome/Edge: son 2 versiyon
- Firefox: son 2 versiyon
- Safari: son 2 versiyon
- iOS Safari: son 2 versiyon
- Android Chrome: son 2 versiyon

### Polyfills
Vite otomatik olarak gerekli polyfill'leri ekler.

## Teknik Kısıtlamalar

### 1. Dosya Boyutu
- Yüklenen dosyalar için maksimum boyut sınırı (önerilen: 5MB)
- Base64 encoding overhead'i hesaba katılmalı

### 2. Browser Storage
- **localStorage**: JWT token ve temel ayarlar
- **Limit**: ~5-10MB (browser'a göre değişir)
- **Güvenlik**: Sensitive data localStorage'da saklanmamalı

### 3. SAP API Limitations
- Rate limiting olabilir
- Timeout ayarları yapılmalı
- Retry logic eklenmeli

### 4. Excel Export
- Büyük veri setleri için memory kullanımı
- Browser donma riski için pagination öneriliyor
- **Silinen Faturalar**: Excel aktarımında "Silindi" sütunu yer alır
  - **Veritabanı**: `U_IsDeleted` → 'Y' veya 'N'
  - **Excel'de**: True veya False olarak gösterilir
    - `U_IsDeleted = 'Y'` → **True** (Fatura silinmiş)
    - `U_IsDeleted = 'N'` → **False** (Fatura aktif)
  - Bu sütun sayesinde silinen faturalar Excel'de takip edilebilir
  - Frontend'de dönüşüm: `item.U_IsDeleted === 'Y' ? 'True' : 'False'`

## Performance Considerations

### 1. Bundle Size
- Tree shaking aktif (Vite sayesinde)
- Radix UI modüler import
- Code splitting: Route bazlı

### 2. Runtime Performance
- React.memo kullanımı (gerektiğinde)
- useMemo/useCallback for expensive operations
- Virtual scrolling (büyük listeler için planlanıyor)

### 3. Network Optimization
- API response caching (gelecek)
- Debounced search
- Lazy loading images

## Development Tools ve Workflow

### VS Code Extensions (önerilen)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Auto Rename Tag
- Path Intellisense

### Git Workflow
- **Main Branch**: production-ready code
- **React Branch**: development branch (aktif)
- Feature branches: feature/feature-name
- Commit format: conventional commits

### Code Style
- **Prettier**: Auto formatting
- **ESLint**: Code quality
- **TypeScript Strict Mode**: Tip güvenliği
- **Tailwind**: Utility-first approach

## Security Considerations

### 1. Authentication
- JWT stored in localStorage
- Token expiry kontrolü
- Automatic logout on token expiration
- Protected routes with role checking

### 2. XSS Protection
- React otomatik escape ediyor
- Dangerously set HTML kullanılmıyor
- User input validation

### 3. CSRF
- Backend CSRF token implementation gerekli
- Same-origin policy

### 4. Data Validation
- Frontend: Zod schema validation
- Backend: Ayrıca validation yapılmalı (defense in depth)

## Dependencies Güncelleme

### Güncelleme Politikası
- Patch updates: Hemen uygulanabilir
- Minor updates: Test sonrası uygulanabilir
- Major updates: Dikkatli değerlendirme gerekli

### Güncelleme Komutları
```bash
# Güncel versiyonları kontrol et
npm outdated

# Package güncelle
npm update package-name

# Major version güncelle
npm install package-name@latest
```

## Testing (Planlanıyor)

### Test Stack (gelecek)
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright/Cypress**: E2E testing

## Monitoring ve Debugging

### Development
- React DevTools
- Redux DevTools (gerekirse)
- Network tab (API çağrıları)
- Console logging (production'da temizlenmeli)

### Production
- Error tracking (Sentry gibi - planlanıyor)
- Analytics (Google Analytics - planlanıyor)
- Performance monitoring (Web Vitals)

# Payment Process Screens

## Screen Hierarchy

```
Navbar (Top Bar)
├── Görev Listesi (Task List) - All roles
├── Anasayfa (Homepage) - All roles
├── Satınalma (Purchase Processes)
│   ├── Satınalma Talep Formu (Purchase Request Form)
│   └── Talep Listesi (Request List)
├── Finans (Finance/Payment Processes)
│   ├── Ödeme Süreci (Payment Process)
│   │   └── Ödeme Süreci Başlat (Start Payment Process) - Finans Çalışanı only
│   └── Tamamlanan Süreçler (Completed Processes) - All roles
├── Ayarlar (Settings)
└── Yardım (Help)
```

## Sidebar Menü Yapısı

### 1. Anasayfa
- Route: `/`
- Icon: Home
- Access: All roles

### 2. Görev Listesi
- Route: `/tasks` (veya `/gorev-listesi`)
- Icon: CheckSquare / ClipboardList
- Access: All roles

### 3. Satınalma (Collapsible)
- Icon: ShoppingCart
- Access: All roles
- **Alt Menüler:**
  - Satınalma Talep Formu
    - Route: `/purchase/new`
    - Access: Request creators
  - Talep Listesi
    - Route: `/purchase/requests`
    - Access: All roles

### 4. Finans (Collapsible)
- Icon: DollarSign / Banknote
- Access: Finance roles
- **Alt Menüler:**
  - **Ödeme Süreci** (Collapsible sub-menu)
    - Ödeme Süreci Başlat
      - Route: `/payment/new`
      - Access: Finans Çalışanı only
  - Tamamlanan Süreçler
    - Route: `/payment/completed`
    - Access: All finance roles

### 5. Ayarlar
- Route: `/settings`
- Icon: Settings
- Access: Admins only

### 6. Yardım
- Route: `/help`
- Icon: HelpCircle
- Access: All roles

## 1. Görev Listesi (PaymentTaskList.tsx)

**Route:** `/tasks` (veya `/gorev-listesi`)

**Purpose:** Unified task list showing ALL active tasks for current user (payment + purchase processes)

**Location:** Top Navigation Bar (Ana Menü) + Sidebar

**Features:**
- List ALL active tasks assigned to user across all processes
- Show process type, stage, initiator, date, total amount
- Filter by:
  - Process Type (Ödeme Süreci / Satınalma Süreci)
  - Stage
  - Date range
  - Status (Bekliyor/Onaylandı/Reddedildi)
- "Göreve Git" button → Navigate to appropriate screen based on process type

**Table Columns:**
- Süreç Tipi (Process Type: Ödeme / Satınalma)
- Süreç No (Process ID)
- Başlatan (Initiator)
- Oluşturulma Tarihi (Created Date)
- Aşama (Current Stage)
- Toplam Tutar (Total Amount)
- Para Birimi (Currency)
- Durum (Status: Bekliyor/Onaylandı/Reddedildi)
- Aksiyon (Action button)

**Role-Based Filtering:**

**Ödeme Süreçleri için:**
- Finans Çalışanı: Stages 1, 3, 6
- İç/Dış Piyasa Müdürü: Stage 2 (own assignments)
- Finans Müdürü: Stage 4
- Genel Müdür: Stage 5

**Satınalma Süreçleri için:**
- (Mevcut satınalma yetkileri)

---

## 2. Ödeme Bilgileri Giriş (PaymentInfoForm.tsx)

**Route:** `/payment/new`

**Purpose:** Start new payment process (Stage 1 initiation)

**Access:** Finans Çalışanı ONLY

**Menu Name:** "Ödeme Süreci Başlat" (Start Payment Process)

**Form Fields:**
1. Vade Tarihi Başlangıç (Due Date Start) - Date picker
2. Vade Tarihi Bitiş (Due Date End) - Date picker
3. Döviz Türü (Currency) - Dropdown (TRY, USD, EUR, GBP, etc.)
4. Ödeme Tarihi (Payment Date) - Date picker (for final instruction)

**Actions:**
- "Listeyi Çek" button → Fetch from SAP → Navigate to Invoice Details

**Validations:**
- Start date < End date
- All fields required
- Payment date >= today

---

## 3. Fatura Detayları (PaymentInvoiceDetails.tsx)

**Route:** `/payment/invoices/:processId`

**Purpose:** View and edit invoice list (Stage 1-5)

**Access:** 
- **Stage 1**: Finans Çalışanı (full edit)
- **Stage 2**: Department Managers (full edit, filtered by assignment)
- **Stage 3**: Finans Çalışanı (full edit)
- **Stage 4**: Finans Müdürü (full edit)
- **Stage 5**: Genel Müdür (full edit)
- **Stage 6**: READ-ONLY (Finans Çalışanı)

**Table Columns (Detaylı Açıklama):**

| Column | Editable (Stage 1-5) | Editable (Stage 6) | Source | Açıklama |
|--------|---------------------|-------------------|--------|----------|
| **Toplu Sil** | ✅ Checkbox | ❌ Gizli | `U_IsDeleted` (Y/N) | 🔒 **Frontta Gözükmeyecek**. Listeden çıkarılacak faturalar seçilir. DB: Y/N, Excel: True/False. |
| **Fatura No** | ❌ | ❌ | `OPCH.DocNum` | Fatura belge numarası |
| **Fatura Tarihi** | ❌ | ❌ | `OPCH.DocDate` | Fatura kayıt tarihi. Muhasebe kayıtlarına (Defter-i Kebir) hangi tarihte yansıyacağını belirler. |
| **Vade Tarihi** | ❌ | ❌ | `OPCH.DocDueDate` | Fatura vade tarihi |
| **Cari Ünvan** | ❌ | ❌ | `OPCH.CardName` | Tedarikçi adı |
| **Fatura Tutarı** | ❌ | ❌ | `OPCH.DocTotal` (TRY) veya `OPCH.DocTotalFC` (Yabancı Para) | Fatura toplam tutarı. SAP'te vadesi gelmiş ödeme toplamı olarak geçer. |
| **Fatura Döviz Türü** | ❌ | ❌ | `OPCH.DocCur` | Para birimi: TRY, USD, EUR, GBP vb. Çekilen listeye göre değişir. |
| **Kur** | ❌ | ❌ | `OPCH.DocRate` | Belgenin oluşturulduğu tarihteki kur değeri |
| **Ödenen Tutar** | ❌ | ❌ | `OPCH.PaidToDate` (TRY) veya `OPCH.PaidFC` (Yabancı Para) | SAP'te "Uygulanan Tutar" olarak gözükür |
| **Vadesi Gelmiş Bakiye** | ❌ | ❌ | `OPCH.DocTotal - OPCH.PaidToDate` (TRY)<br>`OPCH.DocTotalFC - OPCH.PaidFC` (Yabancı Para) | Açık bakiye. DocStatus='O' olan faturalar için hesaplanır. |
| **Ödenecek Tutar** | ✅ **Editable** | ❌ Read-only | `U_PayableAmount` | **TEK DÜZENLENEBİLİR ALAN**. Default: Vadesi gelmiş bakiye. Kullanıcı değiştirebilir. |
| **Açıklama** | ❌ | ❌ | `OPCH.Comments` | Anadolu Bakır'ın iç süreçlerinde kullandığı açıklama alanı |
| **Fatura** | ❌ (Link) | ❌ (Link) | Geliştirme | PDF linki. Tıklandığında fatura PDF'i açılır. GİB çakışma durumu dikkate alınır. |
| **Hariç Tutma Listesi** | 🔒 Hidden | 🔒 Hidden | `U_ExclusionList` | 🔒 **Frontta Gözükmeyecek**. **FATURA BAZLI** listeden çıkarma kontrolü. SAP'te KTA olarak tutulur (Y/N, varsayılan N). Liste çekerken kontrol edilir, sadece N olanlar listeye dahil edilir. |
| **Ödeme Türü** | 🔒 Hidden | 🔒 Hidden | `U_PaymentType` | 🔒 **Frontta Gözükmeyecek**. İleriye dönük olarak her ihtimale karşı ödeme döviz türü alanı. Listeleme kullanılmayacak, sadece ihtiyaç halinde muhasebe departmanına seçtirilecek şekilde gelecekte devreye alınabilir. (USD/EUR/TRY) |
| **Ödeme Tarihi** | ❌ | ❌ | `U_PaymentDate` | Ödeme Bilgileri Giriş formunda kullanıcı tarafından seçilen ödeme tarihi. Talimat oluşturma (final instruction) için kullanılır. |

**Kolon Görünürlük Kuralları:**
- ✅ **Görünür:** Fatura No, Fatura Tarihi, Vade Tarihi, Cari Ünvan, Fatura Tutarı, Fatura Döviz Türü, Kur, Ödenen Tutar, Vadesi Gelmiş Bakiye, Ödenecek Tutar, Açıklama, Fatura (PDF)
- 🔒 **Gizli (Backend Only):** Toplu Sil, Hariç Tutma Listesi, Ödeme Türü, KTA

**Toplam Satırı (Sol Altta):**
- 📊 **Toplam Ödeme**: Tablodaki tüm faturaların "Ödenecek Tutar" kolonunun toplamı sol altta gösterilir
- Silinen faturalar toplama dahil edilmez

**Features:**
- **Stage 1-5**: Multi-select checkboxes
- **Stage 1-5**: "Seçimleri Sil" button → Mark isDeleted = true (soft delete, **kalıcı**)
- **Stage 1-5**: Inline edit for "Ödenecek Tutar" (with validation)
- **Stage 6**: All editing features DISABLED
- Sorting and filtering
- "Excel'e Aktar" button → Export table
- Summary row: Total Invoice Count, Total Payable Amount

**Actions:**
- **Stage 1**: "Özet Oluştur" → Navigate to Payment Summary
- **Stage 2**: "Onayla" → Approve and proceed
- **Stage 3**: "Özet Oluştur" → Navigate to Payment Summary
- **Stage 4**: "Özet Oluştur" → Navigate to Payment Summary
- **Stage 5**: "Özet Oluştur" → Navigate to Payment Summary
- **Stage 6**: "Özete Git" → Navigate to Summary (read-only)

**Validation Rules (Stage 1-5):**
- `U_PayableAmount <= OpenBal` (Vadesi gelmiş bakiyeden fazla olamaz)
- `U_PayableAmount > 0` (Pozitif olmalı)
- En az 1 fatura aktif kalmalı (tümü `U_IsDeleted = 'Y'` yapılamaz)
- **DocStatus Kontrolü**: Sadece `OPCH.DocStatus = 'O'` (Open) olan faturalar listeye dahil edilir
  - İade, iptal ve manuel kapatmalar otomatik filtrelenir

**Kritik İş Kuralları:**
- 📌 **Tek Düzenlenebilir Alan**: Sadece "Ödenecek Tutar" (`U_PayableAmount`) kullanıcı tarafından değiştirilebilir
- 📌 **Yeni Tablo Alanları**:
  - `U_PayableAmount`: Ödenecek tutar (editable, Web tablosunda tutulur)
  - `U_PaymentDate`: Ödeme tarihi (talimat oluşturma için, Header tablosunda)
- 📌 **Soft Delete**: "Toplu Sil" checkbox ile işaretlenen faturalar `U_IsDeleted = 'Y'` olarak işaretlenir
  - **Veritabanı**: 'Y' veya 'N' olarak saklanır
  - **Excel Export**: True/False olarak gösterilir (`Y` → True, `N` → False)
- 📌 **Geri Alınamaz**: Silme işlemi **kalıcıdır**, kullanıcıya onay dialogu gösterilmelidir
- 📌 **Fatura PDF**: GİB entegrasyonu için Fatih Bey ve Hakan Bey ile koordinasyon gereklidir
- 📌 **Hariç Tutma Listesi** (`U_ExclusionList`):
  - SAP'te KTA olarak tutulur (OPCH tablosu - **FATURA BAZLI**)
  - Tip: **Y/N** (Varsayılan: **N**)
  - Frontend'de gözükmez
  - **Liste çekerken kontrol edilir**: `U_ExclusionList = 'N'`
  - **N** = Fatura listeye dahil edilir (varsayılan, ödeme sürecine dahil)
  - **Y** = Fatura listeden çıkarılır (ödeme sürecine dahil edilmez)
  - SAP'te varsayılan değer **N** olarak ayarlanır
  - ⚠️ **Tek sefer kontrol**: SAP'tan liste çekerken yapılır, sonrası Web'te yönetilir
- 📌 **Ödeme Türü** (`U_PaymentType`):
  - Frontend'de gözükmez
  - İleriye dönük ödeme döviz türü alanı (USD/EUR/TRY)
  - Listeleme kullanılmayacak, sadece ihtiyaç halinde muhasebe departmanına seçtirilecek

**⚠️ Önemli Notlar:**
- Silinen faturalar **geri alınamaz** (soft delete kalıcıdır)
- Silme işlemi öncesi kullanıcıya onay dialogu gösterilmelidir
- **Excel Export Format:**
  - Veritabanı: `U_IsDeleted` = 'Y' veya 'N'
  - Excel'de: "Silindi" kolonu → True veya False
  - Frontend dönüşüm: `item.U_IsDeleted === 'Y' ? 'True' : 'False'`
- SAP B1 alan isimlendirmesi kullanılır: DocEntry, DocNum, DocDate, DocCur, CardCode, vb.
- User Defined Field'lar U_ prefix ile başlar: U_PayableAmount, U_IsDeleted, U_CurrentStage vb.

---

## 4. Ödeme Özeti (PaymentSummary.tsx)

**Route:** `/payment/summary/:processId`

**Purpose:** Vendor-grouped summary with statement upload and approvals

**Access:** All roles at respective stages

**Summary Table (Özet Kolonları):**

| Column | Editable (Stage 1-5) | Editable (Stage 6) | Source | Açıklama |
|--------|---------------------|-------------------|--------|----------|
| **Cari Kod** | ❌ | ❌ | `OPCH.CardCode` | Tedarikçi kodu |
| **Cari Ünvan** | ❌ | ❌ | `OPCH.CardName` | Tedarikçi adı |
| **Toplam Fatura** | ❌ | ❌ | GROUP BY Toplam | Faturaların tutarları cariye göre gruplanarak toplam tutarı |
| **Toplam Ödeme** | ✅ **Editable (Aşama 2-5)** ❌ **Read-only (Aşama 1)** | ❌ Read-only | `U_PayableAmount` (AŞAMA 1) | **Aşama 2-5'te düzenlenebilir**. Aşama 1 tablosundaki ödenecek tutar alanları toplanır. **Aşama 1'de özette değişiklik yapılamaz, sadece detay sayfasında değişiklik yapılabilir.** **Silinen faturalar dahil edilmez.** |
| **Fatura Döviz Türü** | ❌ | ❌ | `OPCH.DocCur` | Para birimi (TRY, USD, EUR, GBP vb.) |
| **Ekstre (Statement)** | ✅ Upload/View | 👁️ View only | File Upload | Ekstre yükleme/görüntüleme butonu |
| **Detay (Detail)** | ✅ View/Edit | 👁️ View only | Popup | Cari bazında fatura detaylarını gösterir |
| **Süreç Notları** | ✅ Editable | 👁️ View only | `U_WorkflowComments` | Aşamalar arası geçişte sol alttaki notlar bölümünden yazılabilir. Tamamlanan süreçlerde de gözükür. |

**Kritik Kurallar:**
- 📌 **Düzenlenebilir Kolon (Özet Tablosu)**:
  - **Aşama 1**: "Toplam Ödeme" kolonunda düzenleme **YAPILAMAZ** (sadece detay sayfasında düzenlenir)
  - **Aşama 2-5**: "Toplam Ödeme" kolonunda düzenleme **YAPILABİLİR**
  - **Aşama 6**: Tüm alanlar **READ-ONLY**
- 📌 **Silinen Faturalar Hariç**: `U_IsDeleted = 'N'` olan faturalar listeye dahil edilir
- 📌 **Aşama 1 Verisi**: Toplam Ödeme kolonu, PaymentDetails tablosundaki `U_PayableAmount` değerlerinin toplamıdır
- 📌 **Süreç Notları**: Sol alttaki notlar bölümünden bir sonraki/önceki aşamaya not bırakılabilir
- 📌 **Cariye Göre Gruplama**: Aynı cari ve döviz türüne ait faturalar gruplanır

**Toplam Satırı (Sol Altta):**
- 📊 **Toplam Ödeme**: Tablodaki tüm carilerin "Toplam Ödeme" kolonunun toplamı sol altta gösterilir
- Silinen faturalar toplama dahil edilmez
- Döviz türüne göre ayrı ayrı toplam gösterilebilir (TRY, USD, EUR vb.)

**Stage-Specific Features:**
- **Stage 1 (Finans Çalışanı):**
  - ❌ **Özette "Toplam Ödeme" düzenlenemez** (Read-only)
  - ✅ **Sadece detay sayfasında "Ödenecek Tutar" düzenlenebilir**
  - ✅ **"Detay" button → Popup with vendor's invoices (EDITABLE)**
  - "Onaya Gönder" button
  - Process notes field

- **Stage 2 (Department Managers):**
  - Filtered by assignment (İç/Dış Piyasa)
  - ✅ Edit "Toplam Ödeme Tutarı" inline
  - ✅ **"Detay" button → Popup with vendor's invoices (EDITABLE)**
  - ✅ Delete invoices from popup
  - "Onayla" button (each manager independently)

- **Stage 3 (Finans Çalışanı):**
  - ✅ Edit "Toplam Ödeme Tutarı" inline
  - ✅ **"Detay" button → Popup with vendor's invoices (EDITABLE)**
  - ✅ Delete invoices from popup
  - **Mandatory:** Upload ekstre for EACH vendor
  - "Ekstre Yükle" button per row
  - "Ekstre Görüntüle" button to preview
  - Cannot proceed if any statement missing
  - "Onaya Gönder" button

- **Stage 4 (Finans Müdürü):**
  - ✅ Edit "Toplam Ödeme Tutarı" inline
  - ✅ **"Detay" button → Popup with vendor's invoices (EDITABLE)**
  - ✅ Delete invoices from popup
  - ✅ Upload or update statements
  - "Onaya Gönder" OR "Geri Ata" (with reason)

- **Stage 5 (Genel Müdür):**
  - ✅ Edit "Toplam Ödeme Tutarı" inline
  - ✅ **"Detay" button → Popup with vendor's invoices (EDITABLE)**
  - ✅ Edit amounts in popup
  - ✅ Delete invoices from popup
  - ✅ Update statements
  - "Onayla" (final) OR "Geri Ata"

- **Stage 6 (Finans Çalışanı - READ-ONLY):**
  - 👁️ **ALL FIELDS READ-ONLY**
  - 👁️ View statements only (no upload/update)
  - 👁️ **"Detay" button → Popup with vendor's invoices (READ-ONLY)**
  - 👁️ "Toplam Ödeme Tutarı" NOT editable
  - ✅ **"Talimat Oluştur" button ONLY**
  - After creating instruction → Move to "Tamamlanan Süreçler"

**Common Features:**
- Process history timeline (left sidebar)
- Current stage indicator
- Rejection reason display (if applicable)
- Total summary at bottom

**Cari Detay Popup (Vendor Detail Popup):**
- **Stage 1-5**: Shows all invoices for selected vendor with EDIT capability
  - Inline edit "Ödenecek Tutar"
  - Delete invoices (soft delete, **kalıcı - geri alınamaz**)
- **Stage 6**: Shows all invoices in READ-ONLY mode
  - No editing
  - No deletion
  - View only

---

## Yetki Matrisi ve Düzenleme Alanları

### Aşama 1: Başlatma (Finans Çalışanı)
Finans çalışanı sorgu oluşturur, **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler** ve onaya gönderir. **Özette toplam ödeme tutarı düzenlenemez, sadece görüntülenir.**

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ✅ Silebilir | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Aşama 2: Bölüm Müdürleri Onayı
Belgeler İç Piyasa ve Dış Piyasa olarak ayrılır. Her müdür **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler** ve **cari detay popup'ı açabilir**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ✅ Düzenleyebilir | ✅ Düzenleyebilir | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ | ✅ Silebilir | ✅ Silebilir | ❌ | ❌ |
| Toplam Ödeme (Özet) | ❌ | ✅ Düzenleyebilir | ✅ Düzenleyebilir | ❌ | ❌ |
| Cari Detay Popup | ❌ | ✅ Açabilir/Düzenleyebilir | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ❌ |

**Önemli:** Her iki müdür de kendi sorumluluğundaki faturaları onayladıktan sonra süreç bir sonraki aşamaya geçer.

---

### Aşama 3: Konsolidasyon ve Ekstre Yükleme (Finans Çalışanı)
Belgeler birleştirilir. Finans çalışanı **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **cari detay popup'ı açabilir** ve **her cari için zorunlu olarak ekstre ekler**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ✅ Silebilir | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Ekstre | ✅ **Yüklemeli (Zorunlu)** | ❌ | ❌ | ❌ | ❌ |

**Kural:** Tüm cariler için ekstre yüklenmedikçe bir sonraki aşamaya geçilemez.

---

### Aşama 4: Finans Müdürü Onayı
Finans müdürü **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **cari detay popup'ı açabilir**, **ekstreleri görüntüler/yükler/günceller**, onaya gönderir veya **geri atar**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ❌ | ❌ | ✅ Düzenleyebilir | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ | ❌ | ❌ | ✅ Silebilir | ❌ |
| Toplam Ödeme (Özet) | ❌ | ❌ | ❌ | ✅ Düzenleyebilir | ❌ |
| Cari Detay Popup | ❌ | ❌ | ❌ | ✅ Açabilir/Düzenleyebilir | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ✅ **Yükleyebilir/Güncelleyebilir** | ❌ |

**Yetki:** Finans müdürü süreci **Aşama 3'e (Finans Çalışanı'na) geri atabilir** ve ret sebebi girebilir.

---

### Aşama 5: Genel Müdür Nihai Onayı
Genel müdür **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **ekstreleri günceller** ve **"Detay" butonu ile cari bazında gruplanmış fatura detaylarına popup ile erişebilir**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ❌ | ❌ | ❌ | ✅ Düzenleyebilir |
| Fatura Silme (Detay Sayfası) | ❌ | ❌ | ❌ | ❌ | ✅ Silebilir |
| Toplam Ödeme (Özet) | ❌ | ❌ | ❌ | ❌ | ✅ Düzenleyebilir |
| Cari Detay Popup | ❌ | ❌ | ❌ | ❌ | ✅ **Açabilir/Düzenleyebilir** |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ✅ Güncelleyebilir |

**Önemli Değişiklik:** 
- Bu aşamada **"Onaya Gönder"** butonu **"Onayla"** olarak değişir.
- Onaylanan belge için Finans Çalışanı'na Excel ile mail gönderilir.
- Genel müdür süreci **Aşama 4'e (Finans Müdürü'ne) geri atabilir** ve ret sebebi girebilir.

---

### Aşama 6: Talimat Oluşturma (Finans Çalışanı) 🔒
**🔒 TÜM ALANLAR SALT OKUNURDUR (READ-ONLY) 🔒**

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ **DÜZENLENemez** | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Ekstre | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Talimat Oluştur | ✅ **Excel Export** | ❌ | ❌ | ❌ | ❌ |

**Kritik Kısıtlama:** 
- ❌ **DETAY SAYFASINDA tutar düzenlenemez**
- ❌ **DETAY SAYFASINDA fatura silinemez**
- ❌ **ÖZETTE tutar düzenlenemez**
- ❌ **CARİ DETAY POPUP'TA düzenleme yapılamaz**
- ❌ **EKSTRE yüklenemez/güncellenemez**
- ✅ **SADECE "Talimat Oluştur" butonu aktif**

**Son Adım:** Talimat oluşturulduktan sonra süreç **"Tamamlanan Süreçler"** arşivine taşınır.

---

## Yetki Özeti

### Finans Çalışanı
- ✅ Süreci başlatır (Aşama 1)
- ✅ **Detay sayfasında ödenecek tutarları düzenler (Aşama 1, 3)**
- ✅ **Detay sayfasında faturaları soft delete ile işaretler (Aşama 1, 3)**
- ❌ **Özet sayfasında toplam ödeme tutarını düzenleyemez (Aşama 1)** - Read-only
- ✅ **Özet sayfasında toplam ödeme tutarını düzenler (Aşama 3)**
- ✅ **Cari detay popup'ı açabilir ve düzenleyebilir (Aşama 1, 3)**
- ✅ **Zorunlu ekstre yükler (Aşama 3)**
- ✅ Talimat oluşturur (Aşama 6 - **sadece bu işlem**, düzenleme YOK)
- ❌ Onay yetkisi yoktur

### İç/Dış Piyasa Müdürleri
- ✅ Kendi sorumluluklarındaki faturaları görüntüler (Aşama 2)
- ✅ **Detay sayfasında ödenecek tutarları düzenler (Aşama 2)**
- ✅ **Detay sayfasında faturaları siler (Aşama 2)**
- ✅ **Özet sayfasında toplam ödeme tutarını düzenler (Aşama 2)**
- ✅ **Cari detay popup'ı açabilir ve düzenleyebilir (Aşama 2)**
- ✅ Onay yetkisi var (Aşama 2)
- ❌ Ekstre yükleme yetkisi yoktur
- ❌ Geri atama yetkisi yoktur

### Finans Müdürü
- ✅ Tüm faturaları ve ekstreleri görüntüler (Aşama 4)
- ✅ **Detay sayfasında ödenecek tutarları düzenler (Aşama 4)**
- ✅ **Detay sayfasında faturaları siler (Aşama 4)**
- ✅ **Özet sayfasında toplam ödeme tutarını düzenler (Aşama 4)**
- ✅ **Cari detay popup'ı açabilir ve düzenleyebilir (Aşama 4)**
- ✅ **Ekstreleri yükleyebilir/güncelleyebilir (Aşama 4)**
- ✅ Onay yetkisi var (Aşama 4)
- ✅ **Geri atama yetkisi var (Aşama 3'e)**
- ❌ Talimat oluşturamaz

### Genel Müdür
- ✅ Tüm faturaları popup ile detaylı görüntüler (Aşama 5)
- ✅ **Detay sayfasında ödenecek tutarları düzenler (Aşama 5)**
- ✅ **Detay sayfasında faturaları siler (Aşama 5)**
- ✅ **Özet sayfasında toplam ödeme tutarını düzenler (Aşama 5)**
- ✅ **Cari detay popup'ı açabilir ve düzenleyebilir (Aşama 5)**
- ✅ Ekstreleri günceller (Aşama 5)
- ✅ **Nihai onay yetkisi (Aşama 5)**
- ✅ **Geri atama yetkisi var (Aşama 4'e)**
- ❌ Süreci başlatamaz

---

## Kritik İş Kuralları

1. **🔌 SAP Entegrasyonu - Tek Sefer Veri Aktarımı**:
   - SAP'tan veri çekme SADECE "Liste Çek" aşamasında olur
   - "Kaydet/Özet Oluştur" sonrası SAP ile bağlantı kopar
   - Tüm işlemler Web tablolarında yönetilir
   - SAP'a geri sorgu atılmaz
   - Sadece Aşama 6'da Excel talimat export edilir

2. **Fiziksel Silme Yasak**: Faturalar `U_IsDeleted = 'Y'` flag ile işaretlenir, asla fiziksel silinmez (audit trail)

3. **⚠️ Silme Kalıcıdır**: Soft delete yapılan faturalar **geri alınamaz**, kullanıcı dikkatli olmalıdır

4. **Zorunlu Ekstre**: Aşama 3'te HER cari için ekstre yüklenmeli, yoksa ilerlenemez

5. **Paralel Onay**: Aşama 2'de HER İKİ müdür de onaylamalıdır (`U_Stage2_ApprByInt` VE `U_Stage2_ApprByExt` dolu olmalı)

6. **Aşama Snapshot**: Her aşama geçişinde Header tablosunda ilgili `U_Stage*_Remarks`, `U_Stage*_ApprBy`, `U_Stage*_ApprDate` alanları doldurulur

7. **E-posta Bildirimi**: Her aşama geçişinde ilgili kullanıcıya mail gider

8. **Ret Geçmişi**: Ret sebepleri (`U_Stage4_RejReason`, `U_Stage5_RejReason`) ve zaman damgaları kayıt altına alınır

9. **🔒 Aşama Bazlı Düzenleme Yetkileri**:
   - **Aşama 1**: Sadece **detay sayfasında** ve **cari detay popup'ında** düzenleme yapılabilir. **Özet sayfasında düzenleme YAPILAMAZ** (Read-only)
   - **Aşama 2-5**: İlgili kullanıcılar hem detay sayfasında hem özet sayfasında hem de cari detay popup'ında tüm düzenlemeleri yapabilir
   - **Aşama 6**: Genel müdür onayından sonra HİÇBİR değişiklik yapılamaz, SADECE Excel talimat oluşturulabilir

10. **🔒 Özet Tablosu Düzenleme Kuralı**:
   - Aşama 1'de "Toplam Ödeme" (`U_TotalPayable`) kolonunda değişiklik yapılamaz
   - Aşama 2-5'te "Toplam Ödeme" kolonu düzenlenebilir
   - Aşama 6'da tüm alanlar salt okunur

---

## Ekran Yapısı Özeti

### 1. Detay Sayfası (PaymentInvoiceDetails.tsx)
- **Route:** `/payment/invoices/:processId`
- Tüm faturaların listesi (SAP'tan çekilen)
- Stage 1-5: Düzenlenebilir
- Stage 6: Read-only

### 2. Özet Sayfası (PaymentSummary.tsx)
- **Route:** `/payment/summary/:processId`
- Cariler bazında gruplanmış özet
- Her satırda **"Detay" butonu** → Cari Detay Popup açar
- Stage 1-5: Düzenlenebilir
- Stage 6: Read-only

### 3. Cari Detay Popup
- Özet sayfasındaki **"Detay" butonu** ile açılır
- Seçilen cariye ait tüm faturaları gösterir
- Stage 1-5: Popup içinde tutar düzenlenebilir, fatura silinebilir
- Stage 6: Popup içinde sadece görüntüleme

**Fark:**
- **Detay Sayfası**: Tüm faturaların tam listesi (route bazlı)
- **Cari Detay Popup**: Özet sayfasında belirli bir carinin faturalarını gösterme (dialog/modal)
