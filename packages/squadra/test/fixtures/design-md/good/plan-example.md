---
version: alpha
name: Acme App
colors:                      # spec field: light/default values
  background: "#ffffff"
  foreground: "#0a0a0a"
  primary: "#2563eb"
  muted: "#f4f4f5"
  border: "#e4e4e7"
  chart-1: "#2563eb"         # chart-* and label-* are Squadra roles
rounded: { sm: 4px, md: 6px, lg: 8px }
# spacing, typography: spec fields, copied from the app's CSS or the preset

x-squadra:
  version: 1
  style: pebble              # label: the preset this file started from
  settings:                  # always all 8, explicit
    fill: tonal
    edges: none
    shadow: soft
    color: tinted
    shape: round
    density: spacious
    type: friendly
    motion: standard
  effects: { gradients: false, glow: false, blur: none }
  fonts: [Inter, JetBrains Mono]
  icons: { library: lucide-react, brands: simple-icons }
  modes:
    dark:
      colors: { background: "#0a0a0a", foreground: "#fafafa", primary: "#3b82f6" }
  vendored: ["components/ui/**"]
  zones:
    - paths: ["app/(marketing)/**"]
      effects: { gradients: true, glow: true }
      settings: { motion: expressive }
  rules:
    motion/*: warn
    fill/no-surface-shadow: error
---

## Overview
The plan's example DESIGN.md (docs/plan.md, "DESIGN.md schema").
