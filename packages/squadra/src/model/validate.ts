import type { z } from 'zod';
import { lintDesignMd } from './designmd.js';
import { parseFrontMatter, type FrontMatter } from './front-matter.js';
import { designMdSchema, xSquadraSchema, type SquadraConfig } from './schema.js';
import { KNOWN_RULES, SETTING_NAMES, SETTINGS, ZONE_SETTINGS, type SettingName } from './settings.js';
import { closest, didYouMean, formatPath, listAnd, listOr } from './text.js';

export interface Finding {
  severity: 'error' | 'warning' | 'info';
  /** Who reported it: Squadra's own checks or @google/design.md lint. */
  source: 'squadra' | 'design.md';
  /** Path into the front matter, e.g. `x-squadra.settings.fill`. */
  path?: string;
  /** 1-based position in the file. */
  line?: number;
  col?: number;
  message: string;
  /** design.md rule name, when it has one. */
  rule?: string;
}

export interface ValidationResult {
  /** True when there are no errors (warnings are allowed). */
  ok: boolean;
  /** The parsed `x-squadra` block, when it is valid. */
  config?: SquadraConfig;
  /** Light color token names from the spec `colors` field. */
  colorNames: string[];
  findings: Finding[];
}

type Path = readonly PropertyKey[];
type Target = 'auto' | 'key';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const show = (v: unknown) => (typeof v === 'string' ? `"${v}"` : v === null ? 'null' : String(v));

/** Validates a DESIGN.md file: front matter, the `x-squadra` schema, dark keys, then design.md lint. */
export function validateDesignMd(content: string): ValidationResult {
  const parsed = parseFrontMatter(content);
  if (!parsed.ok) {
    return {
      ok: false,
      colorNames: [],
      findings: [{ severity: 'error', source: 'squadra', message: parsed.message, ...parsed.location }],
    };
  }
  const fm = parsed.frontMatter;
  const findings: Finding[] = [];
  const add = (severity: Finding['severity'], path: Path, message: string, target: Target = 'auto') => {
    findings.push({
      severity,
      source: 'squadra',
      ...(path.length ? { path: formatPath(path) } : {}),
      ...fm.locate(path, target),
      message,
    });
  };

  const result = designMdSchema.safeParse(fm.data, { reportInput: true });
  if (!result.success) {
    for (const issue of explainIssues(result.error.issues)) add('error', issue.path, issue.message, issue.target);
  }

  const data = isRecord(fm.data) ? fm.data : {};
  const lightColors = isRecord(data.colors) ? data.colors : {};
  const xs = isRecord(data['x-squadra']) ? data['x-squadra'] : {};
  checkDarkKeys(xs, lightColors, add);
  checkRuleIds(xs, add);
  // TODO(S2): every x-squadra.fonts entry must match a CSS @font-face family; needs the CSS resolver.
  // TODO(S2): x-squadra.css must point to an existing file (relative to DESIGN.md).

  findings.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || (a.col ?? 0) - (b.col ?? 0));

  for (const f of lintDesignMd(content)) {
    findings.push({
      severity: f.severity,
      source: 'design.md',
      ...(f.path ? { path: f.path, ...fm.locateDotted(f.path) } : {}),
      message: f.message,
      ...(f.rule ? { rule: f.rule } : {}),
    });
  }

  return {
    ok: !findings.some((f) => f.severity === 'error'),
    ...(result.success ? { config: result.data['x-squadra'] } : {}),
    colorNames: Object.keys(lightColors),
    findings,
  };
}

type Add = (severity: Finding['severity'], path: Path, message: string, target?: Target) => void;

function checkDarkKeys(xs: Record<string, unknown>, light: Record<string, unknown>, add: Add) {
  const modes = isRecord(xs.modes) ? xs.modes : {};
  const dark = isRecord(modes.dark) ? modes.dark : {};
  if (!isRecord(dark.colors)) return;
  const lightNames = Object.keys(light);
  for (const key of Object.keys(dark.colors)) {
    if (Object.hasOwn(light, key)) continue;
    add(
      'error',
      ['x-squadra', 'modes', 'dark', 'colors', key],
      `has a dark value but no light value. Add colors.${key} or remove it.${didYouMean(key, lightNames)}`,
      'key',
    );
  }
}

