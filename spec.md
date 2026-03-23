# Nira Rebel HR Agency

## Current State
The site is a fully built React frontend with a sticky nav, hero, jobs, expertise, testimonials, blog, and footer. The nav has a 'Login / Register' button that currently does nothing. The backend is an empty Motoko actor.

## Requested Changes (Diff)

### Add
- Authorization component (already selected) wired into the app
- Login modal with email/password form
- Register modal with email/password (+ name) form
- Post-login success state: user stays on page, sees a welcome/success message in the nav
- Logout option when user is logged in

### Modify
- 'Login / Register' button in desktop nav and mobile menu to open the auth modal
- Nav right actions: show user name + logout button when authenticated

### Remove
- Nothing removed

## Implementation Plan
1. Wire up the authorization component hooks (useAuth, login, register, logout) from the Caffeine auth bindings
2. Add a LoginRegisterModal component with tab switching between Login and Register forms
3. Login form: email + password fields, submit calls login(), shows success state
4. Register form: name + email + password fields, submit calls register()
5. Update nav 'Login / Register' button to open the modal
6. When authenticated: show user display name and a Logout button in nav instead
7. Show a brief success/welcome banner or update nav immediately after login
