import { repository } from './repository/prismaRepository';
import { Business, User, Sale, Purchase, Expense, Debt, Alert, AuditLog } from '@prisma/client';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ShopService {
  /**
   * Lazily checks if the business has had 3 months of inactivity.
   * If yes, and not currently suspended, sets suspendedAt = now.
   * Returns true if suspended.
   */
  async checkInactivityAndSuspend(business: Business): Promise<boolean> {
    if (business.suspendedAt) {
      return true;
    }

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (business.lastActivityAt <= threeMonthsAgo) {
      await repository.suspendBusiness(business.id);
      return true;
    }

    return false;
  }

  /**
   * Reactivate a suspended business.
   */
  async reactivateBusiness(businessId: string): Promise<void> {
    await repository.reactivateBusiness(businessId);
  }

  /**
   * Record a sale: validates product, checks stock, deducts inventory,
   * creates sale record, checks low-stock alert, and updates last activity.
   */
  async recordSale(params: {
    businessId: string;
    productName: string;
    quantity: number;
    recordedBy: User;
    totalKobo?: number;
  }): Promise<ServiceResult<{ sale: Sale; remainingStock: number; alert?: Alert }>> {
    const product = await repository.findProductByName(params.businessId, params.productName);
    if (!product) {
      return {
        success: false,
        error: `Product "${params.productName}" not found in inventory.`,
      };
    }

    if (product.quantity < params.quantity) {
      return {
        success: false,
        error: `Only ${product.quantity} ${product.name} left. Sale not recorded.`,
      };
    }

    const totalKobo = params.totalKobo ?? 0;

    const result = await repository.recordSale({
      businessId: params.businessId,
      productId: product.id,
      quantity: params.quantity,
      totalKobo,
      recordedById: params.recordedBy.id,
    });

    await repository.updateLastActivity(params.businessId);

    return {
      success: true,
      data: {
        sale: result.sale,
        remainingStock: result.updatedProduct.quantity,
        alert: result.alert,
      },
      message: `Sold ${params.quantity} ${product.name}. Remaining: ${result.updatedProduct.quantity}.`,
    };
  }

  /**
   * Record a stock purchase (stock coming in):
   * Increases inventory, records purchase, updates last activity.
   */
  async recordPurchase(params: {
    businessId: string;
    productName: string;
    quantity: number;
    costKobo: number;
    recordedBy: User;
  }): Promise<ServiceResult<{ purchase: Purchase; newStock: number }>> {
    let product = await repository.findProductByName(params.businessId, params.productName);
    if (!product) {
      // If product does not exist, initialize it
      product = await repository.createProduct(params.businessId, params.productName, 0);
    }

    const result = await repository.recordPurchase({
      businessId: params.businessId,
      productId: product.id,
      quantity: params.quantity,
      costKobo: params.costKobo,
      recordedById: params.recordedBy.id,
    });

    await repository.updateLastActivity(params.businessId);

    return {
      success: true,
      data: {
        purchase: result.purchase,
        newStock: result.updatedProduct.quantity,
      },
      message: `Purchased ${params.quantity} ${product.name} for ₦${(params.costKobo / 100).toLocaleString()}. New stock: ${result.updatedProduct.quantity}.`,
    };
  }

  /**
   * Record an expense: note is required.
   * Compares against largeExpenseThresholdKobo to trigger alert.
   */
  async recordExpense(params: {
    businessId: string;
    amountKobo: number;
    note: string;
    recordedBy: User;
  }): Promise<ServiceResult<{ expense: Expense; alert?: Alert }>> {
    if (!params.note || params.note.trim().length === 0) {
      return {
        success: false,
        error: 'Tell me what it was for, for example: /spent 5000 fuel for delivery bike.',
      };
    }

    const result = await repository.recordExpense({
      businessId: params.businessId,
      amountKobo: params.amountKobo,
      note: params.note.trim(),
      recordedById: params.recordedBy.id,
    });

    await repository.updateLastActivity(params.businessId);

    return {
      success: true,
      data: result,
      message: `Recorded: expense of ₦${(params.amountKobo / 100).toLocaleString()}, ${params.note.trim()}.`,
    };
  }

  /**
   * Record customer debt: creates or matches customer, logs open debt.
   */
  async recordDebt(params: {
    businessId: string;
    customerName: string;
    amountKobo: number;
    phone?: string;
  }): Promise<ServiceResult<{ debt: Debt; customerName: string }>> {
    let customer = await repository.findCustomerByName(params.businessId, params.customerName);
    if (!customer) {
      customer = await repository.createCustomer(
        params.businessId,
        params.customerName,
        params.phone
      );
    }

    const debt = await repository.recordDebt({
      businessId: params.businessId,
      customerId: customer.id,
      amountKobo: params.amountKobo,
    });

    await repository.updateLastActivity(params.businessId);

    return {
      success: true,
      data: { debt, customerName: customer.name },
      message: `Recorded: ${customer.name} owes ₦${(params.amountKobo / 100).toLocaleString()}.`,
    };
  }

  /**
   * Mark debt paid: resolves oldest open debt first.
   * Returns remaining open debt count for that customer.
   */
  async markDebtPaid(params: {
    businessId: string;
    customerName: string;
  }): Promise<ServiceResult<{ settledDebt?: Debt; remainingCount: number }>> {
    const customer = await repository.findCustomerByName(params.businessId, params.customerName);
    if (!customer) {
      return {
        success: false,
        error: `${params.customerName} has no open debt.`,
      };
    }

    const oldestDebt = await repository.getOldestOpenDebtForCustomer(
      params.businessId,
      customer.id
    );
    if (!oldestDebt) {
      return {
        success: false,
        error: `${customer.name} has no open debt.`,
      };
    }

    const settled = await repository.settleDebt(oldestDebt.id);
    const remainingCount = await repository.countRemainingOpenDebts(
      params.businessId,
      customer.id
    );

    await repository.updateLastActivity(params.businessId);

    const message =
      remainingCount > 0
        ? `Recorded: ${customer.name} paid. ${remainingCount} debt${remainingCount > 1 ? 's' : ''} still open.`
        : `Recorded: ${customer.name} paid. All debts cleared.`;

    return {
      success: true,
      data: { settledDebt: settled, remainingCount },
      message,
    };
  }

  /**
   * In-place correction with audit log: logs prior to mutation.
   */
  async correctRecord(params: {
    businessId: string;
    entityType: string;
    entityId: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedById: string;
    updateFn: () => Promise<void>;
  }): Promise<AuditLog> {
    const log = await repository.correctRecord(params);
    await repository.updateLastActivity(params.businessId);
    return log;
  }

  /**
   * Query low stock products for the shop.
   */
  async getLowStock(business: Business) {
    return repository.getLowStockProducts(business.id, business.lowStockThresholdUnits);
  }

  /**
   * Query debt summary: total owed and oldest debt in days.
   */
  async getDebtSummary(businessId: string): Promise<{
    customerCount: number;
    totalOwedKobo: number;
    oldestDays: number;
  }> {
    const debts = await repository.getOpenDebts(businessId);
    if (debts.length === 0) {
      return { customerCount: 0, totalOwedKobo: 0, oldestDays: 0 };
    }

    const uniqueCustomers = new Set(debts.map((d) => d.customerId));
    const totalOwedKobo = debts.reduce((sum, d) => sum + d.amountKobo, 0);

    const oldestDate = debts[0].createdAt;
    const diffTime = Math.abs(Date.now() - new Date(oldestDate).getTime());
    const oldestDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      customerCount: uniqueCustomers.size,
      totalOwedKobo,
      oldestDays,
    };
  }

  /**
   * Export all shop records as synchronous CSV files.
   * Does NOT alter lastActivityAt or suspendedAt.
   */
  async exportBusinessData(businessId: string) {
    return repository.exportAllData(businessId);
  }
}

export const shopService = new ShopService();
