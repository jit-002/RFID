import React from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface AcademicRendererProps {
  content: string;
  className?: string;
}

export const AcademicRenderer: React.FC<AcademicRendererProps> = ({ content, className = '' }) => {
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Safe KaTeX renderer that returns clean HTML
  const renderMath = (expr: string, displayMode: boolean): string => {
    try {
      let cleaned = expr.trim();
      // Remove enclosing delimiters if present
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1).trim();
      } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
        cleaned = cleaned.slice(2, -2).trim();
      }

      const res = katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
        trust: true
      });

      // If KaTeX generated an error span with red text, render clean formatted code/text instead
      if (res.includes('class="katex-error"')) {
        return `<span class="text-cyan-200 font-mono text-xs">${cleaned}</span>`;
      }

      return res;
    } catch {
      return expr;
    }
  };

  // Normalize malformed model formatting before processing (Requirement 6 & 32)
  const normalizeContent = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // 1. Unescape escaped markdown tags
    text = text.replace(/\\(#{1,6}\s)/g, '$1');
    text = text.replace(/\\(---|\*\*\*|___)/g, '---');
    text = text.replace(/\\(\$)/g, '$');

    // 2. Convert ```math ... ``` into $$ ... $$
    text = text.replace(/```math\s*([\s\S]*?)\s*```/g, '$$\n$1\n$$');

    // 3. Normalize malformed fractions like xn+1n+1+C or ∫xn dx=xn+1n+1+C
    text = text.replace(/x\s*n\+1\s*n\+1\s*\+\s*C/g, '\\frac{x^{n+1}}{n+1} + C');
    text = text.replace(/∫\s*x\^?n\s*d?x\s*=\s*x\^?n\+1\s*n\+1\s*\+\s*C/g, '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C');

    // 4. Auto-wrap unescaped standalone LaTeX lines containing math commands into KaTeX blocks
    // CRITICAL: NEVER wrap normal English prose or lines that already contain inline $ ... $!
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      // Skip lines already containing math delimiters, code, markdown tables, or headers
      if (
        trimmed.startsWith('$') ||
        trimmed.startsWith('\\[') ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('|') ||
        trimmed.startsWith('#') ||
        trimmed.length === 0
      ) {
        return line;
      }

      // If the line already has inline math delimiters ($...$ or \(...\)), DO NOT wrap the whole sentence!
      if (trimmed.includes('$') || trimmed.includes('\\(')) {
        return line;
      }

      // If the line contains standard English prose words (3 or more consecutive word tokens), do NOT wrap!
      const words = trimmed.split(/\s+/).filter(w => /^[a-zA-Z]{3,}/.test(w));
      if (words.length >= 3) {
        return line;
      }

      // Check if line contains standard LaTeX math symbols
      const hasMathCommand = (
        trimmed.includes('\\int') ||
        trimmed.includes('\\frac') ||
        trimmed.includes('\\sqrt') ||
        trimmed.includes('\\sum') ||
        trimmed.includes('\\lim') ||
        trimmed.includes('\\partial') ||
        trimmed.includes('\\begin{') ||
        trimmed.includes('\\cdot') ||
        trimmed.includes('\\times') ||
        trimmed.includes('\\pm') ||
        trimmed.includes('\\approx') ||
        trimmed.includes('\\neq') ||
        trimmed.includes('\\leq') ||
        trimmed.includes('\\geq') ||
        trimmed.includes('\\rightarrow')
      );

      if (hasMathCommand) {
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bullet = trimmed.slice(0, 2);
          const eq = trimmed.slice(2).trim();
          return `${bullet} $${eq}$`;
        }
        return `$$\n${trimmed}\n$$`;
      }

      return line;
    });
    text = processedLines.join('\n');

    return text;
  };

  // Pre-process and segment content into code blocks, tables, display math, and text
  const renderFormattedContent = () => {
    const normalized = normalizeContent(content);
    if (!normalized) return null;

    // Segment into code blocks (```...```) and display math ($$...$$ or \[...\])
    const blockRegex = /(```([a-zA-Z0-9_-]*)\n([\s\S]*?)```)|(\$\$[\s\S]*?\$\$)|(\\\[[\s\S]*?\\\])/g;
    const segments: Array<{ type: 'code' | 'math' | 'text'; content: string; lang?: string }> = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(normalized)) !== null) {
      if (match.index > lastIdx) {
        segments.push({
          type: 'text',
          content: normalized.substring(lastIdx, match.index)
        });
      }

      if (match[1]) {
        // Code block
        segments.push({
          type: 'code',
          content: match[3],
          lang: match[2] || 'code'
        });
      } else if (match[4] || match[5]) {
        // Display math
        segments.push({
          type: 'math',
          content: match[4] || match[5]
        });
      }

      lastIdx = blockRegex.lastIndex;
    }

    if (lastIdx < normalized.length) {
      segments.push({
        type: 'text',
        content: normalized.substring(lastIdx)
      });
    }

    return segments.map((seg, idx) => {
      if (seg.type === 'code') {
        const codeId = `code-${idx}`;
        return (
          <div key={codeId} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#05080E] shadow-lg">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-mono text-slate-400">
              <span className="uppercase font-semibold text-cyan-400">{seg.lang}</span>
              <button
                onClick={() => handleCopyCode(codeId, seg.content)}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedCodeId === codeId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
              <code>{seg.content}</code>
            </pre>
          </div>
        );
      }

      if (seg.type === 'math') {
        const html = renderMath(seg.content, true);
        return (
          <div
            key={`math-${idx}`}
            className="my-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return renderTextBlocks(seg.content, `text-seg-${idx}`);
    });
  };

  // Render text blocks including tables, headings, and lines
  const renderTextBlocks = (text: string, keyPrefix: string): React.ReactNode => {
    // Check for Markdown table blocks (Requirement 25)
    // Table is defined by consecutive lines starting with '|' containing at least one header separator line '|---|'
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect start of table: line starts and ends with '|', next line is separator
      if (
        trimmed.startsWith('|') &&
        trimmed.endsWith('|') &&
        i + 1 < lines.length &&
        /^\s*\|?\s*[-:]+[-| :]*\s*\|?\s*$/.test(lines[i + 1])
      ) {
        const headerLine = trimmed;
        const separatorLine = lines[i + 1].trim();
        const rowLines: string[] = [];
        i += 2;

        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          rowLines.push(lines[i].trim());
          i++;
        }

        nodes.push(renderMarkdownTable(headerLine, separatorLine, rowLines, `${keyPrefix}-tbl-${i}`));
        continue;
      }

      // Horizontal Rule
      if (/^(\s*[-*_]\s*){3,}$/.test(trimmed)) {
        nodes.push(
          <hr key={`${keyPrefix}-hr-${i}`} className="my-4 border-white/10" />
        );
        i++;
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        const isAnswer = title.toLowerCase().includes('answer') || title.toLowerCase().includes('final');
        if (isAnswer) {
          nodes.push(
            <div
              key={`${keyPrefix}-h3-${i}`}
              className="my-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold text-sm tracking-tight flex items-center gap-2.5 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="uppercase text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                {title}
              </span>
            </div>
          );
        } else {
          nodes.push(
            <div
              key={`${keyPrefix}-h3-${i}`}
              className="pt-3 pb-1 font-bold text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>{title}</span>
            </div>
          );
        }
        i++;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        nodes.push(
          <h3 key={`${keyPrefix}-h2-${i}`} className="pt-2 pb-1 font-bold text-base text-white">
            {trimmed.replace('## ', '')}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        nodes.push(
          <h2 key={`${keyPrefix}-h1-${i}`} className="pt-2 pb-1 font-bold text-lg text-white">
            {trimmed.replace('# ', '')}
          </h2>
        );
        i++;
        continue;
      }

      // Chemical reaction line
      if ((trimmed.includes('->') || trimmed.includes('→')) && /[A-Z][a-z]?[0-9]*/.test(trimmed) && !trimmed.startsWith('|')) {
        const chemLine = trimmed.replace(/->/g, ' → ');
        nodes.push(
          <div
            key={`${keyPrefix}-chem-${i}`}
            className="my-1.5 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 font-mono text-cyan-200 text-xs sm:text-sm tracking-wide overflow-x-auto"
          >
            {chemLine}
          </div>
        );
        i++;
        continue;
      }

      // Regular Paragraph / Inline Line
      if (trimmed) {
        nodes.push(
          <div key={`${keyPrefix}-p-${i}`} className="leading-relaxed">
            {renderInlineContent(line)}
          </div>
        );
      } else {
        nodes.push(<div key={`${keyPrefix}-sp-${i}`} className="h-1.5" />);
      }

      i++;
    }

    return <div key={keyPrefix} className="space-y-2">{nodes}</div>;
  };

  // Render Markdown Table with modern responsive CSS (Requirement 25)
  const renderMarkdownTable = (
    headerLine: string,
    _separatorLine: string,
    rowLines: string[],
    key: string
  ): React.ReactNode => {
    const splitCells = (line: string) =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());

    const headers = splitCells(headerLine);
    const rows = rowLines.map(line => splitCells(line));

    return (
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#080B11] shadow-md custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.05] border-b border-white/10">
              {headers.map((h, idx) => (
                <th key={idx} className="p-2.5 font-semibold text-cyan-300 font-mono text-[11px] whitespace-nowrap">
                  {renderInlineContent(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.03] hover:bg-white/[0.06] transition-colors'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-slate-200 leading-relaxed">
                    {renderInlineContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Parses inline math: $...$ or \(...\)
  const renderInlineContent = (line: string): React.ReactNode => {
    const mathRegex = /(\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderPlainText(line.substring(lastIndex, match.index)));
      }

      const mathExpr = match[0];
      const renderedHtml = renderMath(mathExpr, false);

      parts.push(
        <span
          key={`math-${match.index}`}
          className="inline-block px-1 align-baseline text-cyan-200"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );

      lastIndex = mathRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(renderPlainText(line.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : line;
  };

  // Parses bold **...**, bullet points, italic *...*
  const renderPlainText = (text: string): React.ReactNode => {
    const isBullet = text.trimStart().startsWith('- ') || text.trimStart().startsWith('* ');
    const isNumbered = /^\s*\d+\.\s+/.test(text);

    let cleanedText = text;
    if (isBullet) {
      cleanedText = text.replace(/^(\s*[-*]\s+)/, '');
    } else if (isNumbered) {
      cleanedText = text.replace(/^\s*\d+\.\s+/, '');
    }

    // Split for bold tags
    const boldParts = cleanedText.split(/(\*\*.*?\*\*)/g);

    const rendered = boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={text} className="flex items-start gap-2 pl-2">
          <span className="text-cyan-400 mt-1 shrink-0">•</span>
          <span className="flex-1">{rendered}</span>
        </div>
      );
    }

    if (isNumbered) {
      const matchNum = text.match(/^\s*(\d+)\.\s+/);
      const num = matchNum ? matchNum[1] : '1';
      return (
        <div key={text} className="flex items-start gap-2 pl-2">
          <span className="text-cyan-400 font-mono text-[11px] shrink-0 font-semibold">{num}.</span>
          <span className="flex-1">{rendered}</span>
        </div>
      );
    }

    return rendered;
  };

  return (
    <div className={`academic-prose text-xs md:text-sm text-slate-200 space-y-2 leading-relaxed ${className}`}>
      {renderFormattedContent()}
    </div>
  );
};
