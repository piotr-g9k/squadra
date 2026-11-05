// A small CSS color check for values design.md never sees (dark mode lives in x-squadra).
// It accepts what Tailwind v4 / shadcn themes write: hex, named colors and color functions.

const NAMED = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
    'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
    'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
    'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
    'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
    'yellowgreen transparent currentcolor'
  ).split(' '),
);

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
/** Channel functions take 3 components, optionally `/ alpha` (or a 4th legacy comma value). */
const CHANNEL_FN = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(([\s\S]*)\)$/i;
const COMPONENT = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?(?:%|deg|rad|grad|turn)?$|^none$/i;
/** color() and color-mix() take color spaces and nested colors; checked loosely. */
const MIX_FN = /^(?:color|color-mix)\(([\s\S]+)\)$/i;

export function isCssColor(value: string): boolean {
  const v = value.trim();
  if (HEX.test(v) || NAMED.has(v.toLowerCase())) return true;

  const channel = CHANNEL_FN.exec(v);
  if (channel) {
    const [main = '', alpha, ...extra] = channel[2]!.split('/');
    if (extra.length) return false;
    const parts = main.split(/[\s,]+/).filter(Boolean);
    const comma = main.includes(',');
    const count = alpha === undefined && comma ? [3, 4] : [3];
    if (!count.includes(parts.length) || !parts.every((p) => COMPONENT.test(p))) return false;
    if (alpha === undefined) return true;
    const a = alpha.trim();
    return !comma && COMPONENT.test(a);
  }

  const mix = MIX_FN.exec(v);
  return mix ? /\d|#|[a-z]{3,}/i.test(mix[1]!) && !/[;{}]/.test(mix[1]!) : false;
}
