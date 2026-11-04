---
description: "Task list for Liin Spa Web Application implementation"
---

# Tasks: Liin Spa Web Application (UI PROMAX & RBAC)

**Input**: Design documents from `specs/001-liin-spa-web/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`

## Organization: Tasks are grouped by user story for independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)
- [x] T001 Initialize Vite + React 19 + TypeScript project at repository root
- [x] T002 Install core dependencies: `lucide-react`, `xlsx`, `clsx`, `tailwind-merge`, `canvas-confetti`
- [x] T003 Configure Tailwind CSS with luxury Spa color palette (Rose Gold, Champagne, Emerald, Deep Slate)

## Phase 2: Foundational (Core Infrastructure)
- [x] T004 Create domain types and entity schemas in `src/types/index.ts`
- [x] T005 Implement LocalStorage persistence and initial turnkey seed data in `src/services/storage.ts`
- [x] T006 Implement AuthContext with RBAC permissions and Quick Role Switcher in `src/context/AuthContext.tsx`
- [x] T007 Implement SpaDataContext for reactive multi-entity state management in `src/context/SpaDataContext.tsx`
- [x] T008 [P] Build UI PROMAX Luxury Layout Shell (Sidebar, Header with role indicator, Breadcrumb) in `src/components/layout/`

## Phase 3: User Story 1 - Role-Based Authentication & Navigation (Priority: P1)
- [x] T009 [US1] Build Role Guard and dynamic menu navigation based on active role in `src/components/layout/Sidebar.tsx`
- [x] T010 [US1] Implement Executive Dashboard for Admin with full revenue, profit, and staff KPIs in `src/modules/dashboard/AdminDashboard.tsx`
- [x] T011 [US1] Implement Staff Operational Dashboard for Receptionist & Technician in `src/modules/dashboard/StaffDashboard.tsx`

## Phase 4: User Story 2 - Customer 360 & Treatment Card Lifecycle (Priority: P1)
- [x] T012 [US2] Implement Customer list, search, filter, and quick creation modal in `src/modules/customers/CustomerList.tsx`
- [x] T013 [US2] Implement Customer 360 Profile (Skin notes, allergies, wallet, debt, packages) in `src/modules/customers/CustomerProfile.tsx`
- [x] T014 [US2] Implement Treatment Card state machine visualizer and check-in modal with Before/After photo comparison in `src/modules/customers/TreatmentCheckinModal.tsx`

## Phase 5: User Story 3 - POS Multi-Item Checkout, Dynamic VietQR & P&L (Priority: P2)
- [x] T015 [US3] Build POS Terminal interface (Services + Packages + Retail Cosmetics cart) in `src/modules/pos/PosTerminal.tsx`
- [x] T016 [US3] Implement dynamic Napas247 VietQR generation with timer & banking details in `src/services/vietqr.ts` and `src/modules/pos/VietQrModal.tsx`
- [x] T017 [US3] Implement deterministic Gross Profit calculation `Gross Profit = Revenue - (Commissions + BOM + Fees)` in `src/domain/financial.ts`
- [x] T018 [US3] Implement Invoice print/preview drawer and debt recording in `src/modules/pos/InvoiceReceipt.tsx`

## Phase 6: User Story 4 - Service Menu, BOM & Dual-Inventory Depletion (Priority: P2)
- [x] T019 [US4] Implement Service Menu and BOM recipe manager in `src/modules/services/ServiceList.tsx`
- [x] T020 [US4] Implement Combo Package builder with session discounts in `src/modules/services/PackageList.tsx`
- [x] T021 [US4] Implement Dual-Inventory Management (Commercial vs Consumable) with low-stock badges in `src/modules/inventory/InventoryManager.tsx`
- [x] T022 [US4] Connect atomic BOM stock depletion on treatment check-in in `src/domain/inventory.ts`

## Phase 7: User Story 5 - Conflict-Free Booking & Timeline Calendar (Priority: P3)
- [x] T023 [US5] Implement collision detection engine for technician & room/bed in `src/domain/booking.ts`
- [x] T024 [US5] Build interactive Timeline Calendar (Bed x Hour grid) with drag/click booking in `src/modules/booking/BookingCalendar.tsx`
- [x] T025 [US5] Implement Appointment booking drawer with collision alerts and status flow in `src/modules/booking/BookingModal.tsx`

## Phase 8: User Story 6 - Multi-Tier Commission & Payroll Reconciliation (Priority: P3)
- [x] T026 [US6] Implement Staff list, Skill Matrix, and commission rate config in `src/modules/staff/StaffList.tsx`
- [x] T027 [US6] Implement Multi-Tier Commission Calculator (Tour fee primary/secondary + Sales commission + Tip) in `src/domain/commission.ts`
- [x] T028 [US6] Build personal employee earning ledger and monthly payroll reconciliation view in `src/modules/staff/PayrollLedger.tsx`

## Phase 9: User Story 7 - Standardized Excel Bulk Import/Export Studio (Priority: P4)
- [x] T029 [US7] Implement SheetJS-based import/export engine with error row validation in `src/services/excel.ts`
- [x] T030 [US7] Build Excel Studio UI with template download, drag-drop upload, and error diagnostics table in `src/modules/excel/ExcelStudio.tsx`

## Phase 10: Polish & End-to-End Verification
- [x] T031 End-to-end integration and responsive testing across Admin, Receptionist, and Technician roles
- [x] T032 Verify build with `npm run build`
