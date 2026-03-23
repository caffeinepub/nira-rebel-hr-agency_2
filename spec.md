# Nira Rebel HR Agency

## Current State
- Admin Dashboard has Overview and Staff Management tabs
- Staff Management tab shows user list with 'Add Staff', 'Remove Staff', 'Make Admin' buttons
- Staff Portal shows `listAllApplications` (job applications) which is always empty since all real applications go through `submitDirectApplication` (DirectApplications)
- No way to create/invite a staff member by email in the Admin panel
- Backend has `staffRoles` map for tracking staff, but no pre-approved email list for auto-assignment on registration

## Requested Changes (Diff)

### Add
- Backend: `preApprovedStaffEmails` map + `addPreApprovedStaffEmail`, `listPreApprovedStaffEmails`, `removePreApprovedStaffEmail` functions (admin only)
- Backend: Auto-assign staff role in `saveCallerUserProfile` if user email is in pre-approved list
- Frontend: `useAddPreApprovedStaffEmail`, `useListPreApprovedStaffEmails`, `useRemovePreApprovedStaffEmail` hooks
- Admin Dashboard: "Invite Staff" form at the top of Staff Management tab with email input and submit button
- Admin Dashboard: Table showing pre-approved emails with remove option
- Staff Portal: Also show `listAllDirectApplications` table (the real applications), alongside job applications

### Modify
- Staff Portal: Replace empty job applications table with DirectApplications table as the primary view; keep job applications as secondary
- Staff Portal: Access check should handle staff users who are in `staffRoles` (currently `hasAccess` is too loose)
- StaffPortal: Add `useListAllDirectApplications` hook usage for direct applications data

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add preApprovedStaffEmails map, add admin-only CRUD functions, auto-assign staff on registration if email matches
2. Update `useQueries.ts`: add hooks for pre-approved staff email management
3. Update `AdminDashboard.tsx`: add invite form + pre-approved emails list in Staff Management tab
4. Update `StaffPortal.tsx`: add `useListAllDirectApplications` and show direct applications as the primary table
