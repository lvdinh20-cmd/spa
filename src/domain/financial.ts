import { Order, Service, InventoryItem } from '../types';

/**
 * Format currency to Vietnam Dong (VND) with thousands separator.
 * Floating point currency arithmetic is strictly avoided.
 */
export function formatVND(amount: number): string {
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Deterministic Gross Profit calculation per Order:
 * Gross Profit = Revenue - (Commissions + Consumable Materials Cost + Payment Processing Fees)
 */
export function calculateOrderGrossProfit(
  order: Partial<Order>,
  servicesMap: Map<string, Service>,
  inventoryMap: Map<string, InventoryItem>
): number {
  const revenue = Math.round(order.totalAmount || 0);
  let totalCommissions = 0;
  let totalBOMCost = 0;

  // 1. Calculate commissions & consumable costs from items
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      if (item.type === 'service') {
        const srv = servicesMap.get(item.itemId);
        if (srv) {
          // Tour fees
          totalCommissions += Math.round((srv.tourFeePrimary || 0) * item.quantity);
          if (item.secondaryTechId) {
            totalCommissions += Math.round((srv.tourFeeSecondary || 0) * item.quantity);
          }

          // BOM consumables cost
          for (const bomItem of srv.bom) {
            const mat = inventoryMap.get(bomItem.materialId);
            if (mat) {
              totalBOMCost += Math.round(bomItem.quantity * mat.costPrice * item.quantity);
            }
          }
        }
      } else if (item.type === 'product') {
        // Retail product cost price
        const prod = inventoryMap.get(item.itemId);
        if (prod) {
          totalBOMCost += Math.round((prod.costPrice || 0) * item.quantity);
        }
      }
    }
  }

  // 2. Sales commission for the seller (e.g. 5% if applicable or package specific)
  // For packages, commission is typically ~5-8%
  const salesCommission = Math.round((revenue * 0.05)); // 5% default sales commission
  totalCommissions += salesCommission;

  // 3. Payment fee (e.g. 1.2% for bank card, 0% for VietQR/Cash)
  let paymentFee = 0;
  if (order.paymentMethod === 'card') {
    paymentFee = Math.round(revenue * 0.012);
  }

  const grossProfit = revenue - (totalCommissions + totalBOMCost + paymentFee);
  return Math.max(0, grossProfit);
}

