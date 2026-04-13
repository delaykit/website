/**
 * Tiny syntax highlighter tuned to the patterns code style.
 * Not a real tokenizer — just regexes that cover:
 *   - line comments (// ...)
 *   - double-quoted strings
 *   - keywords (await, async, const, import, from, new, return, if)
 *   - function calls (identifier followed by "(")
 *
 * Good enough for small, hand-written snippets. Not appropriate for
 * user-submitted code or large files.
 */

type Token =
  | { type: "plain"; value: string }
  | { type: "comment"; value: string }
  | { type: "str"; value: string }
  | { type: "kw"; value: string }
  | { type: "fn"; value: string };

const KEYWORDS = new Set([
  "await",
  "async",
  "const",
  "let",
  "var",
  "import",
  "from",
  "new",
  "return",
  "if",
  "else",
  "function",
  "export",
  "default",
]);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    // Line comment
    if (source[i] === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      const j = end === -1 ? source.length : end;
      tokens.push({ type: "comment", value: source.slice(i, j) });
      i = j;
      continue;
    }

    // String literal (double quote)
    if (source[i] === '"') {
      let j = i + 1;
      while (j < source.length && source[j] !== '"') {
        if (source[j] === "\\") j += 2;
        else j += 1;
      }
      j = Math.min(j + 1, source.length);
      tokens.push({ type: "str", value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Template literal (backtick) — treat like a string
    if (source[i] === "`") {
      let j = i + 1;
      while (j < source.length && source[j] !== "`") {
        if (source[j] === "\\") j += 2;
        else j += 1;
      }
      j = Math.min(j + 1, source.length);
      tokens.push({ type: "str", value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier (letters/digits/_$)
    if (/[A-Za-z_$]/.test(source[i])) {
      let j = i + 1;
      while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j += 1;
      const word = source.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: "kw", value: word });
      } else if (source[j] === "(") {
        tokens.push({ type: "fn", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      i = j;
      continue;
    }

    // Everything else — accumulate until the next interesting boundary
    let j = i + 1;
    while (
      j < source.length &&
      !/[A-Za-z_$]/.test(source[j]) &&
      source[j] !== '"' &&
      source[j] !== "`" &&
      !(source[j] === "/" && source[j + 1] === "/")
    ) {
      j += 1;
    }
    tokens.push({ type: "plain", value: source.slice(i, j) });
    i = j;
  }

  return tokens;
}

export function CodeSnippet({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const tokens = tokenize(source);
  return (
    <pre className={`codeblock ${className ?? ""}`}>
      {tokens.map((t, idx) => {
        if (t.type === "plain") return t.value;
        return (
          <span key={idx} className={t.type}>
            {t.value}
          </span>
        );
      })}
    </pre>
  );
}
