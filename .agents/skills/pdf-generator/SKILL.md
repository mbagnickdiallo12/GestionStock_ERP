---
name: pdf-generator
description: Guide the generation of clean, modern, and reliable PDF documents (receipts, measurement sheets, invoices, tickets) in Next.js, React, and Node.js environments. Use when designing, building, or troubleshooting PDF generation workflows, receipts, invoices, or printable layouts.
---

# PDF Generator Skill

A structured guide for creating robust, pixel-perfect, and modern PDF documents and print-ready receipts in Next.js and web applications.

## Core Technical Patterns

### 1. Client-Side Rendering with `@react-pdf/renderer` (Pure PDF Download)
Best for downloadable documents that must maintain consistent layout across operating systems without print dialogs.
- Keep styles decoupled with `StyleSheet.create()`.
- Dynamically import components with `{ ssr: false }` in Next.js App Router to avoid hydration mismatch.
- Explicitly define fixed dimensions and avoid unconstrained `flex-grow`.
- Ensure standard font families (Helvetica, Courier, Times-Roman) or register custom web fonts via `Font.register`.

### 2. Print-to-PDF & Thermal Ticket (Browser `window.print()` + Tailwind `@media print`)
Best for instant receipt printing at the workshop or POS counter:
- Wrap printable views in dedicated `@media print` CSS rules.
- Hide navigation bars, buttons, and modals with `print:hidden`.
- Force background colors: `-webkit-print-color-adjust: exact; print-color-adjust: exact;`.
- Set page sizing explicitly in CSS: `@page { size: A4 portrait; margin: 10mm; }` or `@page { size: 80mm auto; margin: 0; }` for thermal receipt printers.

## Layout & Design Rules (Stitch / Modern Clean Standards)

1. **Header & Branding:** Workshop name, logo, phone number, address, and reference code (`TLR-2026-XXX`).
2. **Customer & Order Summary:** Customer name, contact number, delivery date, and urgency badge.
3. **Itemized Financial Breakdown:** Table listing items, fabric details, total price, deposit amount, and remaining balance. Distinct highlight for "Soldé" (Fully paid) vs "Reste à payer" (Balance due).
4. **QR Code / Tracking Link:** Embed a quick QR code or URL pointing to the online order tracking page (`/track/[code]`).
5. **Footer:** Terms, estimated delivery notes, and workshop thank you message.

## Common Gotchas & Fixes
- **Hydration / SSR errors:** Always render PDF generation components dynamically (`next/dynamic` with `ssr: false`).
- **Page Overflow:** Constrain tables and text blocks with explicit padding and `break-inside: avoid;` to prevent awkward page splits.
- **Mobile Printing:** Test thermal/80mm views on mobile browsers to ensure width fits without horizontal scrolling.
