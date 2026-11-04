# Phase 0 Research: Liin Spa Web Application (UI PROMAX & RBAC)

## 1. UI PROMAX Design System Research
- **Aesthetic Direction**: High-end Luxury Medical Spa & Aesthetics Clinic.
- **Color Palette**:
  - Primary Accent: Rose Gold (`#E0A996` / `#D48B77`) & Champagne Gold (`#DFB76C`)
  - Secondary / Status: Emerald Green (`#059669` / `#10B981`) for profit & active state, Crimson Rose (`#E11D48`) for debt & alerts
  - Background & Cards: Clean Pearl White (`#FAFAFA`) to Warm Slate (`#F8FAFC`) with subtle glassmorphic card borders (`#E2E8F0` / `rgba(255,255,255,0.7)`)
  - Dark Mode: Deep Obsidian (`#0F172A`) with subtle Rose Gold neon accents.
- **Micro-interactions**: Smooth modal drawers, animated progress rings for package sessions, interactive timeline slots, quick role switch preview bar.

## 2. Dynamic VietQR Specification
- VietQR follows the EMVCo standard via the open API format: `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>`.
- Generated in real-time inside the POS payment modal with countdown timer, auto-calculated transaction fee, and instant copy buttons.

## 3. Dual-Inventory & BOM Auto-Depletion Engine
- Database transaction coordinates two distinct storage arrays: `commercial_inventory` and `consumable_inventory`.
- When a treatment check-in is logged, the service recipe is fetched:
  $$\forall (\text{materialId}, \text{qty}) \in \text{service.bom}: \quad \text{stock}[\text{materialId}] \leftarrow \text{stock}[\text{materialId}] - \text{qty}$$
- Generates an immutable inventory movement ledger record with link to `checkin_id`.

## 4. Conflict-Free Scheduling Algorithm
- An appointment $A$ is valid if and only if:
  $$\forall B \in \text{Appointments}, \quad \text{overlapping}(A, B) \implies (\text{tech}(A) \ne \text{tech}(B) \land \text{bed}(A) \ne \text{bed}(B))$$
- Turnaround buffer of 10 minutes is automatically added between appointments on the same bed for sanitization.

## 5. Excel Import/Export (SheetJS / xlsx) Engine
- Browser-native client-side processing using `xlsx`.
- Import pipeline:
  1. Parse workbook binary.
  2. Validate column header presence against entity data dictionary.
  3. Row-by-row type conversion and foreign key lookups.
  4. Collect errors in array: `{ row: number, column: string, value: any, reason: string }`.
  5. If errors exist, present interactive error table without mutating database; if valid, batch insert atomically.
- Export pipeline:
  1. Serialize domain entities to flat tabular dictionaries with Vietnamese column names.
  2. Auto-size column widths.
  3. Create blob and trigger browser download with timestamped filename.