const RULE_KEY = /^[a-z][a-z0-9-]*\/[a-z0-9*-]+$/;
const globToRegExp = (glob: string) =>
  new RegExp(`^${glob.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\/]/g, '\\$&')).join('[a-z0-9-]*')}$`);
const EXACT_RULES = KNOWN_RULES.filter((r) => !r.includes('*'));
const FAMILIES = KNOWN_RULES.filter((r) => r.includes('*'));

/** The literal text before the first `*`. */
const globPrefix = (glob: string) => glob.split('*')[0]!;

/**
 * A rule key is known if it is a plan rule ID, a member of a plan family (`motion/*`), or a glob
 * that matches a plan ID or overlaps a plan family. Rule globs only ever end in `*`, so two
 * globs overlap when one prefix starts with the other.
 */
function isKnownRule(key: string): boolean {
  if ((KNOWN_RULES as readonly string[]).includes(key)) return true;
  if (FAMILIES.some((f) => globToRegExp(f).test(key))) return true;
  if (key.includes('*')) {
    const re = globToRegExp(key);
    const prefix = globPrefix(key);
    return (
      EXACT_RULES.some((r) => re.test(r)) ||
      FAMILIES.some((f) => globPrefix(f).startsWith(prefix) || prefix.startsWith(globPrefix(f)))
    );
  }
  return false;
}

function checkRuleIds(xs: Record<string, unknown>, add: Add) {
  const blocks: Array<[Path, unknown]> = [[['x-squadra', 'rules'], xs.rules]];
  if (Array.isArray(xs.zones)) {
    xs.zones.forEach((zone, i) => {
      if (isRecord(zone)) blocks.push([['x-squadra', 'zones', i, 'rules'], zone.rules]);
    });
  }
  for (const [path, rules] of blocks) {
    if (!isRecord(rules)) continue;
    for (const key of Object.keys(rules)) {
      if (!RULE_KEY.test(key)) {
        add('error', [...path, key], `"${key}" is not a rule ID. Use group/rule, e.g. shadow/none or motion/*.`, 'key');
      } else if (!isKnownRule(key)) {
        add('warning', [...path, key], `"${key}" is not a known rule ID.${didYouMean(key, KNOWN_RULES)}`, 'key');
      }
    }
  }
}

interface Explained {
  path: Path;
  message: string;
  target: Target;
  /** For a "missing" message: the full path of the missing key. */
  missing?: string;
}

const isSettingsPath = (parent: Path) =>
  (parent.length === 2 && parent[0] === 'x-squadra' && parent[1] === 'settings') ||
  (parent.length === 4 && parent[1] === 'zones' && parent[3] === 'settings');

const YAML11_BOOLEANS = /^(?:on|off|yes|no|y|n)$/i;

