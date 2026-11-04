<!--
SYNC IMPACT REPORT
Version change: 1.0.0 -> 1.1.0
List of modified principles:
  - None (Principles I through VI preserved without modification)
Added principles/sections:
  - PRINCIPLE_VII: Data Portability, Batch Processing & Secure Excel Exchange (New)
  - Updated Architecture & Technical Standards: Streaming I/O and asynchronous queue for bulk Excel processing
Removed sections:
  - None
Follow-up TODOs:
  - None
-->

# Liin-spa (Spa & Beauty Management System) Constitution

## Core Principles

### I. Financial Precision & Ledger Integrity
All monetary transactions—including single service sales, package combo contracts, deposits, partial payments, debt balances, customer prepaid wallets, and loyalty points—MUST maintain strict numerical precision and transactional immutability. Floating-point arithmetic for currency is strictly prohibited; calculations MUST use exact integer representations (VND) or arbitrary-precision decimals. Every invoice MUST calculate gross profit deterministically using the formula: Gross Profit = Revenue - (Commissions + Consumable Materials Cost + Payment Processing Fees). Financial audit trails MUST record who initiated the transaction, timestamp, target entity, and balance delta, with zero tolerance for unrecorded adjustments.

### II. Dual-Inventory & Real-Time Material Depletion
The system MUST enforce a strict boundary between Commercial Inventory (products packaged for retail to end clients) and Internal Consumable Inventory (bulk cosmetic and medical supplies utilized during treatments). Every service execution MUST link to an automated Bill of Materials (BOM) specifying material consumption per session (e.g., milliliters of essence, treatment sheet masks). Material stock MUST deplete atomically within the database transaction confirming service completion. Inventory tracking MUST support batch, lot, and expiry management (FEFO/FIFO) with automated low-stock and near-expiration threshold alerts.

### III. Confidentiality, Clinical History & Sensitive Media RBAC
Customer profiles, dermatological/medical records, allergy histories, and Before/After clinical treatment imagery constitute sensitive personal data. Access MUST follow least-privilege Role-Based Access Control (RBAC): doctors and technicians may view clinical notes; receptionists and sales personnel may view contact and financial ledgers; only authorized staff may view, capture, or export Before/After photo galleries. All stored client imagery MUST be protected with access-controlled object storage, tamper-evident watermarking, and strict retention audit logging to protect client privacy and facilitate complaint resolution.

### IV. Treatment Card State Machine & Session Tracking Integrity
Purchased treatment packages and combos MUST be governed by a deterministic, non-reversible state machine: `Active` -> `Paused` -> `Depleted` / `Expired`. Session tracking MUST preserve an unbroken mathematical invariant: Total Sessions = Completed Sessions + Remaining Sessions. Negative balances, unearned increments, or arbitrary session overrides are prohibited at the domain model level. Each check-in record MUST record check-in timestamp, assigned primary and secondary technicians, specific procedural steps completed, client immediate reaction, and attached progress media.

### V. Transparent Multi-Tier Commission & Payroll Auditability
Employee remuneration—encompassing base salary, attendance allowances, service/tour fees (distinguishing primary vs. secondary technician roles), sales commissions (tiered by package or cosmetic product), and tips—MUST be calculated transparently and deterministically. The system MUST support flexible commission timing policies (immediate recognition upon contract signing vs. proportional realization based on cash collected for installment purchases). Every employee MUST have real-time access to their personal itemized commission ledger for transparent daily/monthly shift reconciliation.

### VI. Conflict-Free Scheduling & Resource Coordination
The appointment and calendar management subsystem MUST prevent resource collisions across three interdependent constraints: technician availability (preventing double-booking and honoring assigned shift/skill matrix), physical room/bed capacity, and service operational duration (including cleanup/turnaround buffers). Timeline updates MUST broadcast state changes in real time across terminals to prevent concurrent booking race conditions between front desk staff, online booking channels, and call centers.

### VII. Data Portability, Batch Processing & Secure Excel Exchange
The system MUST provide standardized Excel (.xlsx / .csv) bulk import and export capabilities for all core business entities (Customer Profiles, Service Menu & BOM, Combo Packages, Inventory & Stock Items, Employee Profiles, and General Ledgers).
- **Atomic Validation & Error Reporting**: Batch imports MUST validate data integrity, uniqueness constraints, and foreign key relations prior to committing changes. Any row-level failure (e.g., malformed phone numbers, negative pricing, missing categories) MUST generate a comprehensive, row-indexed diagnostic error report, preventing partial database corruption.
- **Privacy & Export Auditability**: Bulk export of sensitive customer information (contact details, medical notes, spend history) MUST be governed by strict RBAC permissions and permanently logged with the user ID, timestamp, record count, and query filter parameters to prevent unauthorized data exfiltration.
- **Standardized Schema Templates**: Pre-formatted downloadable Excel templates with clear column definitions, data constraints, and sample data MUST be provided for every importable entity.

## Architecture & Technical Standards

The application MUST follow a Modular Monolith or Clean/Hexagonal Architectural pattern with clear boundaries separating the Domain Model, Application Services, and Infrastructure Adapters.
- **Domain Independence**: Core financial, inventory, and session state engines MUST be framework-independent and testable in total isolation.
- **API-First & Responsive UX**: All business workflows MUST expose structured REST or RPC contracts, enabling seamless POS terminal operation, tablet-based technician check-in, and administrative desktop dashboards.
- **Asynchronous Event Pipeline**: External integrations (VietQR payment webhook reconciliation, automated Zalo ZNS / SMS appointment reminders, birthday voucher dispatches) MUST execute asynchronously via background event queues with idempotent retry mechanisms.
- **Bulk Data Processing**: Excel imports and exports involving large datasets MUST execute asynchronously with streaming I/O or background worker jobs to avoid HTTP connection timeouts and high memory consumption.

## Quality Assurance & Verification Gates

Quality standards are non-negotiable for all domain and financial modules:
- **Test-Driven Development (TDD)**: Mandatory for all invoicing, discount calculations, package session tracking, and commission allocation algorithms.
- **Code Coverage**: Minimum 85% test coverage required on domain entities, state machine transitions, and financial computation services.
- **Contract & Regression Testing**: Any schema alteration impacting invoice generation, debt ledger reconciliation, or inventory deduction MUST pass automated regression suites prior to merge approval.
- **Batch Data Integrity Testing**: Automated tests MUST verify that invalid Excel import files fail gracefully without leaving orphaned records, and that export files conform to expected schemas and encoding (UTF-8).

## Governance

This Constitution supersedes all informal architectural agreements and informal development practices across the Liin-spa project.
- **Amendments**: Any modification to core principles or technical constraints requires an explicit RFC, version bump, and migration verification.
- **Versioning**: Follows Semantic Versioning:
  - MAJOR: Removal, weakening, or redefinition of core architectural or financial principles.
  - MINOR: Addition of new principles, governance sections, or significant workflow expansions.
  - PATCH: Clarifications, non-semantic formatting, and grammatical refinements.
- **Compliance**: Every pull request, design artifact (`spec.md`, `plan.md`), and task breakdown (`tasks.md`) MUST be audited against these constitutional principles prior to implementation.

**Version**: 1.1.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
