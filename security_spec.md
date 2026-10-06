# Security Specification & Threat Model: Samudera Bahari Line Shipping Management

## 1. Data Invariants
1. Vessels: Every vessel must possess a valid IMO number and name; status must belong to allowed maritime states ('Underway', 'Berthed', 'Anchored', 'Maintenance').
2. Voyages: A voyage must refer to a valid vessel; origin and destination ports must be defined and distinct; departure date must precede arrival date.
3. Manifests / Bills of Lading: A cargo item must be tied to an active voyage; Bill of Lading (B/L) number must be unique and valid string length; weight must be a non-negative number.
4. Operational Logs: Immutable event logs recording port operations, bunkering, and inspections; recordedBy and timestamp must be intact.
5. All document operations require authenticated operator identity.

## 2. The "Dirty Dozen" Payloads
1. **Malicious IMO Injection**: Vessel payload with IMO exceeding 20 characters or containing XSS payload `<script>`.
2. **Negative Cargo Weight**: Cargo manifest with `weightTon: -999` to spoof capacity calculations.
3. **Invalid Vessel Operational Status**: Vessel status set to `"Flying"` or unknown state.
4. **Oversized Vessel Name**: Name string with 50,000 characters causing storage resource denial-of-service.
5. **Orphaned Cargo Manifest**: Manifest referencing non-existent voyage ID or empty voyageId.
6. **Arbitrary Field Injection**: Vessel payload containing hidden admin override key `isSuperAdminOverride: true`.
7. **Manipulated CreatedAt**: Incoming write attempting to overwrite original `createdAt` timestamp.
8. **Negative Fuel Level**: Operational log or vessel status reporting fuel level of -50%.
9. **Unauthenticated Write**: Direct unauthenticated attempt to delete or alter a vessel registry record.
10. **Empty Port Assignment**: Voyage created with empty originPort or destinationPort.
11. **Spoofed RecordedBy**: Operational log attempting to forge another officer's UID or identity.
12. **Tampered Bill of Lading Status**: Transitioning manifest to an illegal transition or corrupt state.

## 3. Test Runner Invariant Summary
All unauthenticated or malformed payloads must trigger permission denial or schema rejection.
Rules enforce field limits, key whitelisting, and authorization guards.
