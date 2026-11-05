import { z } from 'zod';
import { BLUR_STEPS, PRESETS, SETTINGS, SEVERITIES, ZONE_SETTINGS } from './settings.js';
import { isCssColor } from './css-color.js';
import { didYouMean, listOr } from './text.js';

export { isCssColor };

/** A relative file path: not POSIX/Windows absolute, not UNC, not a URL (checked independent of the host OS). */
function isRelativePath(p: string): boolean {
  return !/^[/\\]/.test(p) && !/^[a-z][a-z0-9+.-]*:/i.test(p);
}

const cssColor = z.string().refine(isCssColor, {
  error: (iss) => `"${String(iss.input)}" is not a CSS color (hex, oklch(), rgb(), hsl() or a named color).`,
});

/** A preset name, or a local preset file (`./brand.yaml`). */
const style = z.string().superRefine((value, ctx) => {
  if (/^\.\.?\//.test(value) || (PRESETS as readonly string[]).includes(value)) return;
  ctx.addIssue({
    code: 'custom',
    message: `"${value}" is not a style. Use ${listOr(PRESETS)}, or a local file such as ./brand.yaml.${didYouMean(value, PRESETS)}`,
  });
});

const settingsShape = {
  fill: z.enum(SETTINGS.fill),
  edges: z.enum(SETTINGS.edges),
  shadow: z.enum(SETTINGS.shadow),
  color: z.enum(SETTINGS.color),
  shape: z.enum(SETTINGS.shape),
  density: z.enum(SETTINGS.density),
  type: z.enum(SETTINGS.type),
  motion: z.enum(SETTINGS.motion),
};

const settings = z.strictObject(settingsShape);

const effects = z.strictObject({
  gradients: z.boolean(),
  glow: z.boolean(),
  blur: z.enum(BLUR_STEPS),
});

/** Zones may change only the settings that switch rules on (ZONE_SETTINGS). */
const zoneSettings = z.strictObject({
  fill: settingsShape.fill.optional(),
  edges: settingsShape.edges.optional(),
  shadow: settingsShape.shadow.optional(),
  type: settingsShape.type.optional(),
  motion: settingsShape.motion.optional(),
} satisfies Record<(typeof ZONE_SETTINGS)[number], unknown>);

const severity = z.enum(SEVERITIES);
const rules = z.record(z.string(), severity);

const globs = z.array(z.string().min(1));

const zone = z.strictObject({
  paths: globs.min(1),
  settings: zoneSettings.optional(),
  effects: effects.partial().optional(),
  rules: rules.optional(),
});

export const xSquadraSchema = z.strictObject({
  version: z.literal(1),
  style: style.optional(),
  settings,
  effects,
  fonts: z
    .array(z.string().min(1))
    .min(1)
    .refine((fonts) => new Set(fonts).size === fonts.length, { error: 'font families must be unique.' }),
  icons: z.strictObject({ library: z.string().min(1), brands: z.string().min(1).optional() }).optional(),
  css: z
    .string()
    .min(1)
    .refine(isRelativePath, { error: 'css must be a path relative to DESIGN.md, e.g. src/styles.css.' })
    .optional(),
  vendored: globs.optional(),
  modes: z
    .strictObject({
      dark: z.strictObject({ colors: z.record(z.string(), cssColor) }).optional(),
    })
    .optional(),
  zones: z.array(zone).optional(),
  rules: rules.optional(),
});

/**
 * The front matter. Spec fields are checked for shape only: their values (colors, dimensions,
 * references) are judged by @google/design.md, so nothing is reported twice. Unknown top-level
 * keys pass through for the same reason.
 */
export const designMdSchema = z.looseObject({
  version: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  omitted: z.unknown().optional(),
  colors: z.record(z.string(), z.unknown()),
  typography: z.record(z.string(), z.unknown()).optional(),
  rounded: z.record(z.string(), z.unknown()).optional(),
  spacing: z.record(z.string(), z.unknown()).optional(),
  components: z.record(z.string(), z.unknown()).optional(),
  'x-squadra': xSquadraSchema,
});

export type SquadraConfig = z.infer<typeof xSquadraSchema>;
export type DesignMdFrontMatter = z.infer<typeof designMdSchema>;
