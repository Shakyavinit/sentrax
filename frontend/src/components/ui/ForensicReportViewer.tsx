import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  content: string;
  provider?: string;
  model?: string;
}

export const ForensicReportViewer: React.FC<Props> = ({ content, provider, model }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Forensic Report copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse line by line
  const renderFormattedMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];
    let keyIdx = 0;

    const flushTable = () => {
      if (tableBuffer.length < 2) {
        tableBuffer.forEach((t) => {
          elements.push(<p key={`tbl-fallback-${keyIdx++}`} className="font-mono text-xs text-[#E8EFF7]">{t}</p>);
        });
        tableBuffer = [];
        return;
      }

      const headerRow = tableBuffer[0]
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const dataRows = tableBuffer.slice(2).map((r) =>
        r
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      elements.push(
        <div key={`table-${keyIdx++}`} className="my-3 overflow-x-auto rounded-xl border-2 border-[#233A52] bg-[#0A101A] shadow-md">
          <table className="w-full text-left border-collapse font-mono text-xs sm:text-sm">
            <thead className="bg-[#121E2E] text-cyan-300 border-b-2 border-[#233A52] uppercase text-xs font-bold tracking-wider">
              <tr>
                {headerRow.map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5 font-bold text-cyan-300">
                    {h.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2E42]">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#121E2E]/80 transition-colors">
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2.5 text-slate-100 whitespace-nowrap">
                      {col.includes('`') ? (
                        <span className="bg-[#162536] text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                          {col.replace(/`/g, '')}
                        </span>
                      ) : col.includes('⚠️') || col.includes('Fast') ? (
                        <span className="text-amber-400 font-bold">{col.replace(/\*\*/g, '')}</span>
                      ) : (
                        col.replace(/\*\*/g, '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check if table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        tableBuffer.push(trimmed);
        return;
      } else if (tableBuffer.length > 0) {
        flushTable();
      }

      if (!trimmed) {
        elements.push(<div key={`blank-${idx}`} className="h-2.5" />);
        return;
      }

      // Horizontal separator
      if (trimmed === '---' || trimmed === '***') {
        elements.push(<hr key={`hr-${idx}`} className="border-[#233A52] my-3.5" />);
        return;
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${idx}`} className="text-sm sm:text-base font-bold text-white uppercase tracking-wider border-b border-cyan-500/40 pb-1.5 mt-4 mb-2 flex items-center gap-2.5">
            <span className="w-2 h-3.5 bg-cyan-400 rounded-sm inline-block shadow-[0_0_8px_#22d3ee]" />
            {trimmed.replace('# ', '')}
          </h2>
        );
        return;
      }

      // Heading 2 / 3
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <h3 key={`h2-${idx}`} className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide mt-3.5 mb-1.5 flex items-center gap-2">
            <span className="text-cyan-400 font-bold">▶</span>
            {text}
          </h3>
        );
        return;
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${idx}`} className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-2.5 mb-1">
            {trimmed.replace('#### ', '')}
          </h4>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-*]\s*/, '');
        elements.push(
          <div key={`bullet-${idx}`} className="flex items-start gap-2.5 pl-2 text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0 shadow-[0_0_6px_#22d3ee]" />
            <span>{renderInlineStyles(itemText)}</span>
          </div>
        );
        return;
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={`num-${idx}`} className="flex items-start gap-2.5 pl-2 text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
            <span className="text-cyan-400 font-mono font-bold">{trimmed.match(/^\d+\./)?.[0]}</span>
            <span>{renderInlineStyles(trimmed.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
        return;
      }

      // Regular text
      elements.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });

    if (tableBuffer.length > 0) {
      flushTable();
    }

    return elements;
  };

  const renderInlineStyles = (text: string) => {
    // Replace `code` and **bold**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-[#121E2E] border border-cyan-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-xs font-bold">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="rounded-xl bg-[#080C12] border-2 border-[#233A52] p-4.5 font-mono text-xs sm:text-sm text-slate-100 space-y-3 shadow-inner">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#233A52] pb-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-slate-100">{provider || 'SENTRAX Tactical AI Copilot'}</span>
          </div>
          {model && (
            <span className="bg-[#121E2E] border border-[#233A52] px-2.5 py-0.5 rounded-md text-xs text-cyan-300 font-semibold">
              {model}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-[#121E2E] hover:bg-[#1A2A3D] text-slate-200 hover:text-white px-3 py-1 rounded-md border border-[#233A52] transition-colors font-semibold cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Dossier'}</span>
        </button>
      </div>

      {/* Structured content */}
      <div className="pt-1 max-h-96 overflow-y-auto pr-1 space-y-1">
        {renderFormattedMarkdown(content)}
      </div>
    </div>
  );
};
