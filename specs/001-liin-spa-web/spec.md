# Feature Specification: Liin Spa Web Application (UI PROMAX & RBAC)

**Feature Branch**: `001-liin-spa-web`

**Created**: 2026-11-04

**Status**: Ready for Planning

**Input**: User description: "Dùng Spec Kit và UI PROMAX để triển khai viết app web quản lý Liin Spa. bổ sung thêm phân quyền truy cập cho admin và nhân viên"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Role-Based Authentication & Access Control (Priority: P1)

As an Admin or Staff member (Receptionist, Technician), I want to securely log into the system with my credentials and see only the navigation menus, operational actions, and financial data permitted for my role, so that business confidentiality and operational boundaries are preserved.

**Why this priority**: RBAC forms the foundational security boundary. All data, views, and actions in subsequent stories depend on whether the active user is an Admin, Receptionist/Cashier, or Technician.

**Independent Test**: Can be tested by logging in as Admin (accessing full P&L, system settings, staff payroll) vs. logging in as Staff (restricted to booking, assigned treatment check-in, and personal commission log without access to global revenue or system settings).

**Acceptance Scenarios**:

1. **Given** a valid Admin user credentials, **When** the Admin logs in, **Then** the application displays the full navigation dashboard including Financial P&L, Staff Management, Commission Settings, System Config, and All-Entity Excel Import/Export.
2. **Given** a Receptionist/Cashier user credentials, **When** the user logs in, **Then** they can access Booking Calendar, Customer Profiles, and POS billing, but cannot view Gross Margin calculations, staff salary formulas, or system configuration.
3. **Given** a Technician (KTV) user credentials, **When** the user logs in, **Then** they see their daily treatment schedule, customer treatment check-in screen, and their own personal commission earning log, with all global financial reports hidden.

---

### User Story 2 - Customer 360 & Treatment Card Lifecycle (Priority: P1)

As a Receptionist or Technician, I want to manage customer profiles (including skin condition, allergies, treatment packages, before/after photos) and check in treatment sessions with automatic remaining-session decrement, so that client histories are accurate and dispute-free.

**Why this priority**: Customer care and treatment tracking is the core business driver for a spa. Customers purchase multi-session packages that must be honored and tracked reliably.

**Independent Test**: Register a customer, attach a 10-session package, check in 1 session with assigned technician and clinical notes, and verify remaining sessions decrement from 10 to 9 without floating-point errors.

**Acceptance Scenarios**:

1. **Given** an existing customer with an active treatment package of 10 sessions, **When** a technician completes a session and enters clinical notes with Before/After photos, **Then** the remaining session count decreases to 9, completed count increments to 1, and the session log records timestamp, primary KTV, and steps completed.
2. **Given** a customer with 0 remaining sessions, **When** staff attempts to check in another session, **Then** the system blocks the action and prompts the user to renew or purchase a new package.
3. **Given** a treatment package with an expired validity date, **When** staff views the card, **Then** its status displays as `Expired` and check-in requires admin override.

---

### User Story 3 - POS Multi-Item Checkout, Dynamic VietQR & P&L Calculation (Priority: P2)

As a Cashier/Receptionist, I want to create an invoice combining single services, combo packages, and retail cosmetic products, accept multiple payment methods (including dynamic VietQR generation and partial installments), and have the system record gross profit per order.

**Why this priority**: Generates revenue, captures debts, and calculates real gross margin as required by Principle I of the Constitution.

**Independent Test**: Create an order with 1 service (500,000 VND) and 1 cosmetic item (300,000 VND), apply a 10% voucher, choose Bank Transfer to generate VietQR, and check that gross profit is computed as: Revenue - (KTV commission + Sales commission + BOM cost + Payment fees).

**Acceptance Scenarios**:

