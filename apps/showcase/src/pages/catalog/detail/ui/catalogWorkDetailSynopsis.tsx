import { Fragment, type ReactNode } from 'react';

const STRIPPED_SYNOPSIS_TAGS = new Set([
  'EMBED',
  'IFRAME',
  'NOSCRIPT',
  'OBJECT',
  'SCRIPT',
  'STYLE',
]);

const HTML_BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'DIV',
  'DL',
  'FIELDSET',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'UL',
]);

interface ParsedHtmlTag {
  endIndex: number;
  isClosing: boolean;
  isSelfClosing: boolean;
  name: string | null;
}

function parseHtmlTag(value: string, startIndex: number): ParsedHtmlTag | null {
  if (value[startIndex] !== '<') {
    return null;
  }

  const nextCharacter = value[startIndex + 1];

  if (!nextCharacter || !/[A-Za-z!/?]/.test(nextCharacter)) {
    return null;
  }

  let cursor = startIndex + 1;
  let quoteCharacter: '"' | "'" | null = null;

  while (cursor < value.length) {
    const character = value[cursor];

    if (quoteCharacter !== null) {
      if (character === quoteCharacter) {
        quoteCharacter = null;
      }

      cursor += 1;
      continue;
    }

    if (character === '"' || character === "'") {
      quoteCharacter = character;
      cursor += 1;
      continue;
    }

    if (character === '>') {
      break;
    }

    cursor += 1;
  }

  if (cursor >= value.length) {
    return null;
  }

  const rawTag = value.slice(startIndex + 1, cursor).trim();

  if (
    rawTag.length === 0 ||
    rawTag.startsWith('!--') ||
    rawTag.startsWith('!DOCTYPE') ||
    rawTag.startsWith('?')
  ) {
    return {
      endIndex: cursor + 1,
      isClosing: false,
      isSelfClosing: true,
      name: null,
    };
  }

  const isClosing = rawTag.startsWith('/');
  const normalizedTag = isClosing ? rawTag.slice(1).trimStart() : rawTag;
  const nameMatch = /^[A-Za-z][A-Za-z0-9:-]*/.exec(normalizedTag);

  return {
    endIndex: cursor + 1,
    isClosing,
    isSelfClosing: /\/\s*$/.test(normalizedTag),
    name: nameMatch?.[0]?.toUpperCase() ?? null,
  };
}

function stripHtmlTags(value: string) {
  let output = '';
  const strippedTagStack: string[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const parsedTag = parseHtmlTag(value, cursor);

    if (parsedTag === null) {
      if (strippedTagStack.length === 0) {
        output += value[cursor];
      }

      cursor += 1;
      continue;
    }

    cursor = parsedTag.endIndex;

    if (parsedTag.name === null) {
      continue;
    }

    if (parsedTag.isClosing) {
      const matchingIndex = strippedTagStack.lastIndexOf(parsedTag.name);

      if (matchingIndex !== -1) {
        strippedTagStack.splice(matchingIndex, 1);
      }

      continue;
    }

    if (
      STRIPPED_SYNOPSIS_TAGS.has(parsedTag.name) &&
      !parsedTag.isSelfClosing
    ) {
      strippedTagStack.push(parsedTag.name);
    }
  }

  return output;
}

function serializeHtmlNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toUpperCase();

  if (STRIPPED_SYNOPSIS_TAGS.has(tagName)) {
    return '';
  }

  if (tagName === 'IMG' || tagName === 'VIDEO' || tagName === 'AUDIO') {
    return '';
  }

  if (tagName === 'A') {
    return Array.from(element.childNodes).map(serializeHtmlNode).join('');
  }

  if (tagName === 'BR') {
    return '\n';
  }

  if (tagName === 'HR') {
    return '\n\n---\n\n';
  }

  if (tagName === 'PRE') {
    const content = Array.from(element.childNodes)
      .map(serializeHtmlNode)
      .join('');

    return '\n\n' + '```' + '\n' + content + '\n' + '```\n\n';
  }

  if (tagName === 'CODE') {
    return `\`${element.textContent ?? ''}\``;
  }

  const content = Array.from(element.childNodes)
    .map(serializeHtmlNode)
    .join('');

  if (tagName === 'STRONG' || tagName === 'B') {
    return `**${content}**`;
  }

  if (tagName === 'EM' || tagName === 'I') {
    return `*${content}*`;
  }

  if (tagName === 'DEL' || tagName === 'S') {
    return `~~${content}~~`;
  }

  if (tagName === 'BLOCKQUOTE') {
    return `${content
      .trim()
      .split('\n')
      .map((line) => (line.length > 0 ? `> ${line}` : '>'))
      .join('\n')}\n\n`;
  }

  if (tagName === 'LI') {
    return `- ${content.trim()}\n`;
  }

  if (tagName === 'UL' || tagName === 'OL') {
    return `\n${content}\n`;
  }

  if (/^H[1-6]$/.test(tagName)) {
    const level = tagName.slice(1);
    return `\n\n${'#'.repeat(Number(level))} ${content.trim()}\n\n`;
  }

  return HTML_BLOCK_TAGS.has(tagName) ? `\n\n${content}\n\n` : content;
}

