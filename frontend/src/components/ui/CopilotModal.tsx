import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ForensicReportViewer } from './ForensicReportViewer';
import { apiClient } from '../../api/client';
import { Sparkles, Bot, Send, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlate?: string;
  context?: any;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  targetPlate = 'GJ01AB1234',
  context,
}) => {
  const [prompt, setPrompt] = useState(`Analyze movement patterns and generate Section 65B forensic brief for target vehicle ${targetPlate}`);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAskCopilot = async (customPrompt?: string) => {
    const q = customPrompt || prompt;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await apiClient<any>('/copilot/analyze', {
        method: 'POST',
        body: JSON.stringify({
          prompt: q,
          plate_text: targetPlate,
          context: context,
        }),
      });
      setResult(res);
      toast.success(`Intelligence generated via ${res.provider}`);
    } catch (err: any) {
      toast.error('Copilot request failed: ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SENTRAX FORENSIC AI COPILOT" maxWidth="2xl">
      <div className="space-y-4">
        {/* Top Provider Pill */}
        <div className="flex items-center justify-between bg-[#121E2E] border border-[#233A52] px-3 py-2 rounded text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0E7FE0] animate-pulse" />
            <span className="font-mono text-[#E8EFF7]">Google Gemini 3.6 Flash & Forensic Engine Active</span>
          </div>
          <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded border border-[#00C875]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse-dot" />
            LIVE VERIFIED
          </span>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const p = `Generate legal Section 65B Indian Evidence Act certificate for ${targetPlate}`;
              setPrompt(p);
              handleAskCopilot(p);
            }}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] transition-colors"
          >
            📋 Section 65B Certificate
          </button>
          <button
            type="button"
            onClick={() => {
              const p = `Analyze transit speed and detour anomaly between consecutive cameras for ${targetPlate}`;
              setPrompt(p);
              handleAskCopilot(p);
            }}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] transition-colors"
          >
            ⏱️ Transit Speed Anomaly
          </button>
          <button
            type="button"
            onClick={() => {
              const p = `Formulate police arrest interception strategy at next junction for ${targetPlate}`;
              setPrompt(p);
              handleAskCopilot(p);
            }}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] transition-colors"
          >
            🚨 Interception Plan
          </button>
        </div>

        {/* Query Input */}
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI Copilot to analyze suspect trajectory, draft report, or detect route evasion..."
            className="flex-1 bg-[#121E2E] border border-[#233A52] rounded-[4px] p-2.5 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0] font-mono resize-none h-20"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            icon={<Send className="w-3.5 h-3.5" />}
            isLoading={isLoading}
            onClick={() => handleAskCopilot()}
          >
            Generate Forensic Assessment
          </Button>
        </div>

        {/* AI Output Card */}
        {result && (
          <div className="mt-3">
            <ForensicReportViewer
              content={result.analysis}
              provider={result.provider}
              model={result.model}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