1. **Given** an order totaling 1,200,000 VND, **When** the cashier selects "Chuyển khoản VietQR", **Then** the system renders a dynamic VietQR code with exact amount and order reference in the description for instant bank scanning.
2. **Given** a customer paying a 50% deposit on a 10,000,000 VND package, **When** checkout completes, **Then** the invoice records 5,000,000 VND paid, 5,000,000 VND in customer debt ledger, and tags the sale with the consulting staff ID.
3. **Given** an order checkout event, **When** the order is finalized, **Then** the order gross profit ledger is automatically computed and stored in integer VND.

---

### User Story 4 - Service Menu, BOM Consumables & Dual-Inventory Depletion (Priority: P2)

As a Spa Manager, I want to configure service procedures with standard consumable material consumption (BOM) and separate retail warehouse from internal supply warehouse, so that stocks auto-deplete upon treatment completion.

**Why this priority**: Enforces Principle II (Dual-Inventory & Automated Real-Time BOM Depletion) to prevent inventory loss and provide accurate service cost accounting.

**Independent Test**: Define a facial service requiring 15ml of essence and 1 mask sheet from the internal supply warehouse. Perform a treatment check-in and verify that the internal warehouse inventory decreases by exactly 15ml and 1 mask.

**Acceptance Scenarios**:

1. **Given** an internal warehouse with 100 mask sheets, **When** a session consuming 1 mask sheet is confirmed, **Then** internal stock immediately updates to 99 mask sheets with an audit log entry.
2. **Given** a retail cosmetic product in the Commercial Warehouse, **When** sold at the POS counter, **Then** only the Commercial Warehouse stock is decremented, leaving the Internal Consumables stock unaffected.
3. **Given** any stock item reaching or falling below the minimum threshold, **When** viewing the inventory dashboard, **Then** a warning badge flags the item as "Sắp hết hàng".

---

### User Story 5 - Conflict-Free Booking & Timeline Calendar (Priority: P3)

As a Receptionist, I want a visual Timeline Calendar displaying appointments across treatment beds/rooms and assigned technicians, with conflict detection to avoid double-booking.

**Why this priority**: Operational smoothness and customer satisfaction require that rooms and staff are never double-booked.

**Independent Test**: Attempt to book Technician A for Room 1 at 10:00 AM - 11:30 AM, then attempt to book Technician A for another client at 10:30 AM; verify the system rejects or flags the conflict immediately.

**Acceptance Scenarios**:

1. **Given** a technician is already assigned to an ongoing service from 09:00 to 10:30, **When** staff attempts to book that technician for 10:00, **Then** the system flags a "Kỹ thuật viên đang bận" collision error.
2. **Given** all spa beds in the Facial Room are occupied at 14:00, **When** staff attempts to add an appointment, **Then** the system flags "Hết giường/phòng trống".
3. **Given** an appointment is scheduled, **When** the appointment state transitions from `Đã đặt` -> `Đã đến / Check-in` -> `Đang làm` -> `Hoàn thành`, **Then** the calendar slot updates its visual badge in real time.

---

### User Story 6 - Transparent Multi-Tier Commission & Payroll Reconciliation (Priority: P3)

As an Admin and Staff member, I want the system to automatically compute tour fees for primary/secondary technicians, sales commissions for consultants, and tips, providing an itemized daily/monthly breakdown.

**Why this priority**: Enforces Principle V of the Constitution to maintain staff morale, transparency, and eliminate salary disputes.

**Independent Test**: Complete a treatment session with Primary KTV (receiving 50,000 VND tour fee) and Secondary KTV (receiving 30,000 VND tour fee). Check both technicians' personal earning ledger to verify exact credits.

**Acceptance Scenarios**:

1. **Given** an invoice sold by Consultant X and serviced by Technician Y, **When** payment is settled, **Then** Consultant X receives their configured sales commission and Technician Y receives their service tour fee in their individual payroll logs.
2. **Given** a staff member viewing their profile, **When** they click "Bảng kê hoa hồng", **Then** they see an itemized list of every service done, tip received, and commission earned for the selected month.

---

### User Story 7 - Standardized Excel Bulk Import & Export (Priority: P4)

