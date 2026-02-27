# Design Review Results: Home Page (`/`) & Menu Page (`/menu`)

**Review Date**: 2026-02-27
**Routes**: `/` (Home), `/menu` (Menu)
**Focus Areas**: Visual Design, UX/Usability, Responsive/Mobile, Micro-interactions/Motion, Consistency

## Summary

The Karadeniz restaurant website has a strong visual identity with appealing food photography, a well-structured layout, and clear information architecture. However, the review uncovered **22 issues** across both pages — including critical accessibility contrast violations, inconsistent use of design tokens (hardcoded Tailwind `red-500` mixed with theme `primary-500`), missing semantic HTML/ARIA labels, and several UX gaps on mobile. Addressing these would significantly improve the user experience and bring the site in line with WCAG 2 AA standards.

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | **Active category button contrast**: White text on `bg-red-500` (#EF4444) only achieves 3.76:1 contrast ratio — below the WCAG AA minimum of 4.5:1 for normal text | 🔴 Critical | Accessibility / Visual Design | `src/components/Menu.tsx:90-93` |
| 2 | **"Découvrez" label contrast**: `text-red-500` (#EF4444) on white background achieves only 3.76:1 contrast ratio | 🔴 Critical | Accessibility / Visual Design | `src/components/Menu.tsx:64` |
| 3 | **"Contactez-nous" label contrast**: `text-primary-500` (#DC2626) on `#f2eadc` background achieves only 4.04:1 contrast | 🔴 Critical | Accessibility / Visual Design | `src/components/Contact.tsx:49` |
| 4 | **Login link missing accessible text**: The user icon link in the header (`<a href="/login">`) has no `aria-label`, making it invisible to screen readers | 🔴 Critical | Accessibility | `src/components/Header.tsx:134-141` |
| 5 | **Footer copyright text contrast**: `text-gray-500` (#6B7280) on `dark-950` (#030712) achieves only 4.16:1 contrast | 🟠 High | Accessibility / Visual Design | `src/components/Footer.tsx:138-140` |
| 6 | **Hero CTA uses `<a>` instead of React Router `<Link>`**: "Voir Notre Menu" link (`<a href="/menu">`) causes a full page reload instead of a client-side navigation, losing app state and triggering the 2-second loader animation again | 🟠 High | UX/Usability | `src/components/Hero.tsx:39-44` |
| 7 | **Duplicate routes in App.tsx**: `/checkout` and `/account` routes are each declared twice, which could cause routing ambiguity | 🟠 High | UX/Usability | `src/App.tsx:170-174` |
| 8 | **Inconsistent color tokens — `red-500` vs `primary-500`**: The Menu component uses Tailwind's default `bg-red-500`/`text-red-500` in several places instead of the custom theme `bg-primary-500`/`text-primary-500` (which maps to #DC2626). This creates subtle color mismatches across sections | 🟠 High | Consistency | `src/components/Menu.tsx:64,91,92` and `src/components/MobileStickyCart.tsx:153,172` |
| 9 | **Hardcoded background color `#f2eadc`**: The About, Reviews, and Contact sections use inline `style={{ backgroundColor: '#f2eadc' }}` instead of a Tailwind design token. This makes theming and dark mode difficult | 🟠 High | Consistency / Visual Design | `src/components/About.tsx:7`, `src/components/Reviews.tsx:135`, `src/components/Contact.tsx:10,46` |
| 10 | **Menu items lack proper semantic role**: Menu item cards use a `<div onClick>` pattern with `cursor-pointer` but no `role="button"`, `tabIndex`, or keyboard event handlers. They are not keyboard-accessible | 🟠 High | Accessibility / UX | `src/components/MenuItem.tsx:37-75` |
| 11 | **No active state on navigation links**: The header navigation does not highlight which page or section is currently active, leaving users without a location indicator | 🟡 Medium | UX/Usability | `src/components/Header.tsx:71-94` |
| 12 | **"Commander Maintenant" CTA links to `#contact`**: Users would expect this button to initiate an order, but it just scrolls to the contact section. This creates a confusing UX gap between the button label and its action | 🟡 Medium | UX/Usability | `src/components/Menu.tsx:137-141` |
| 13 | **Missing menu item images — placeholder icon displayed**: Several menu items (Hamburger, Cheeseburger, Fish, Sandwich Mixte) show a red line-art sandwich placeholder instead of food photographs, creating visual inconsistency | 🟡 Medium | Visual Design | `src/components/MenuItem.tsx:40-47` (images sourced from Convex storage) |
| 14 | **Inconsistent section label styles**: "À Propos" uses `text-primary-600 font-extrabold`, "Nos Créations" and "Contactez-nous" use `text-primary-500 font-semibold`, "Témoignages" uses `text-primary-600 font-semibold`. Label typography should be unified | 🟡 Medium | Consistency | `src/components/About.tsx:16`, `src/components/Gallery.tsx:12`, `src/components/Contact.tsx:49`, `src/components/Reviews.tsx:143` |
| 15 | **Hero CTA button shade inconsistency**: Hero "Voir Notre Menu" uses `bg-primary-600` while "Commander Maintenant" at menu bottom uses `bg-primary-500`. Primary CTA buttons should use the same shade | 🟡 Medium | Consistency | `src/components/Hero.tsx:41`, `src/components/Menu.tsx:139` |
| 16 | **Mobile category pills have no scroll affordance**: Horizontal category filters are scrollable on mobile but there is no visual indicator (gradient fade, scroll arrows, or momentum hint) to suggest more categories exist off-screen | 🟡 Medium | Responsive/Mobile | `src/components/Menu.tsx:80-81` |
| 17 | **Reviews carousel has no swipe/touch support**: On mobile, users can only navigate reviews via dot indicators — there is no swipe gesture support, which is the expected mobile interaction pattern | 🟡 Medium | Responsive/Mobile / Micro-interactions | `src/components/Reviews.tsx:198-212` |
| 18 | **No scroll-triggered entrance animations**: All sections (About, Menu, Gallery, Reviews, Contact) render statically as the user scrolls. Subtle fade-in or slide-up animations on section entry would add polish and guide attention | ⚪ Low | Micro-interactions/Motion | All section components |
| 19 | **No transition animation when switching menu categories**: When clicking between category tabs, the menu items grid swaps instantly without any fade, slide, or layout animation | ⚪ Low | Micro-interactions/Motion | `src/components/Menu.tsx:123` |
| 20 | **Gallery images load at full resolution on all devices**: No responsive `srcset` or size variants are used — mobile users download the same large images as desktop users | ⚪ Low | Responsive/Mobile | `src/components/Gallery.tsx:34-38` |
| 21 | **Mobile hero height may be too compact**: At `min-h-[45vh]` with `pt-36` padding, the hero content can feel cramped on smaller mobile screens (< 375px width), especially below the large fixed header | ⚪ Low | Responsive/Mobile | `src/components/Hero.tsx:7` |
| 22 | **`loading="lazy"` on header logo**: The header logo uses `loading="lazy"` but as an above-the-fold element, it should use `loading="eager"` or have no loading attribute to prevent a flash of empty space on initial load | ⚪ Low | UX/Usability | `src/components/Header.tsx:64` |

## Criticality Legend
- 🔴 **Critical** (4): Violates WCAG accessibility standards or causes functional issues
- 🟠 **High** (6): Significantly impacts user experience, code quality, or design consistency
- 🟡 **Medium** (7): Noticeable issue that should be addressed for a polished product
- ⚪ **Low** (5): Nice-to-have improvements for extra polish

## Next Steps

### Priority 1 — Fix Critical Accessibility Issues
1. Replace all `bg-red-500`/`text-red-500` with `bg-primary-600`/`text-primary-600` (or darker) to meet 4.5:1 contrast ratio
2. Add `aria-label="Se connecter"` to the login icon link in `Header.tsx`
3. Fix the "Contactez-nous" label to use a darker shade (e.g., `text-primary-700`)

### Priority 2 — Fix High-Impact UX and Consistency Issues
4. Replace `<a href="/menu">` with `<Link to="/menu">` in Hero.tsx
5. Remove duplicate routes from App.tsx
6. Unify all `red-500` references to use `primary-500` design token
7. Create a Tailwind design token for the warm background (`#f2eadc`) in `tailwind.config.js`
8. Add `role="button"` and `tabIndex={0}` with keyboard handler to MenuItem cards

### Priority 3 — Medium Improvements
9. Add active link highlighting to the navigation
10. Update "Commander Maintenant" to route to `/menu` or `/checkout`
11. Upload real food photos for placeholder menu items
12. Unify section label typography (weight, shade)

### Priority 4 — Polish and Enhancements
13. Add scroll-triggered entrance animations (Intersection Observer)
14. Add swipe support to the Reviews carousel
15. Add scroll affordance indicator for mobile category pills
16. Add menu item transition animations
