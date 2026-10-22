import { isHtmlContent, sanitizeHtml } from "@/lib/sanitizeHtml";

const richTextTagStyles =
  "[&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-500 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline";

// Plain text pasted from Word/LinkedIn job posts often uses a literal
// bullet character (•, -, *) per line instead of real HTML <ul><li>
// markup. Rendered as one whitespace-pre-wrap block, a wrapped bullet
// line's second line starts back at the left margin instead of lining
// up under the first line's text. Detect those lines and render them
// as a real list so wrapping indents correctly.
const BULLET_RE = /^[•\-*]\s*/;

function PlainText({ value, className }: { value: string; className: string }) {
  const lines = value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.some(l => BULLET_RE.test(l))) {
    return <p className={`whitespace-pre-wrap ${className}`}>{value}</p>;
  }

  const groups: { bullet: boolean; lines: string[] }[] = [];
  for (const line of lines) {
    const bullet = BULLET_RE.test(line);
    const text = bullet ? line.replace(BULLET_RE, "") : line;
    const last = groups[groups.length - 1];
    if (last && last.bullet === bullet) last.lines.push(text);
    else groups.push({ bullet, lines: [text] });
  }

  return (
    <div className={className}>
      {groups.map((g, i) =>
        g.bullet ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {g.lines.map((l, j) => <li key={j}>{l}</li>)}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-wrap">{g.lines.join("\n")}</p>
        )
      )}
    </div>
  );
}

export function RichText({ value, className = "" }: { value: string; className?: string }) {
  if (isHtmlContent(value)) {
    return <div className={`${className} ${richTextTagStyles}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />;
  }
  return <PlainText value={value} className={className} />;
}
