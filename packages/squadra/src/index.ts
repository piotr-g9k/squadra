export { VERSION } from './version.js';
export { validateDesignMd, type Finding, type ValidationResult } from './model/validate.js';
export { designMdSchema, xSquadraSchema, isCssColor, type SquadraConfig, type DesignMdFrontMatter } from './model/schema.js';
export { parseFrontMatter, type FrontMatter, type Location } from './model/front-matter.js';
export * from './model/settings.js';
