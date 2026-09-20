import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ForensicReportViewer } from './ForensicReportViewer';
import { apiClient } from '../../api/client';
import {
  Sparkles,
  Bot,
  Send,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Volume2,
  VolumeX,
  Copy,
  Radio,
  Clock,
  Compass,
  Zap,
  Target,
  FileCheck,
  RefreshCw,
  User,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  mode?: string;
}

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlate?: string;
  context?: any;
}

const TACTICAL_MODES = [
  { id: 'all', label: 'General Forensic Inquiry', icon: Bot },
  { id: 'intercept', label: 'Interception & Route ETA', icon: Target },
  { id: 'legal', label: 'Section 65B Legal Drafter', icon: FileCheck },
  { id: 'profiler', label: 'Vehicle DNA & Visual Profile', icon: Zap },
];

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  targetPlate = 'UP32PQ6677',
  context,
}) => {
  const [selectedMode, setSelectedMode] = useState('all');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 🚨 SENTRAX TACTICAL FORENSIC COPILOT ONLINE
**ACTIVE TARGET:** \`${targetPlate}\` | **RADAR STATUS:** LOCKED  
I am connected to the 15-node Ahmedabad-Gandhinagar CCTV matrix and Section 65B Evidence Vault. How can I assist your investigation?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'SENTRAX Tactical Neural Copilot v3.4',
      model: 'YOLOv8 + PaddleOCR Intelligence Core',
    },
  ]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Play radio beep sound effect before speaking
  const playRadioBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    playRadioBeep();
    setTimeout(() => {
      const cleanText = text
        .replace(/[#*`_]/g, '')
        .replace(/\n+/g, ' ')
        .substring(0, 400);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.info('Broadcasting police tactical audio dispatch...');
    }, 150);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const q = customPrompt || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await apiClient<any>('/copilot/analyze', {
        method: 'POST',
        body: JSON.stringify({
          prompt: q,
          plate_text: targetPlate,
          mode: selectedMode,
          context: context,
        }),
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.analysis,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: res.provider || 'SENTRAX Tactical AI Copilot',
        model: res.model || 'YOLOv8 + PaddleOCR Neural Engine',
        mode: selectedMode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      toast.success('Forensic intelligence generated');
    } catch (err: any) {
      toast.error('Copilot request error: ' + (err.message || 'Service unreachable'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SENTRAX FORENSIC AI COPILOT" maxWidth="3xl">
      <div className="flex flex-col h-[70vh] space-y-3 font-sans">
        {/* Top Intelligence Status Banner */}
        <div className="flex items-center justify-between bg-[#121E2E] border border-[#233A52] px-3.5 py-2 rounded-lg text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C875] animate-pulse" />
            <span className="font-mono text-[#E8EFF7] font-semibold">
              TARGET: <span className="text-[#0E7FE0]">{targetPlate}</span>
            </span>
            <span className="text-[#4D6B85] font-mono">|</span>
            <span className="text-[#8FA8C0] font-mono text-[11px]">15 Nodes Synchronized</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded border border-[#00C875]/30">
              LEVEL-4 TACTICAL
            </span>
            <button
              onClick={() => {
                const lastAi = [...messages].reverse().find((m) => m.role === 'assistant');
                if (lastAi) handleSpeak(lastAi.content);
              }}
              className="text-[#8FA8C0] hover:text-[#0E7FE0] p-1 rounded hover:bg-[#1A2A3D] transition-colors"
              title={isSpeaking ? 'Mute Radio Dispatch' : 'Listen to Police Radio Dispatch'}
            >
              {isSpeaking ? <VolumeX size={15} className="text-[#FF3B3B] animate-pulse" /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Intelligence Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          {TACTICAL_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSel = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                  isSel
                    ? 'bg-[#0E7FE0] text-white font-semibold shadow-md'
                    : 'bg-[#121E2E] text-[#8FA8C0] hover:text-white border border-[#233A52]'
                }`}
              >
                <Icon size={13} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat History Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {m.role === 'assistant' ? (
                  <>
                    <Bot size={13} className="text-[#0E7FE0]" />
                    <span className="text-[10px] font-mono text-[#8FA8C0]">
                      SENTRAX AI COPILOT ({m.timestamp})
                    </span>
                  </>
                ) : (
                  <>
                    <User size={13} className="text-[#10B981]" />
                    <span className="text-[10px] font-mono text-[#8FA8C0]">
                      COMMAND OFFICER ({m.timestamp})
                    </span>
                  </>
                )}
              </div>

              <div
                className={`rounded-xl p-4 text-xs font-mono leading-relaxed max-w-[92%] shadow-lg ${
                  m.role === 'user'
                    ? 'bg-[#0E7FE0]/20 border border-[#0E7FE0]/40 text-[#E8EFF7]'
                    : 'bg-[#0D1520] border border-[#233A52] text-[#E8EFF7]'
                }`}
              >
                {m.role === 'assistant' ? (
                  <ForensicReportViewer
                    content={m.content}
                    provider={m.provider}
                    model={m.model}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}

                {/* Card Actions */}
                {m.role === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-[#1C2E42] flex items-center justify-between text-[10px] text-[#8FA8C0]">
                    <span className="flex items-center gap-1 text-[#00C875]">
                      <CheckCircle2 size={11} /> Section 65B Hash Sealed
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(m.content)}
                        className="hover:text-white flex items-center gap-1"
                        title="Radio Voice Dispatch"
                      >
                        <Volume2 size={11} /> Radio Readout
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.content);
                          toast.success('Report copied to clipboard');
                        }}
                        className="hover:text-white flex items-center gap-1"
                      >
                        <Copy size={11} /> Copy Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 bg-[#0D1520] border border-[#233A52] rounded-xl p-4 text-xs font-mono text-[#8FA8C0] animate-pulse">
              <RefreshCw size={16} className="text-[#0E7FE0] animate-spin" />
              <span>Correlating cross-camera optical flow and drafting forensic brief...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 shrink-0">
          <button
            onClick={() => handleSendMessage(`Predict next 3 junction arrivals and interception ETA for target ${targetPlate}`)}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] whitespace-nowrap transition-colors"
          >
            ⏱️ Intercept ETA & Route Detour
          </button>
          <button
            onClick={() => handleSendMessage(`Draft Section 65B legal affidavit certificate for target ${targetPlate}`)}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] whitespace-nowrap transition-colors"
          >
            📜 Draft Court 65B Certificate
          </button>
          <button
            onClick={() => handleSendMessage(`Analyze vehicle damage, window tint, and visual marks for ${targetPlate}`)}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] whitespace-nowrap transition-colors"
          >
            🔍 Visual Vehicle DNA Profiling
          </button>
          <button
            onClick={() => handleSendMessage(`Broadcast tactical APB hotlist alert to nearby patrol vehicles for ${targetPlate}`)}
            className="text-[11px] font-mono bg-[#1A2A3D] hover:bg-[#233A52] text-[#8FA8C0] hover:text-white px-2.5 py-1 rounded border border-[#233A52] whitespace-nowrap transition-colors"
          >
            🚨 Police APB Dispatch
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-1 shrink-0">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask Copilot: 'Predict next junction arrival', 'Draft Section 65B affidavit', 'Check vehicle tint'..."
            className="flex-1 bg-[#121E2E] border border-[#233A52] rounded-lg px-3.5 py-2.5 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0] font-mono"
          />
          <Button
            variant="primary"
            size="md"
            icon={<Send className="w-3.5 h-3.5" />}
            isLoading={isLoading}
            onClick={() => handleSendMessage()}
          >
            Analyze
          </Button>
        </div>
      </div>
    </Modal>
  );
};
