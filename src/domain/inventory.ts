import { InventoryItem, Service } from '../types';

export interface DepletionResult {
  updatedInventory: InventoryItem[];
  depletedItems: Array<{ name: string; quantity: number; unit: string; remaining: number }>;
  warningItems: string[];
}

/**
 * Atomically depletes BOM consumable materials upon treatment checkin.
 * Enforces Principle II of Constitution.
 */
export function depleteServiceBOM(
  service: Service,
  currentInventory: InventoryItem[]
): DepletionResult {
  const invMap = new Map(currentInventory.map((i) => [i.id, { ...i }]));
  const depletedItems: Array<{ name: string; quantity: number; unit: string; remaining: number }> = [];
  const warningItems: string[] = [];

  for (const bomItem of service.bom) {
    const inv = invMap.get(bomItem.materialId);
    if (inv) {
      const newQty = Math.max(0, inv.quantity - bomItem.quantity);
      inv.quantity = newQty;
      depletedItems.push({
        name: inv.name,
        quantity: bomItem.quantity,
        unit: bomItem.unit,
        remaining: newQty,
      });

      if (newQty <= inv.minThreshold) {
        warningItems.push(`${inv.name} (còn ${newQty} ${inv.unit}, dưới ngưỡng ${inv.minThreshold})`);
      }
    }
  }

  return {
    updatedInventory: Array.from(invMap.values()),
    depletedItems,
    warningItems,
  };
}

/**
 * Filter items with low stock or near expiration
 */
export function getInventoryAlerts(inventory: InventoryItem[]) {
  const today = new Date();
  const warningDays = 60; // 60 days near expiration
  const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold);
  const nearExpiry = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= warningDays;
  });

  return { lowStock, nearExpiry };
}

