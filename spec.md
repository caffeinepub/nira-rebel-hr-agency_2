# NiraRebelHRAgency-PVT

## Current State
The app has an Admin Dashboard, Staff Portal, and homepage. Clock-In/Out buttons exist in the Staff Portal but fail at runtime. The Staff Portal shows a login page even to admins navigating from the Admin Dashboard. The Motoko actor uses non-persistent state (all data resets on canister upgrade). No print feature exists. Form submissions work but data sync is correct.

## Requested Changes (Diff)

### Add
- Print Report buttons in AdminDashboard (Staff Data table) and StaffPortal (Candidate Applications table) using window.print() with print-specific CSS
- Auto-detect admin Internet Identity in StaffPortal and bypass login

### Modify
- Motoko actor: change to `persistent actor` so all Map data and var counters survive canister upgrades
- StaffPortal hasAccess logic: if user has Internet Identity (isAdminViaII), grant access directly without requiring isStaffOrAdmin backend check
- Clock-In: Add explicit error display showing actual error message, improve actor null-check timing
- AdminDashboard Staff Portal link: use window.open to open staff portal in new tab from nav link

### Remove
- Nothing removed

## Implementation Plan
1. Update src/backend/main.mo: change `actor {` to `persistent actor {` and add `stable` to all counter vars
2. Update StaffPortal.tsx: fix hasAccess to grant access for isAdminViaII without needing isStaffOrAdmin; add Print Report button with print CSS for applications table
3. Update AdminDashboard.tsx: add Print Report button with print CSS for staff data table; fix Staff Portal link to open in new tab
4. Ensure all backend calls are properly guarded and show real error messages
