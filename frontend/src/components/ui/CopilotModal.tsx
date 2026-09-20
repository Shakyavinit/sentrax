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
    <Modal isOpen={isOpen} onClose={onClose} title="SENTRAX FORENSIC AI COPILOT" maxWidth="4xl">
      <div className="flex flex-col h-[74vh] space-y-3 font-sans">
        {/* Top Intelligence Status Banner */}
        <div className="flex items-center justify-between bg-[#121E2E] border-2 border-[#233A52] px-4 py-2.5 rounded-xl text-xs sm:text-sm shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="font-mono text-white font-bold">
              TARGET: <span className="text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded tracking-wider">{targetPlate}</span>
            </span>
            <span className="text-slate-500 font-mono hidden sm:inline">|</span>
            <span className="text-slate-300 font-mono text-xs hidden sm:inline font-semibold">15 Nodes Synchronized</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 font-bold">
              LEVEL-4 TACTICAL
            </span>
            <button
              onClick={() => {
                const lastAi = [...messages].reverse().find((m) => m.role === 'assistant');
                if (lastAi) handleSpeak(lastAi.content);
              }}
              className="text-slate-200 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-[#1A2A3D] border border-transparent hover:border-[#233A52] transition-colors cursor-pointer"
              title={isSpeaking ? 'Mute Radio Dispatch' : 'Listen to Police Radio Dispatch'}
            >
              {isSpeaking ? <VolumeX size={17} className="text-rose-400 animate-pulse" /> : <Volume2 size={17} />}
            </button>
          </div>
        </div>

        {/* Intelligence Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          {TACTICAL_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSel = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)] border border-sky-400'
                    : 'bg-[#121E2E] text-slate-300 hover:text-white border border-[#233A52] hover:border-slate-400'
                }`}
              >
                <Icon size={14} className={isSel ? 'text-white' : 'text-cyan-400'} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat History Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1.5 px-1">
                {m.role === 'assistant' ? (
                  <>
                    <Bot size={15} className="text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      SENTRAX AI COPILOT ({m.timestamp})
                    </span>
                  </>
                ) : (
                  <>
                    <User size={15} className="text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      COMMAND OFFICER ({m.timestamp})
                    </span>
                  </>
                )}
              </div>

              <div
                className={`rounded-2xl p-4.5 text-xs sm:text-sm font-mono leading-relaxed max-w-[95%] shadow-xl transition-all ${
                  m.role === 'user'
                    ? 'bg-[#0E7FE0]/25 border-2 border-[#0E7FE0]/60 text-white shadow-[0_0_15px_rgba(14,127,224,0.2)]'
                    : 'bg-[#0D1520] border-2 border-[#233A52] hover:border-cyan-500/40 text-slate-100'
                }`}
              >
                {m.role === 'assistant' ? (
                  <ForensicReportViewer
                    content={m.content}
                    provider={m.provider}
                    model={m.model}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-white font-medium">{m.content}</p>
                )}

                {/* Card Actions */}
                {m.role === 'assistant' && (
                  <div className="mt-3.5 pt-2.5 border-t border-[#233A52] flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 size={13} /> Section 65B Hash Sealed
                    </span>
                    <div className="flex items-center gap-3 font-semibold">
                      <button
                        onClick={() => handleSpeak(m.content)}
                        className="text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        title="Radio Voice Dispatch"
                      >
                        <Volume2 size={13} /> Radio Readout
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.content);
                          toast.success('Report copied to clipboard');
                        }}
                        className="text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy size={13} /> Copy Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 bg-[#0D1520] border-2 border-[#233A52] rounded-2xl p-4.5 text-xs sm:text-sm font-mono text-slate-200 animate-pulse shadow-md">
              <RefreshCw size={18} className="text-cyan-400 animate-spin" />
              <span>Correlating cross-camera optical flow and drafting forensic brief...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 shrink-0">
          <button
            onClick={() => handleSendMessage(`Predict next 3 junction arrivals and interception ETA for target ${targetPlate}`)}
            className="text-xs font-mono bg-[#121E2E] hover:bg-[#1A2A3D] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-[#233A52] hover:border-cyan-400/50 whitespace-nowrap transition-all shadow-sm font-semibold cursor-pointer"
          >
            ⏱️ Intercept ETA & Route Detour
          </button>
          <button
            onClick={() => handleSendMessage(`Draft Section 65B legal affidavit certificate for target ${targetPlate}`)}
            className="text-xs font-mono bg-[#121E2E] hover:bg-[#1A2A3D] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-[#233A52] hover:border-cyan-400/50 whitespace-nowrap transition-all shadow-sm font-semibold cursor-pointer"
          >
            📜 Draft Court 65B Certificate
          </button>
          <button
            onClick={() => handleSendMessage(`Analyze vehicle damage, window tint, and visual marks for ${targetPlate}`)}
            className="text-xs font-mono bg-[#121E2E] hover:bg-[#1A2A3D] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-[#233A52] hover:border-cyan-400/50 whitespace-nowrap transition-all shadow-sm font-semibold cursor-pointer"
          >
            🔍 Visual Vehicle DNA Profiling
          </button>
          <button
            onClick={() => handleSendMessage(`Broadcast tactical APB hotlist alert to nearby patrol vehicles for ${targetPlate}`)}
            className="text-xs font-mono bg-[#121E2E] hover:bg-[#1A2A3D] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-[#233A52] hover:border-cyan-400/50 whitespace-nowrap transition-all shadow-sm font-semibold cursor-pointer"
          >
            🚨 Police APB Dispatch
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2.5 pt-1.5 shrink-0">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask Copilot: 'Predict next junction arrival', 'Draft Section 65B affidavit', 'Check vehicle tint'..."
            className="flex-1 bg-[#0D1520] border-2 border-[#233A52] focus:border-cyan-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-mono shadow-inner transition-colors"
          />
          <Button
            variant="primary"
            size="lg"
            icon={<Send className="w-4 h-4" />}
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
