# Phase 1 Data Model: Liin Spa Web Application

## 1. Domain Entities & Schemas

### User / Staff (`staff`)
- `id`: string (UUID)
- `name`: string
- `phone`: string (unique)
- `role`: enum (`admin`, `receptionist`, `technician`)
- `skills`: string[] (IDs of services the technician is qualified to perform)
- `baseSalary`: number (integer VND)
- `commissionRate`: number (% for sales, e.g., 5%)
- `status`: enum (`active`, `on_leave`, `inactive`)

### Customer (`customers`)
- `id`: string (UUID)
- `fullName`: string
- `phone`: string (unique primary identifier)
- `gender`: enum (`female`, `male`, `other`)
- `birthday`: string (YYYY-MM-DD)
- `source`: enum (`facebook`, `referral`, `walk_in`, `tiktok`, `other`)
- `skinType`: string
- `allergies`: string
- `totalSpend`: number (VND)
- `debtBalance`: number (VND)
- `loyaltyPoints`: number
- `walletBalance`: number (Prepaid wallet VND)
- `createdAt`: string (ISO)

### Service (`services`)
- `id`: string (UUID)
- `code`: string (e.g. `FAC-01`)
- `name`: string
- `category`: string (Chăm sóc da, Trị liệu mụn, Massage body, Triệt lông, Nail)
- `durationMinutes`: number (e.g. 60, 90)
- `price`: number (VND)
- `happyHourPrice`: number (optional, VND)
- `tourFeePrimary`: number (VND for primary technician)
- `tourFeeSecondary`: number (VND for secondary technician)
- `bom`: Array<{ materialId: string, quantity: number, unit: string }>
- `steps`: string[] (Step-by-step procedure description)

### Package / Combo (`packages`)
- `id`: string (UUID)
- `name`: string
- `originalPrice`: number (VND)
- `price`: number (Discounted bundle price in VND)
- `validityDays`: number (e.g. 180 days)
- `services`: Array<{ serviceId: string, sessionCount: number }>
- `salesCommission`: number (VND or % of contract)

### Customer Treatment Card (`treatment_cards`)
- `id`: string (UUID)
- `customerId`: string
- `packageId`: string
- `packageName`: string
- `totalSessions`: number
- `usedSessions`: number
- `remainingSessions`: number
- `status`: enum (`active`, `paused`, `depleted`, `expired`)
- `activatedDate`: string (ISO)
- `expiryDate`: string (ISO)

### Treatment Check-in Record (`checkin_records`)
- `id`: string (UUID)
- `cardId`: string
- `customerId`: string
- `serviceId`: string
- `sessionNumber`: number
- `timestamp`: string (ISO)
- `primaryTechId`: string
- `secondaryTechId`: string (optional)
- `stepsPerformed`: string
- `clientReaction`: string
- `beforePhotoUrl`: string (optional)
- `afterPhotoUrl`: string (optional)

### Order / Invoice (`orders`)
- `id`: string (UUID)
- `code`: string (e.g. `HD-20261104-001`)
- `customerId`: string
- `customerName`: string
- `cashierId`: string
- `sellerId`: string (Staff member credited with sales commission)
- `items`: Array<{
    type: 'service' | 'package' | 'product',
    itemId: string,
    name: string,
    quantity: number,
    price: number,
    primaryTechId?: string,
    secondaryTechId?: string
  }>
- `subtotal`: number
- `discountAmount`: number
- `totalAmount`: number
- `paidAmount`: number
- `debtAmount`: number
- `paymentMethod`: enum (`cash`, `vietqr`, `card`, `wallet`, `mixed`)
- `grossProfit`: number (Computed: `Revenue - (Commissions + Consumables + Fees)`)
- `createdAt`: string (ISO)

### Inventory Item (`inventory_items`)
- `id`: string (UUID)
- `sku`: string (unique)
- `barcode`: string
- `name`: string
- `type`: enum (`commercial`, `consumable`)
- `unit`: string (chai, lọ, miếng, ml, gram, hộp)
- `quantity`: number
- `minThreshold`: number
- `costPrice`: number (VND)
- `retailPrice`: number (VND)
- `expiryDate`: string (YYYY-MM-DD)
- `batchNumber`: string

### Appointment / Booking (`appointments`)
- `id`: string (UUID)
- `customerId`: string
- `customerName`: string
- `customerPhone`: string
- `serviceId`: string
- `serviceName`: string
- `staffId`: string
- `bedId`: string (e.g. `Giường 1 - Phòng VIP`, `Giường 2 - Phòng Facial`)
- `startTime`: string (YYYY-MM-DDTHH:mm)
- `endTime`: string (YYYY-MM-DDTHH:mm)
- `status`: enum (`booked`, `arrived`, `in_progress`, `completed`, `cancelled`)
- `notes`: string

