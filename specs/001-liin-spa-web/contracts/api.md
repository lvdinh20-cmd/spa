# API Contracts & Service Interfaces: Liin Spa Web Application

## Storage & Service Interfaces

```typescript
export interface IAuthService {
  getCurrentUser(): Staff;
  switchRole(role: 'admin' | 'receptionist' | 'technician'): void;
  hasPermission(permission: string): boolean;
}

export interface ICustomerService {
  getAll(): Customer[];
  getById(id: string): Customer | undefined;
  create(data: Omit<Customer, 'id' | 'createdAt'>): Customer;
  update(id: string, data: Partial<Customer>): Customer;
  checkinTreatment(checkinData: CheckinPayload): CheckinResult;
}

export interface IPosService {
  calculateTotals(items: OrderItem[], discount: number): OrderTotals;
  generateVietQrUrl(orderCode: string, amount: number): string;
  createOrder(orderData: CreateOrderPayload): Order;
  calculateGrossProfit(order: Order): number;
}

export interface IInventoryService {
  getItems(type?: 'commercial' | 'consumable'): InventoryItem[];
  depleteBOM(serviceId: string, checkinId: string): BOMDepletionResult;
  adjustStock(itemId: string, delta: number, reason: string): void;
}

export interface IBookingService {
  getBookings(date: string): Appointment[];
  checkCollision(booking: Partial<Appointment>): CollisionResult;
  createBooking(booking: Omit<Appointment, 'id'>): Appointment;
  updateStatus(id: string, status: Appointment['status']): void;
}

export interface IExcelService {
  downloadTemplate(entity: 'customers' | 'services' | 'inventory' | 'staff'): void;
  exportData<T>(entity: string, data: T[]): void;
  importData<T>(file: File, entity: string): Promise<ImportResult<T>>;
}
```