/** Turns zod issues into messages written for DESIGN.md authors. */
function explainIssues(issues: readonly z.core.$ZodIssue[]): Explained[] {
  const out: Explained[] = [];
  const suggested = new Set<string>();

  for (const issue of issues) {
    const path = issue.path;
    const last = path[path.length - 1];
    const parent = path.slice(0, -1);
    const name = String(last);
    const input = (issue as { input?: unknown }).input;

    // YAML never yields undefined, so no input means the key is absent.
    if ((issue.code === 'invalid_type' || issue.code === 'invalid_value') && input === undefined) {
      const missing = formatPath(path);
      if (path.length === 1 && last === 'x-squadra') {
        out.push({ path, message: 'missing x-squadra block. Squadra reads its settings from it.', target: 'key', missing });
      } else if (isSettingsPath(parent) && name in SETTINGS) {
        const steps = SETTINGS[name as SettingName];
        out.push({
          path: parent,
          message: `missing "${name}" (${listOr(steps)}). All 8 settings are required.`,
          target: 'key',
          missing,
        });
      } else {
        out.push({ path: parent, message: `missing "${name}".`, target: 'key', missing });
      }
      continue;
    }

    switch (issue.code) {
      case 'invalid_type': {
        if (issue.expected === 'boolean') {
          const hint = typeof input === 'string' && YAML11_BOOLEANS.test(input) ? ' (YAML 1.2 reads on/off as text)' : '';
          out.push({ path, message: `expected true or false, got ${show(input)}${hint}.`, target: 'auto' });
        } else {
          const got = Array.isArray(input) ? 'a list' : isRecord(input) ? 'a map' : show(input);
          out.push({ path, message: `expected ${issue.expected}, got ${got}.`, target: 'auto' });
        }
        break;
      }
      case 'invalid_value': {
        const values = issue.values.map(String);
        let message: string;
        if (isSettingsPath(parent)) {
          message = `${show(input)} is not a ${name} step. Use ${listOr(values)}.`;
        } else if (name === 'blur') {
          message = `${show(input)} is not a blur value. Use ${listOr(values)}.`;
        } else if (path.length === 2 && name === 'version') {
          message = `x-squadra version must be 1, got ${show(input)}.`;
        } else if (parent.includes('rules')) {
          message = `${show(input)} is not a severity. Use ${listOr(values)}.`;
        } else {
          message = `${show(input)} is not allowed. Use ${listOr(values)}.`;
        }
        if (typeof input === 'string') message += didYouMean(input, values);
        out.push({ path, message, target: 'auto' });
        break;
      }
      case 'unrecognized_keys': {
        for (const key of issue.keys) {
          const keyPath = [...path, key];
          if (isSettingsPath(path) && path[1] === 'zones' && (SETTING_NAMES as string[]).includes(key)) {
            out.push({
              path: keyPath,
              message:
                key === 'type'
                  ? `zones can only change ${listAnd(ZONE_SETTINGS)}; type is global, because its rules read x-squadra.fonts.`
                  : `zones can only change ${listAnd(ZONE_SETTINGS)}; ${key} is guidance only.`,
              target: 'key',
            });
            continue;
          }
          const allowed = allowedKeys(path);
          const match = closest(key, allowed);
          if (match) suggested.add(formatPath([...path, match]));
          const hint = match ? ` Did you mean "${match}"?` : '';
          const where = path.length ? formatPath(path) : 'the front matter';
          out.push({ path: keyPath, message: `unknown key "${key}" in ${where}.${hint}`, target: 'key' });
        }
        break;
      }
      case 'too_small': {
        const message =
          name === 'fonts'
            ? 'list at least one font family.'
            : name === 'paths'
              ? 'list at least one path glob.'
              : 'must not be empty.';
        out.push({ path, message, target: 'auto' });
        break;
      }
      default:
        out.push({ path, message: issue.message, target: 'auto' });
    }
  }

  // "unknown key font. Did you mean fonts?" already explains the missing "fonts".
  return out.filter((e) => !(e.missing && suggested.has(e.missing)));
}


/** Keys allowed at a path inside the x-squadra schema, for did-you-mean on unknown keys. */
function allowedKeys(path: Path): string[] {
  if (path[0] !== 'x-squadra') return [];
  let schema: z.core.$ZodType = xSquadraSchema;
  for (const seg of path.slice(1)) {
    schema = unwrap(schema);
    const def = schema._zod.def as { type: string; shape?: Record<string, z.core.$ZodType>; element?: z.core.$ZodType };
    if (def.type === 'object' && typeof seg === 'string' && def.shape?.[seg]) schema = def.shape[seg];
    else if (def.type === 'array' && typeof seg === 'number' && def.element) schema = def.element;
    else return [];
  }
  const def = unwrap(schema)._zod.def as { type: string; shape?: Record<string, unknown> };
  return def.type === 'object' && def.shape ? Object.keys(def.shape) : [];
}

function unwrap(schema: z.core.$ZodType): z.core.$ZodType {
  let s = schema;
  while ((s._zod.def as { type: string }).type === 'optional') {
    s = (s._zod.def as unknown as { innerType: z.core.$ZodType }).innerType;
  }
  return s;
}

export type { FrontMatter };
