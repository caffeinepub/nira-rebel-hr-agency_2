# Nira Rebel HR Agency

## Current State
Homepage has a trust-panel card on the left side of the hero (white card with ISO badge, counters, client logos), a full-screen hero background with overlay, search form, and a TOP CLIENTS & JOBS section with compact job cards (5-col grid). Navbar is light/white themed.

## Requested Changes (Diff)

### Add
- Green announcement bar at top: "Join our WhatsApp Group for instant job alerts!" with a "Join Now" button linking to the WhatsApp group URL
- Two WhatsApp buttons prominently visible (in the announcement bar or header area):
  - Channel: https://whatsapp.com/channel/0029VbAz4VLChq6I5mpCQH3D
  - Group: https://chat.whatsapp.com/Ij6uY2RChCtBoP5uqaM4Oc?mode=hqctcla
- Floating right-side social media buttons: WhatsApp (group link), Instagram, LinkedIn, Facebook
- Hero carousel with 3 slides with dot indicators and prev/next arrows:
  - Slide 1: "TOP BANKING PARTNERS" badge, Logo, "SBI • PNB • Axis Bank & More", "Floor Coordinator • ATM Operator • Sales Manager • Branch Manager"
  - Slide 2: "PAN INDIA PLACEMENTS" badge, Logo, "Find Your Dream Job", "Across India", "Delhi • Gurugram • Bihar • Patna • UP • Rewari & More"
  - Slide 3: Generic third slide
- Job cards section with category filter tabs: All, SBI Bank, PNB Bank, Hitachi Cash Management, E-Commerce/Logistics, Metro Department, Axis Bank
- Detailed job cards with: title, category badge (colored), company with building icon, location pin icon, address icon, salary in INR, job description text, green "Apply Now" button
  - Teller (SBI Bank, Delhi, SBI Branch 1, ₹35000/month, Banking)
  - Cashier (PNB Bank, Delhi, PNB Central Branch, ₹32000/month, Banking)
  - Vault Manager (Hitachi, Delhi, Hitachi Regional Office, ₹45000/month, Cash Management)
  - Warehousing Officer (Blinkit, Delhi, Warehouse 2, ₹25000/month, E-Commerce/Logistics)
  - Procurement (Zepto, Delhi, Procurement Center, ₹27000/month, E-Commerce/Logistics)
  - Accountant (Metro Express, Delhi, Metro Office, ₹30000/month, Metro Department)

### Modify
- Navbar: Change to dark background (dark navy/charcoal) with white text, like the original design shown in screenshots - logo on left, nav links on right, Admin Login and Logout buttons styled
- Hero section: Remove the left trust-panel white card design. Replace with the original full-screen hero layout: content positioned on lower-left of the hero image, "TOP BANKING PARTNERS" overlay badge, logo placed in the content area, text and two CTA buttons ("Our Services →" and "About Us")
- Job cards: Replace compact 5-col grid with the detailed 3-col grid layout showing full job details (company, location, address, salary, description, green Apply Now button)

### Remove
- Trust panel white card on hero left side (ISO badge, counters, client logos in hero)
- Current compact 5-col job cards
- Current CLIENT_LOGOS section in hero

## Implementation Plan
1. Update navbar to dark background, white text, Admin Login styled as outlined button, Logout as icon button
2. Add dismissible green announcement bar above navbar for WhatsApp group
3. Rebuild hero as full-screen image carousel (3 slides, auto-play, dots + arrows), keeping existing hero background. Content: badge, logo, big heading, subtext, two CTA buttons
4. Add floating WhatsApp + social buttons on right side of screen
5. Replace job section with filter tab row + 3-col detailed job cards matching screenshots
6. Add two WhatsApp buttons (Channel and Group) clearly visible - in navbar or announcement bar
7. Keep Admin Dashboard, Staff Management, and Staff Portal completely intact
