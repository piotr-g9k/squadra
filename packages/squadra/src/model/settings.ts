// The style model: 8 settings with named steps, plus effects (docs/plan.md, "Settings in v0.1").
// Step IDs are what DESIGN.md stores; the plan's "mono + accent" is stored as `mono`.

export const SETTINGS = {
  fill: ['flat', 'tonal', 'raised'],
  edges: ['none', 'hairline', 'bold'],
  shadow: ['none', 'soft', 'strong', 'hard'],
  color: ['mono', 'tinted', 'colorful'],
  shape: ['sharp', 'soft', 'round'],
  density: ['compact', 'comfortable', 'spacious'],
  type: ['neutral', 'editorial', 'technical', 'friendly'],
  motion: ['none', 'minimal', 'standard', 'expressive'],
} as const;

export type SettingName = keyof typeof SETTINGS;
export type SettingStep<S extends SettingName> = (typeof SETTINGS)[S][number];
export type Settings = { [S in SettingName]: SettingStep<S> };

export const SETTING_NAMES = Object.keys(SETTINGS) as SettingName[];

/** Settings that switch rules on. Zones may change only these (plus effects and severities). */
export const ZONE_SETTINGS = ['fill', 'edges', 'shadow', 'motion'] as const satisfies readonly SettingName[];

export const BLUR_STEPS = ['none', 'overlays', 'anywhere'] as const;
export const EFFECT_NAMES = ['gradients', 'glow', 'blur'] as const;

export const PRESETS = ['paper', 'pebble', 'studio', 'ledger', 'poster'] as const;
export type Preset = (typeof PRESETS)[number];

export const SEVERITIES = ['error', 'warn', 'off'] as const;
export type Severity = (typeof SEVERITIES)[number];

/**
 * Rule IDs from the plan (Tier 1 + Tier 2). `x-squadra.rules` keys that match none of these
 * get a warning, not an error, so a typo is caught without blocking. Entries with `*` are
 * families whose members aren't named yet.
 */
export const KNOWN_RULES = [
  'color/no-undeclared',
  'tokens/no-arbitrary-*',
  'tokens/no-arbitrary-spacing',
  'shadow/none',
  'effects/no-gradients',
  'effects/no-backdrop-blur',
  'effects/blur-location',
  'effects/no-glow',
  'type/declared-fonts',
  'icons/single-library',
  'fill/no-surface-shadow',
  'fill/no-hover-lift',
  'edges/none',
  'edges/hairline',
  'surface/floating-treatment',
  'color/no-dark-override',
  'motion/*',
  'style/no-inline-literal',
  'meta/new-suppression',
] as const;