function normalizeSynopsisMarkup(value: string): string {
  if (typeof DOMParser === 'undefined') {
    return stripHtmlTags(value);
  }

  try {
    const document = new DOMParser().parseFromString(value, 'text/html');

    return Array.from(document.body.childNodes).map(serializeHtmlNode).join('');
  } catch {
    return stripHtmlTags(value);
  }
}

function findClosingMarker(value: string, marker: string, startIndex: number) {
  const closingIndex = value.indexOf(marker, startIndex);

  return closingIndex > startIndex ? closingIndex : -1;
}

function renderInlineContent(value: string, keyPrefix: string): ReactNode[] {
  const content: ReactNode[] = [];
  let textBuffer = '';

  const flushText = () => {
    if (textBuffer.length > 0) {
      content.push(textBuffer);
      textBuffer = '';
    }
  };

  let cursor = 0;

  while (cursor < value.length) {
    const character = value[cursor];

    if (character === '\\' && value[cursor + 1]) {
      const escapedCharacter = value[cursor + 1];

      if (/[*_`~\\[\]()#.!-]/.test(escapedCharacter)) {
        textBuffer += escapedCharacter;
        cursor += 2;
        continue;
      }
    }

    if (character === '`') {
      const closingIndex = findClosingMarker(value, '`', cursor + 1);

      if (closingIndex !== -1) {
        flushText();
        content.push(
          <code
            key={`${keyPrefix}-code-${cursor}`}
            className="rounded-sm bg-vellum/30 px-1 py-0.5"
          >
            {value.slice(cursor + 1, closingIndex)}
          </code>,
        );
        cursor = closingIndex + 1;
        continue;
      }
    }

    const strongMarker = value.startsWith('**', cursor)
      ? '**'
      : value.startsWith('__', cursor)
        ? '__'
        : null;

    if (strongMarker) {
      const closingIndex = findClosingMarker(
        value,
        strongMarker,
        cursor + strongMarker.length,
      );

      if (closingIndex !== -1) {
        flushText();
        content.push(
          <strong key={`${keyPrefix}-strong-${cursor}`}>
            {renderInlineContent(
              value.slice(cursor + strongMarker.length, closingIndex),
              `${keyPrefix}-strong-${cursor}`,
            )}
          </strong>,
        );
        cursor = closingIndex + strongMarker.length;
        continue;
      }
    }

    if (character === '*' || character === '_') {
      const isUnderscoreInWord =
        character === '_' &&
        /\w/.test(value[cursor - 1] ?? '') &&
        /\w/.test(value[cursor + 1] ?? '');

      if (!isUnderscoreInWord) {
        const closingIndex = findClosingMarker(value, character, cursor + 1);

        if (closingIndex !== -1) {
          flushText();
          content.push(
            <em key={`${keyPrefix}-emphasis-${cursor}`}>
              {renderInlineContent(
                value.slice(cursor + 1, closingIndex),
                `${keyPrefix}-emphasis-${cursor}`,
              )}
            </em>,
          );
          cursor = closingIndex + 1;
          continue;
        }
      }
    }

    if (value.startsWith('~~', cursor)) {
      const closingIndex = findClosingMarker(value, '~~', cursor + 2);

      if (closingIndex !== -1) {
        flushText();
        content.push(
          <del key={`${keyPrefix}-strike-${cursor}`}>
            {renderInlineContent(
              value.slice(cursor + 2, closingIndex),
              `${keyPrefix}-strike-${cursor}`,
            )}
          </del>,
        );
        cursor = closingIndex + 2;
        continue;
      }
    }

    if (character === '[') {
      const linkMatch = /^\[([^\]]+)\]\(([^\s]+)\)/.exec(value.slice(cursor));

      if (linkMatch) {
        const [, label] = linkMatch;

        flushText();
        const labelContent = renderInlineContent(
          label,
          `${keyPrefix}-link-${cursor}`,
        );

        content.push(
          <Fragment key={`${keyPrefix}-link-${cursor}`}>
            {labelContent}
          </Fragment>,
        );

        cursor += linkMatch[0].length;
        continue;
      }
    }

    if (character === '\n') {
      textBuffer += ' ';
    } else {
      textBuffer += character;
    }

    cursor += 1;
  }

  flushText();
  return content;
}

function isMarkdownBlockStart(line: string): boolean {
  return (
    /^ {0,3}#{1,6}\s+/.test(line) ||
    /^ {0,3}(?:```|~~~)/.test(line) ||
    /^ {0,3}(?:[-*_]\s*){3,}$/.test(line) ||
    /^ {0,3}>/.test(line) ||
    /^ {0,3}(?:[-+*]|\d+[.)])\s+/.test(line)
  );
}

function renderMarkdownBlocks(
  markdown: string,
  keyPrefix: string,
): ReactNode[] {
  const lines = markdown
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .split('\n');
  const blocks: ReactNode[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const line = lines[cursor];

    if (line.trim().length === 0) {
      cursor += 1;
      continue;
    }

    const fenceMatch = /^ {0,3}(`{3,}|~{3,})[^`~]*$/.exec(line);

    if (fenceMatch) {
      const fence = fenceMatch[1];
      const codeLines: string[] = [];
      cursor += 1;

      while (
        cursor < lines.length &&
        !new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`).test(
          lines[cursor],
        )
      ) {
        codeLines.push(lines[cursor]);
        cursor += 1;
      }

      if (cursor < lines.length) {
        cursor += 1;
      }

      blocks.push(
        <pre
          key={`${keyPrefix}-code-${cursor}`}
          className="mb-4 overflow-x-auto rounded-2xl bg-vellum/30 p-4 last:mb-0"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = /^( {0,3})(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);

    if (headingMatch) {
      const markdownLevel = headingMatch[2].length;
      const headingLevel = Math.min(markdownLevel + 1, 6) as 2 | 3 | 4 | 5 | 6;
      const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

      blocks.push(
        <Heading
          key={`${keyPrefix}-heading-${cursor}`}
          className="app-text-section-title mb-4 text-ink last:mb-0"
        >
          {renderInlineContent(
            headingMatch[3],
            `${keyPrefix}-heading-${cursor}`,
          )}
        </Heading>,
      );
      cursor += 1;
      continue;
    }

    if (/^ {0,3}(?:[-*_]\s*){3,}$/.test(line)) {
      blocks.push(
        <hr
          key={`${keyPrefix}-rule-${cursor}`}
          className="mb-4 border-0 border-t border-rule/30 last:mb-0"
        />,
      );
      cursor += 1;
      continue;
    }

    if (/^ {0,3}>/.test(line)) {
      const quoteLines: string[] = [];

      while (cursor < lines.length) {
        const quoteMatch = /^ {0,3}> ?(.*)$/.exec(lines[cursor]);

        if (!quoteMatch) {
          break;
        }

        quoteLines.push(quoteMatch[1]);
        cursor += 1;
      }

      blocks.push(
        <blockquote
          key={`${keyPrefix}-quote-${cursor}`}
          className="mb-4 border-l-2 border-rule/50 pl-4 text-ink-3 last:mb-0"
        >
          {renderMarkdownBlocks(
            quoteLines.join('\n'),
            `${keyPrefix}-quote-${cursor}`,
          )}
        </blockquote>,
      );
      continue;
    }

    const listMatch = /^ {0,3}([-+*]|\d+[.)])\s+(.+)$/.exec(line);

    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const items: string[] = [];

      while (cursor < lines.length) {
        const itemMatch = /^ {0,3}([-+*]|\d+[.)])\s+(.+)$/.exec(lines[cursor]);

        if (!itemMatch || /^\d/.test(itemMatch[1]) !== ordered) {
          break;
        }

        items.push(itemMatch[2]);
        cursor += 1;
      }

      const List = ordered ? 'ol' : 'ul';

      blocks.push(
        <List
          key={`${keyPrefix}-list-${cursor}`}
          className={`${ordered ? 'list-decimal' : 'list-disc'} mb-4 space-y-2 pl-6 last:mb-0`}
        >
          {items.map((item, index) => (
            <li key={`${keyPrefix}-list-${cursor}-${index}`} className="pl-1">
              {renderInlineContent(
                item,
                `${keyPrefix}-list-${cursor}-${index}`,
              )}
            </li>
          ))}
        </List>,
      );
      continue;
    }

    const paragraphLines = [line];
    cursor += 1;

    while (
      cursor < lines.length &&
      lines[cursor].trim().length > 0 &&
      !isMarkdownBlockStart(lines[cursor])
    ) {
      paragraphLines.push(lines[cursor]);
      cursor += 1;
    }

    const paragraph = paragraphLines.join('\n').replace(/ {2,}\n/g, '\n');

    blocks.push(
      <p key={`${keyPrefix}-paragraph-${cursor}`} className="mb-4 last:mb-0">
        {renderInlineContent(paragraph, `${keyPrefix}-paragraph-${cursor}`)}
      </p>,
    );
  }

  return blocks;
}

export function renderSynopsisContent(value: string): ReactNode {
  return renderMarkdownBlocks(normalizeSynopsisMarkup(value), 'synopsis');
}
