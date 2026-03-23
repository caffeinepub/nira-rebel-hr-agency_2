# Nira Rebel HR Agency

## Current State
Full site is live with light theme, admin dashboard, staff portal, and role-based access control using the authorization component.

## Requested Changes (Diff)

### Add
- Admin seeding: a backend function `claimAdminSeed(email)` that checks if the caller's email matches `ns244128@gmail.com` and, if so, promotes the caller to admin role. This is idempotent and safe to call on every login.
- Frontend: after every successful login or registration, call `claimAdminSeed` with the user's email. If it succeeds and the user is now admin, show a brief success notice.

### Modify
- Nothing else changes.

### Remove
- Nothing.

## Implementation Plan
1. Add `claimAdminSeed(email: Text): async Bool` to backend -- returns true if admin was granted.
2. After login/register in the frontend auth flow, call `claimAdminSeed` with the user's email.
3. Refresh the user role after the call so the UI reflects admin status immediately.
