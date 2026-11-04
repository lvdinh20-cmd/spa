# Implementation Plan: Liin Spa Web Application (UI PROMAX & RBAC)

**Branch**: `001-liin-spa-web` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-liin-spa-web/spec.md`

## Summary

Build a modern, high-aesthetic "UI PROMAX" web application for Liin Spa Management with full Role-Based Access Control (Admin, Receptionist, Technician). The system covers 6 core business modules:
1. Customer 360 & Treatment Card state machine with Before/After tracking.
2. Service Catalog, BOM Consumables & Dual-Inventory depletion.
3. Packages, Bundles & Sales Commission.
4. Staff, Skill Matrix & Transparent Multi-Tier Commission Ledger.
5. POS Billing with dynamic VietQR generation and real-time Gross Profit calculation.
6. Conflict-Free Booking & Timeline Calendar + Standardized Excel Bulk Import/Export Studio.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 24+

**Primary Dependencies**: React 19, Vite 6, Tailwind CSS, Lucide React, SheetJS (`xlsx`), Canvas Confetti

**Storage**: LocalStorage & IndexedDB with pre-populated realistic mock spa dataset for immediate turnkey operation

**Testing**: Vitest / Playwright-ready unit & component contract checks

**Target Platform**: Modern Web Browsers (Chrome, Safari, Edge, Firefox) on Desktop, iPad/Tablet, and Mobile

**Project Type**: Single Page Web Application (SPA)

**Performance Goals**: 60 FPS transitions, < 100ms UI interaction latency, Excel import of 1,000 rows in < 3s

**Constraints**: Integer VND currency arithmetic, strict zero double-booking collision, strict atomic BOM stock deduction

**Scale/Scope**: 8 comprehensive modules, 3 user roles, 9 core domain entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Financial Precision & Double-Entry Integrity**: Integer VND used throughout, Gross Profit formula enforced.
- [x] **Principle II: Dual-Inventory & Automated Real-Time BOM Depletion**: Strict separation of Commercial vs Consumable inventory, automatic stock decrement on treatment check-in.
- [x] **Principle III: Data Privacy & Sensitive Media RBAC**: Role-based access control protecting clinical records and photos, access gates for admin vs staff.
- [x] **Principle IV: Treatment Card State Machine**: State transitions (`Active`, `Paused`, `Depleted`, `Expired`) enforce $N_{\text{total}} = N_{\text{done}} + N_{\text{remaining}}$.
- [x] **Principle V: Transparent Multi-Tier Commission**: Real-time personal earning ledger for staff with breakdown of tour fees, sales commission, and tips.
- [x] **Principle VI: Conflict-Free Scheduling**: Collision engine verifies technician schedule, bed capacity, and service duration.
- [x] **Principle VII: Excel Data Portability & Batch Integrity**: Row-by-row error validation, standardized templates, audit trail.

## Project Structure

### Documentation (this feature)

```text
specs/001-liin-spa-web/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model & schemas
├── quickstart.md        # Setup & running instructions
├── contracts/           # Service & API contracts
│   └── api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── types/               # Domain interfaces & TypeScript types
├── domain/              # State machines, financial formulas, collision detection
├── services/           # Storage, Excel import/export, VietQR generator
├── context/             # AuthContext (RBAC), SpaDataContext
├── components/          # Reusable UI PROMAX components (Sidebar, TopBar, StatCard, Modal, Badge, Button)
├── modules/
│   ├── dashboard/       # Executive & Staff KPI overview
│   ├── customers/       # Customer 360, Treatment cards, Before/After photos
│   ├── services/        # Service menu, BOM configuration, Combo packages
│   ├── pos/             # POS checkout, VietQR payment, invoice generation
│   ├── booking/         # Timeline calendar, bed allocation, collision detection
│   ├── inventory/       # Dual warehouse (Commercial vs Consumable), stock alerts
│   ├── staff/           # Staff profiles, skill matrix, payroll & commission ledger
│   └── excel/           # Bulk Import/Export Studio with template downloads
├── App.tsx              # Root app router & navigation shell
├── index.css            # Tailwind & UI PROMAX luxury theme styles
└── main.tsx             # Entry point
```

**Structure Decision**: Single-page application layout with clean modular domain division.