As an Admin, I want to export and import Excel (.xlsx / .csv) files for Customers, Services & BOM, Products & Inventory, Staff, and Financial Ledgers with downloadable templates and row-by-row error validation.

**Why this priority**: Enforces Principle VII of the Constitution for seamless data migration, reporting, and operational portability.

**Independent Test**: Download the Customer Excel Template, fill in 3 valid customer rows and 1 invalid row (invalid phone number), upload the file, and verify that 3 customers are imported while the invalid row is reported with row number and error reason.

**Acceptance Scenarios**:

1. **Given** an Admin downloading a template, **When** clicking "Tải mẫu Excel", **Then** the system downloads a formatted `.xlsx` file with sample columns and headers.
2. **Given** an upload containing invalid rows, **When** processing the import, **Then** the system alerts the user with an itemized table of errors without committing corrupted records.
3. **Given** an authorized user exporting data, **When** filtering by date range and clicking "Xuất Excel", **Then** the system generates an Excel file and logs the export event in the security audit trail.

---

### Edge Cases

- **Concurrent Booking**: Two receptionists attempting to book the same room/bed simultaneously; system handles via optimistic locking and immediate conflict notification.
- **Package Cancellation / Refund**: Customer requests refund on an unfinished package; system calculates refund value based on remaining sessions minus consumed services at regular non-discounted rate.
- **Negative Stock Prevention**: Attempting to check in a treatment when required BOM consumables have 0 stock; system alerts staff with option for manager override.
- **Offline / Network Interruption during VietQR**: QR display maintains countdown timer and polling mechanism to confirm receipt once connection recovers.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide Role-Based Access Control supporting at minimum two primary access tiers: `Admin` (full system access) and `Staff` (segmented into `Receptionist/Cashier` and `Technician/Doctor`).
- **FR-002**: System MUST protect sensitive financial reports (revenue, gross margins, company-wide payroll) so that only Admin roles can view or export them.
- **FR-003**: System MUST provide a responsive, high-end "UI PROMAX" design system using a luxury Spa palette (Rose Gold, Champagne, Emerald, Deep Slate) with dark/light theme support and responsive mobile/tablet/desktop layouts.
- **FR-004**: System MUST maintain Customer Profiles with unique phone number identification, skin condition notes, allergy warnings, and Before/After photo galleries.
- **FR-005**: System MUST govern Treatment Packages with a strict state machine (`Active`, `Paused`, `Depleted`, `Expired`) maintaining the mathematical invariant: Total = Done + Remaining.
- **FR-006**: System MUST record treatment check-ins with timestamp, primary technician, secondary technician, detailed procedural steps, client reaction, and photo evidence.
- **FR-007**: System MUST provide a POS interface allowing combined sales of Single Services, Combo Packages, and Retail Cosmetic Products on a single bill.
- **FR-008**: System MUST support dynamic VietQR payment code generation conforming to Napas247 standards with exact invoice amount and order reference code.
- **FR-009**: System MUST support split payments (e.g., cash + card + customer prepaid wallet) and installment/deposit tracking with customer debt ledgers.
- **FR-010**: System MUST calculate Gross Profit per order deterministically: `Gross Profit = Revenue - (Commissions + Consumables Cost + Payment Fees)` using exact integer VND.
- **FR-011**: System MUST support Dual-Inventory management strictly segregating `Commercial Retail Inventory` from `Internal Consumables Inventory`.
- **FR-012**: System MUST categorize services into distinct taxonomy categories (Trị liệu da mặt, Chăm sóc da chuyên sâu, Massage & Thư giãn, Triệt lông, v.v.), display detailed service descriptions (công dụng, hiệu quả, quy trình), and associate each service with a Bill of Materials (BOM) that atomically decrements internal consumable supplies upon session completion.
- **FR-013**: System MUST monitor inventory levels and visually flag items with low stock or approaching expiration dates (FEFO/FIFO).
- **FR-014**: System MUST provide an interactive Timeline Calendar for appointment management with real-time room/bed and technician collision avoidance.
- **FR-015**: System MUST compute multi-tier commissions: service tour fee (split by primary vs. secondary KTV), sales commission (fixed amount or % on package/retail sale), and customer tips.
- **FR-016**: System MUST provide comprehensive Staff Management: adding new staff with system credentials (username and password), role, start date (ngày vào làm), skill matrix, editing and deactivating/removing staff safely.
- **FR-017**: System MUST provide individual commission and shift earning ledgers for every employee for transparent daily/monthly reconciliation.
- **FR-017**: System MUST provide standardized Excel (.xlsx) import and export for all primary entities: Customers, Services/BOM, Packages, Inventory Items, Staff, and Cashbook Ledgers.
- **FR-018**: System MUST validate Excel imports atomically and produce itemized error reports with row indices for any invalid records.
- **FR-019**: System MUST maintain an audit trail for bulk customer exports and financial adjustments to satisfy privacy and anti-exfiltration requirements.
- **FR-020**: System MUST persist all state reliably in local storage / IndexedDB with options for cloud backend synchronization.

