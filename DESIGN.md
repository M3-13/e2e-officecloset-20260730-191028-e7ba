# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Tiefes, warmes Schwarz mit opulenten Goldakzenten – wie der Hintergrund einer Hollywood-Premiere: dunkle Eleganz trifft auf Red-Carpet-Glamour. Klassische Serife für Headlines, klare Sans-Serif für Fließtext.

## Colors

- `--color-bg`: **#0D0B0A**
- `--color-bg_surface`: **#1A1614**
- `--color-bg_card`: **#231F1C**
- `--color-fg`: **#F2EDE4**
- `--color-fg_muted`: **#B8B0A4**
- `--color-accent`: **#C9A84C**
- `--color-accent_light`: **#E0C878**
- `--color-accent_dark`: **#A88A34**
- `--color-border`: **#3D3830**
- `--color-border_accent`: **#8B7538**
- `--color-spotlight`: **#2A2318**
- `--color-error`: **#C44B4B**
- `--color-success`: **#5B8C5A**

## Typography

- `font_family`: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
- `heading_font_family`: 'Playfair Display', 'Times New Roman', Georgia, serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: xs: 12px; sm: 14px; base: 16px; lg: 20px; xl: 28px; 2xl: 40px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px
- `--space-7`: 64px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button (Primary)

padding 12px 28px, border-radius md (8px), background=accent (#C9A84C), color=bg (#0D0B0A), font-family heading, font-weight 600, font-size base (16px), min-height 48px (Touch ≥44px), border none, cursor pointer. Hover: background=accent_light (#E0C878), transform scale(1.03), box-shadow 0 0 24px rgba(201,168,76,0.4) (Spotlight-Glow). Active: background=accent_dark (#A88A34), scale(0.98). Disabled: opacity 0.4, cursor not-allowed, kein Glow.

### Button (Secondary / Ghost)

padding 12px 28px, border-radius md (8px), background transparent, color=accent (#C9A84C), border 1.5px solid accent (#C9A84C), font-family heading, font-weight 600, font-size base, min-height 48px. Hover: background rgba(201,168,76,0.12), border-color accent_light (#E0C878), color accent_light. Active: background rgba(201,168,76,0.22). Disabled: opacity 0.4, cursor not-allowed.

### Card (Galerie-Kleidungsstück)

background=bg_card (#231F1C), border 1px solid border (#3D3830), border-radius lg (16px), overflow hidden, transition box-shadow 0.3s ease. Hover: border-color border_accent (#8B7538), box-shadow 0 4px 32px rgba(201,168,76,0.18). Bildbereich: aspect-ratio 3/4, object-fit cover, background bg_surface (#1A1614) mit goldenem Rahmen (2px solid border_accent). Textbereich: padding 12px 16px, Name in fg, fett, Kategorie-Label in fg_muted, Schrift sm.

### Input Field

background=bg_surface (#1A1614), border 1px solid border (#3D3830), border-radius md (8px), padding 12px 16px, color fg (#F2EDE4), font-size base (16px), font-family body, min-height 48px. Placeholder: color fg_muted (#B8B0A4), italic. Focus: border-color accent (#C9A84C), box-shadow 0 0 0 3px rgba(201,168,76,0.2), outline none. Error: border-color error (#C44B4B). Disabled: opacity 0.5, bg bg.

### Modal / Dialog

background=bg_surface (#1A1614), border 1px solid border_accent (#8B7538), border-radius lg (16px), padding 32px, max-width 520px, box-shadow 0 16px 64px rgba(0,0,0,0.6), 0 0 80px rgba(201,168,76,0.08). Overlay: background rgba(0,0,0,0.7), backdrop-filter blur(4px). Close-Button: X-Icon, position top-right 16px, color fg_muted, hover color accent.

### Navbar / Header

background=bg (#0D0B0A) mit bottom-border 1px solid border (#3D3830), padding 16px 32px, height 64px, display flex, align-items center, justify-content space-between. Logo/Titel: font-family heading, font-size xl (28px), color accent (#C9A84C), letter-spacing 1px, text-shadow 0 0 20px rgba(201,168,76,0.3). Nav-Links: font-size base, color fg_muted, padding 8px 16px, border-radius sm, hover color accent, hover bg rgba(201,168,76,0.08). Active Link: color accent, border-bottom 2px solid accent.

### Kategorie-Filter (Pill-Tabs)

display flex, gap 8px, flex-wrap wrap. Einzelner Pill: padding 8px 20px, border-radius pill (999px), background bg_surface (#1A1614), border 1px solid border (#3D3830), color fg_muted, font-size sm (14px), cursor pointer, transition all 0.2s. Hover: border-color accent, color accent. Active/Selected: background accent (#C9A84C), color bg (#0D0B0A), border-color accent, font-weight 600.

### Outfit-Creator Slot

Platzhalter-Karte pro Kategorie-Slot: Breite 160px, Höhe 200px, background bg_card (#231F1C), border 2px dashed border (#3D3830), border-radius lg (16px), display flex, align-items center, justify-content center, color fg_muted, font-size sm, text-align center. Gefüllter Slot: border solid border_accent (#8B7538), Bild fill, object-fit cover, border-radius lg, mit dezentem inneren Glow (inset box-shadow 0 0 16px rgba(201,168,76,0.15)). Leerer-Slot-Hover: border-color accent, border-style solid, background rgba(201,168,76,0.05). Transition: all 0.3s ease.

### Spotlight-Hintergrund-Effekt

Dekorativer radialer Gradient hinter zentralen Bereichen (Login, Outfit-Creator): background radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 70%), bg (#0D0B0A). Erzeugt sanften Scheinwerfer-Effekt.

## Layout Principles

- Container max-width 1200px, zentriert mit padding 16px (Mobile) / 32px (Desktop)
- Breakpoints: Mobile < 640px, Tablet 640–1024px, Desktop ≥ 1025px
- Galerie-Grid: CSS Grid, auto-fill, minmax(220px, 1fr), gap 24px
- Outfit-Creator: Slots horizontal nebeneinander (flex wrap), gap 16px, zentriert
- Seitenlayout: Navbar oben fixiert (64px), Hauptbereich darunter mit padding-top 64px + 32px, min-height 100vh
- Formulare: max-width 420px, zentriert, vertikaler Stack mit gap 16px zwischen Feldern
- Zwei-Spalten-Layout auf Desktop: links Galerie-Auswahl, rechts Outfit-Vorschau (flex 1:1, gap 32px)
- Responsive: Auf Mobile/Tablet wird der Outfit-Creator einspaltig – Slots untereinander, Galerie darüber
- Spotlight-Gradient im Hintergrund von Login-Seite, Registrierung und Outfit-Creator für cineastische Atmosphäre
