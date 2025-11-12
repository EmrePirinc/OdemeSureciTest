/**
 * Test Kullanıcıları
 * Ödeme Süreci Yönetim Sistemi için rol bazlı kullanıcı bilgileri
 */

export interface TestUser {
  username: string;
  password: string;
  role: string;
  displayName: string;
  landingPage: string; // Login sonrası yönlendirilecek sayfa
  stagePermissions: number[]; // Erişim yetkisi olan aşamalar
  canEdit: boolean; // Düzenleme yetkisi
  canApprove: boolean; // Onay yetkisi
  canReject: boolean; // Geri atama yetkisi
  department?: 'internal' | 'external'; // Sadece bölüm müdürleri için
}

export const TEST_USERS: Record<string, TestUser> = {
  ADMIN: {
    username: 'hasanHelvali',
    password: 'Hasan6969+',
    role: 'Admin',
    displayName: 'Hasan Helvalı',
    landingPage: '/admin',
    stagePermissions: [1, 2, 3, 4, 5, 6],
    canEdit: false, // Admin sadece görüntüler
    canApprove: false,
    canReject: false,
  },

  FINANCE_USER: {
    username: 'test',
    password: 'deneme',
    role: 'Finans Kullanıcısı',
    displayName: 'Finans Kullanıcısı',
    landingPage: '/payment/tasks',
    stagePermissions: [1, 3, 6],
    canEdit: true,
    canApprove: true,
    canReject: false,
  },

  INTERNAL_MARKET_MANAGER: {
    username: 'icpiyasa.@mail.com',
    password: '1234',
    role: 'İç piyasa',
    displayName: 'İç Piyasa Müdürü',
    landingPage: '/payment/tasks',
    stagePermissions: [2],
    canEdit: true,
    canApprove: true,
    canReject: false,
    department: 'internal',
  },

  EXTERNAL_MARKET_MANAGER: {
    username: 'dispiyasa@mail.com',
    password: '1234',
    role: 'Dış Piyasa',
    displayName: 'Dış Piyasa Müdürü',
    landingPage: '/payment/tasks',
    stagePermissions: [2],
    canEdit: true,
    canApprove: true,
    canReject: false,
    department: 'external',
  },

  FINANCE_MANAGER: {
    username: 'finans@muduru@mail.com',
    password: '1234',
    role: 'Finans müdürü',
    displayName: 'Finans Müdürü',
    landingPage: '/payment/tasks',
    stagePermissions: [4],
    canEdit: true,
    canApprove: true,
    canReject: true, // Stage 3'e geri atabilir
  },

  GENERAL_MANAGER: {
    username: 'genel.mudur@mail.com',
    password: '1234',
    role: 'Genel Müdür',
    displayName: 'Genel Müdür',
    landingPage: '/payment/tasks',
    stagePermissions: [5],
    canEdit: true,
    canApprove: true,
    canReject: true, // Stage 4'e geri atabilir
  },
};

/**
 * Şirket seçenekleri
 */
export const COMPANY_OPTIONS = {
  ANADOLU_BAKIR: {
    index: 1,
    name: 'Anadolu Bakır',
  },
  ANADOLU8: {
    index: 6,
    name: 'Anadolu8',
  },
  // Default olarak Anadolu8 kullanılacak
  DEFAULT: {
    index: 6,
    name: 'Anadolu8',
  },
};

/**
 * Test senaryoları için kullanıcı grupları
 */
export const USER_GROUPS = {
  ALL_USERS: Object.values(TEST_USERS),
  APPROVERS: [
    TEST_USERS.FINANCE_USER,
    TEST_USERS.INTERNAL_MARKET_MANAGER,
    TEST_USERS.EXTERNAL_MARKET_MANAGER,
    TEST_USERS.FINANCE_MANAGER,
    TEST_USERS.GENERAL_MANAGER,
  ],
  DEPARTMENT_MANAGERS: [
    TEST_USERS.INTERNAL_MARKET_MANAGER,
    TEST_USERS.EXTERNAL_MARKET_MANAGER,
  ],
  FINANCE_TEAM: [
    TEST_USERS.FINANCE_USER,
    TEST_USERS.FINANCE_MANAGER,
  ],
  CAN_REJECT: [
    TEST_USERS.FINANCE_MANAGER,
    TEST_USERS.GENERAL_MANAGER,
  ],
};

/**
 * Aşama bazlı kullanıcı haritası
 */
export const STAGE_USERS = {
  STAGE_1: TEST_USERS.FINANCE_USER,
  STAGE_2_INTERNAL: TEST_USERS.INTERNAL_MARKET_MANAGER,
  STAGE_2_EXTERNAL: TEST_USERS.EXTERNAL_MARKET_MANAGER,
  STAGE_3: TEST_USERS.FINANCE_USER,
  STAGE_4: TEST_USERS.FINANCE_MANAGER,
  STAGE_5: TEST_USERS.GENERAL_MANAGER,
  STAGE_6: TEST_USERS.FINANCE_USER,
};

/**
 * Test için örnek veriler
 */
export const TEST_DATA = {
  VALID_DATE_RANGE: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  INVALID_DATE_RANGE: {
    startDate: '2024-12-31',
    endDate: '2024-01-01', // Ters tarih
  },
  CURRENCIES: ['TRY', 'USD', 'EUR'],
  SAMPLE_INVOICE: {
    invoiceNumber: 'INV-2024-001',
    vendorName: 'Test Cari',
    amount: 10000,
    payableAmount: 8000,
    currency: 'TRY',
  },
  REJECTION_REASONS: [
    'Ekstre eksik',
    'Tutar hatalı',
    'Fatura bilgileri yanlış',
    'Ek döküman gerekli',
  ],
};

/**
 * Helper function: Rol adına göre kullanıcı getir
 */
export function getUserByRole(role: string): TestUser | undefined {
  return Object.values(TEST_USERS).find(user => user.role === role);
}

/**
 * Helper function: Aşama numarasına göre kullanıcı getir
 */
export function getUsersForStage(stage: number): TestUser[] {
  return Object.values(TEST_USERS).filter(user =>
    user.stagePermissions.includes(stage)
  );
}

/**
 * Helper function: Düzenleme yetkisi olan kullanıcıları getir
 */
export function getEditableUsers(): TestUser[] {
  return Object.values(TEST_USERS).filter(user => user.canEdit);
}
