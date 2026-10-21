import type { ReactNode } from 'react';

type RichTextProps = {
  text: string;
};

const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

function linkifyEmail(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = emailRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={`email-${parts.length}`}
        className="underline underline-offset-4"
        href={`mailto:${match[1]}`}
      >
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(raw)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

export function RichText({ text }: RichTextProps) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const inlineTagRegex = /<(strong|em|span|a|code)(\s[^>]*?)?>(.*?)<\/\1>/gs;
  let match: RegExpExecArray | null;

  while ((match = inlineTagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...linkifyEmail(text.slice(lastIndex, match.index)));
    }
    const tagName = match[1];

    if (tagName === 'span') {
      parts.push(
        <span
          key={`span-${parts.length}`}
          className={parseAttributes(match[2] ?? '').class}
        >
          {match[3]}
        </span>,
      );
    } else if (tagName === 'a') {
      const attrs = parseAttributes(match[2] ?? '');
      parts.push(
        <a
          key={`a-${parts.length}`}
          className="underline underline-offset-4"
          href={attrs.href}
        >
          {match[3]}
        </a>,
      );
    } else if (tagName === 'code') {
      parts.push(
        <code
          key={`code-${parts.length}`}
          className="rounded bg-ink/10 px-1 py-0.5 font-mono text-[0.9em]"
        >
          {match[3]}
        </code>,
      );
    } else {
      const Tag = tagName as 'strong' | 'em';
      parts.push(<Tag key={`${tagName}-${parts.length}`}>{match[3]}</Tag>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...linkifyEmail(text.slice(lastIndex)));
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
}
