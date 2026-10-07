import {
  Business,
  User,
  Customer,
  Product,
  Sale,
  Purchase,
  Expense,
  Debt,
  Alert,
  AuditLog,
  WhatsAppMessage,
} from '@prisma/client';

export interface LogMessageParams {
  businessId?: string;
  fromPhone: string;
  rawText: string;
  parsedCommand?: string;
  status: 'PARSED' | 'UNRECOGNIZED' | 'ERROR';
}

export interface IShopRepository {
  // Business & Activity
  getBusinessById(id: string): Promise<Business | null>;
  getBusinessByOwnerPhone(phone: string): Promise<Business | null>;
  updateLastActivity(businessId: string): Promise<void>;
  suspendBusiness(businessId: string): Promise<void>;
  reactivateBusiness(businessId: string): Promise<void>;
  updateSettings(
    businessId: string,
    data: { lowStockThresholdUnits?: number; largeExpenseThresholdKobo?: number },
    actorId: string
  ): Promise<Business>;

  // Users & Staff
  getUserByPhone(phone: string): Promise<(User & { business: Business }) | null>;

  // Products & Inventory
  findProductByName(businessId: string, name: string): Promise<Product | null>;
  createProduct(businessId: string, name: string, quantity?: number): Promise<Product>;
  getLowStockProducts(businessId: string, threshold: number): Promise<Product[]>;
  getAllProducts(businessId: string): Promise<Product[]>;

  // Customers & Debts
  findCustomerByName(businessId: string, name: string): Promise<Customer | null>;
  createCustomer(businessId: string, name: string, phone?: string): Promise<Customer>;
  getOpenDebts(businessId: string): Promise<(Debt & { customer: Customer })[]>;
  getOldestOpenDebtForCustomer(businessId: string, customerId: string): Promise<Debt | null>;
  countRemainingOpenDebts(businessId: string, customerId: string): Promise<number>;

  // Transactions
  recordSale(params: {
    businessId: string;
    productId: string;
    quantity: number;
    totalKobo: number;
    recordedById: string;
  }): Promise<{ sale: Sale; updatedProduct: Product; alert?: Alert }>;

  recordPurchase(params: {
    businessId: string;
    productId: string;
    quantity: number;
    costKobo: number;
    recordedById: string;
  }): Promise<{ purchase: Purchase; updatedProduct: Product; alert?: Alert }>;

  recordExpense(params: {
    businessId: string;
    amountKobo: number;
    note: string;
    recordedById: string;
  }): Promise<{ expense: Expense; alert?: Alert }>;

  recordDebt(params: {
    businessId: string;
    customerId: string;
    amountKobo: number;
  }): Promise<Debt>;

  settleDebt(debtId: string): Promise<Debt>;

  // Audited Corrections
  correctRecord(params: {
    businessId: string;
    entityType: string;
    entityId: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedById: string;
    updateFn: () => Promise<void>;
  }): Promise<AuditLog>;

  // Alerts
  getActiveAlerts(businessId: string): Promise<Alert[]>;
  resolveAlert(alertId: string): Promise<Alert>;

  // Messages
  logWhatsAppMessage(params: LogMessageParams): Promise<WhatsAppMessage>;

  // Full Export
  exportAllData(businessId: string): Promise<{
    sales: Sale[];
    purchases: Purchase[];
    expenses: Expense[];
    debts: Debt[];
    customers: Customer[];
    products: Product[];
  }>;
}