### Key Entities

- **User / Staff**: ID, Name, Phone, Role (`admin`, `receptionist`, `technician`), Skill Matrix, Base Salary, Commission Rates, Status.
- **Customer**: ID, Full Name, Phone (Unique Key), Gender, Birthday, Skin Type, Allergy Notes, Total Spend, Loyalty Points, Wallet Balance.
- **Service**: ID, Code, Name, Category, Duration (minutes), Price, Happy Hour Price, Tour Fee Primary, Tour Fee Secondary, BOM Recipe (List of Material ID + Quantity).
- **Package / Combo**: ID, Name, Price, Original Value, Duration Days, Service Items (List of Service ID + Session Count), Sales Commission.
- **Customer Treatment Card**: ID, Customer ID, Package ID, Total Sessions, Used Sessions, Remaining Sessions, Status (`Active`, `Paused`, `Depleted`, `Expired`), Activated Date, Expiry Date.
- **Check-in Record**: ID, Card ID, Session Number, Timestamp, Primary KTV ID, Secondary KTV ID, Steps Completed, Feedback, Before/After Image URLs.
- **Order / Invoice**: ID, Code, Customer ID, Cashier ID, Created At, Items (Services, Packages, Products), Subtotal, Discount, Total Amount, Paid Amount, Debt Amount, Payment Method (`Cash`, `VietQR`, `Card`, `Wallet`), Gross Profit.
- **Inventory Item**: ID, SKU, Barcode, Name, Type (`Commercial`, `Consumable`), Unit (ml, piece, bottle, box), In-Stock Qty, Min Threshold, Cost Price, Retail Price, Expiry Date.
- **Appointment / Booking**: ID, Customer ID, Service ID, Staff ID, Bed/Room ID, Start Time, End Time, Status (`Booked`, `Arrived`, `In_Progress`, `Completed`, `Cancelled`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A receptionist can complete a full customer check-in and session decrement in under 30 seconds on tablet or desktop.
- **SC-002**: A cashier can create an order, apply vouchers, and display dynamic VietQR in under 15 seconds.
- **SC-003**: 100% of order Gross Profit calculations match the mathematical formula with zero rounding discrepancy down to single VND.
- **SC-004**: Zero double-booking collisions permitted by the scheduling conflict engine during concurrent appointment creation.
- **SC-005**: Excel import parses up to 1,000 customer or inventory records in under 3 seconds with comprehensive row-level error reporting.
- **SC-006**: UI PROMAX responsive design renders smoothly at 60 FPS on mobile, iPad/tablet, and desktop resolutions.

## Assumptions

- Currency is Vietnam Dong (VND) without floating fractional cents.
- User interface defaults to Vietnamese language tailored for Vietnam Spa & Salon operations.
- Application operates as a modern client-side Single Page Application (SPA) with reactive state management and IndexedDB persistence, ready for Node.js / cloud backend connection.
- VietQR generation conforms to the open Napas247 EMVCo QR format without requiring proprietary bank gateway approvals for static QR display.

