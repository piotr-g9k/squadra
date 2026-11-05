import { isMap, isScalar, isSeq, LineCounter, parseDocument, type Document, type Node, type Pair } from 'yaml';

export interface Location {
  line: number;
  col: number;
}

export interface FrontMatter {
  /** Plain JS value of the YAML. */
  data: unknown;
  doc: Document.Parsed;
  /** Maps a YAML path to a 1-based file position. */
  locate: (path: readonly PropertyKey[], target?: 'auto' | 'key' | 'value') => Location | undefined;
}

export type FrontMatterResult =
  | { ok: true; frontMatter: FrontMatter }
  | { ok: false; message: string; location?: Location };

const OPEN = /^﻿?---[ \t]*\r?\n/;
const CLOSE = /^---[ \t]*$/m;

/** Splits off the `---` YAML front matter and parses it with node positions kept. */
export function parseFrontMatter(content: string): FrontMatterResult {
  const open = OPEN.exec(content);
  if (!open) {
    return { ok: false, message: 'DESIGN.md needs YAML front matter between --- lines at the top of the file.' };
  }
  const rest = content.slice(open[0].length);
  const close = CLOSE.exec(rest);
  if (!close) {
    return { ok: false, message: 'The front matter has no closing --- line.', location: { line: 1, col: 1 } };
  }
  const yamlText = rest.slice(0, close.index);
  // The YAML starts on line 2 of the file.
  const LINE_OFFSET = 1;

  const lineCounter = new LineCounter();
  const doc = parseDocument(yamlText, { lineCounter, uniqueKeys: true, prettyErrors: false });
  const toLocation = (offset: number): Location => {
    const { line, col } = lineCounter.linePos(offset);
    return { line: line + LINE_OFFSET, col };
  };

  const firstError = doc.errors[0];
  if (firstError) {
    return {
      ok: false,
      message: `YAML error: ${firstError.message.split('\n')[0]}`,
      location: toLocation(firstError.pos[0]),
    };
  }

  const locate: FrontMatter['locate'] = (path, target = 'auto') => {
    let node: unknown = doc.contents;
    let pair: Pair | undefined;
    for (const seg of path) {
      if (isMap(node)) {
        pair = node.items.find((p) => (isScalar(p.key) ? p.key.value : p.key) === seg);
        if (!pair) return undefined;
        node = pair.value;
      } else if (isSeq(node) && typeof seg === 'number') {
        pair = undefined;
        node = node.items[seg];
      } else {
        return undefined;
      }
    }
    const keyNode = pair && (pair.key as Node | null);
    const valueNode = node as Node | null | undefined;
    const pick =
      target === 'key'
        ? (keyNode ?? valueNode)
        : target === 'value'
          ? (valueNode ?? keyNode)
          : isScalar(valueNode) || !keyNode
            ? (valueNode ?? keyNode)
            : keyNode;
    const range = pick?.range;
    return range ? toLocation(range[0]) : path.length === 0 ? { line: 1, col: 1 } : undefined;
  };

  return { ok: true, frontMatter: { data: doc.toJS(), doc, locate } };
}
