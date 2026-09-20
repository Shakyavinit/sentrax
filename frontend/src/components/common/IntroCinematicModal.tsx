import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Github, 
  Play, 
  Sparkles, 
  Camera, 
  Scan, 
  Route, 
  Lock, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  Radio, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface LanguageGreeting {
  lang: string;
  script: string;
  region: string;
}

const GREETINGS: LanguageGreeting[] = [
  { lang: 'Hindi', script: 'नमस्ते भारत', region: 'राष्ट्रीय' },
  { lang: 'Gujarati', script: 'નમસ્તે ભારત', region: 'ગુજરાત' },
  { lang: 'Sanskrit', script: 'नमस्ते भारतम्', region: 'संस्कृतम्' },
  { lang: 'Tamil', script: 'வணக்கம் பாரதம்', region: 'தமிழ்நாடு' },
  { lang: 'Bengali', script: 'নমস্কার ভারত', region: 'পশ্চিমবঙ্গ' },
  { lang: 'Telugu', script: 'నమస్తే భారత్', region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
  { lang: 'Marathi', script: 'नमस्ते भारत', region: 'महाराष्ट्र' },
  { lang: 'Punjabi', script: 'ਨਮਸਤੇ ਭਾਰਤ', region: 'ਪੰਜਾਬ' },
  { lang: 'Kannada', script: 'ನಮಸ್ತೆ ಭಾರತ', region: 'ಕರ್ನಾಟಕ' },
  { lang: 'English', script: 'NAMASTE BHARAT', region: 'INDIA' },
];

const CONCEPT_PILLARS = [
  {
    icon: Camera,
    step: '01',
    title: 'Distributed CCTV Matrix',
    desc: '15 High-Definition municipal surveillance nodes with sub-second RTSP latency and Celery queue processing.',
    stat: '15 CAMERAS ONLINE',
    color: '#0E7FE0'
  },
  {
    icon: Scan,
    step: '02',
    title: 'YOLOv8 + PaddleOCR ANPR',
    desc: 'Dual-stage deep learning pipeline for high-speed multi-lane vehicle detection and plate classification.',
    stat: '96.2% ACCURACY',
    color: '#10B981'
  },
  {
    icon: Route,
    step: '03',
    title: 'Suspect Journey Replay',
    desc: 'Automated chronological cross-camera trajectory reconstruction from Sardar Bridge to GIFT City.',
    stat: 'RADAR LOCK ACTIVE',
    color: '#F59E0B'
  },
  {
    icon: Lock,
    step: '04',
    title: 'Section 65B Evidence Vault',
    desc: 'Court-admissible cryptographic SHA-256 tamper-proof chain of custody compliant with Indian Evidence Act.',
    stat: 'LEGAL SEAL VERIFIED',
    color: '#EC4899'
  }
];

interface IntroCinematicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroCinematicModal: React.FC<IntroCinematicModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'namaste' | 'concept'>('namaste');
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [activePillar, setActivePillar] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Cycle through greetings every 600ms
  useEffect(() => {
    if (!isOpen || stage !== 'namaste') return;
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 700);
    return () => clearInterval(interval);
  }, [isOpen, stage]);

  // Auto transition to concept stage after 4.2 seconds of Namaste Bharat
  useEffect(() => {
    if (!isOpen || stage !== 'namaste') return;
    const timer = setTimeout(() => {
      setStage('concept');
    }, 4200);
    return () => clearTimeout(timer);
  }, [isOpen, stage]);

  // Cycle concept pillars during concept stage
  useEffect(() => {
    if (!isOpen || stage !== 'concept') return;
    const pillarInterval = setInterval(() => {
      setActivePillar((prev) => (prev + 1) % CONCEPT_PILLARS.length);
    }, 3200);
    return () => clearInterval(pillarInterval);
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const handleEnterPlatform = () => {
    if (dontShowAgain) {
      localStorage.setItem('sentrax_intro_dismissed', 'true');
    }
    onClose();
  };

  const currentGreeting = GREETINGS[greetingIndex];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#05080E] text-slate-100 overflow-hidden select-none font-sans">
      {/* Background CRT scanlines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14, 127, 224, 0.08) 2px, rgba(14, 127, 224, 0.08) 4px)'
        }}
      />

      {/* Top Controls Bar */}
      <div className="absolute top-5 left-6 right-6 z-50 flex items-center justify-between">
        {/* GitHub Badge on the side */}
        <a 
          href="https://github.com/Shakyavinit/sentrax"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0D1522]/90 border border-[#233A52] hover:border-[#0E7FE0] text-xs font-mono transition-all text-slate-300 hover:text-white shadow-lg backdrop-blur-md group"
        >
          <Github size={16} className="text-[#0E7FE0] group-hover:scale-110 transition-transform" />
          <span>Shakyavinit / <strong>sentrax</strong></span>
          <ExternalLink size={12} className="text-slate-500 group-hover:text-blue-400" />
        </a>

        {/* Action Skip / Close button */}
        <div className="flex items-center gap-3">
          {stage === 'namaste' && (
            <button 
              onClick={() => setStage('concept')}
              className="px-3 py-1 text-xs font-mono text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center gap-1 transition-all"
            >
              Skip to Concept <ChevronRight size={14} />
            </button>
          )}
          <button 
            onClick={handleEnterPlatform}
            className="p-1.5 rounded-full bg-[#0D1522] border border-[#233A52] hover:border-red-500/50 text-slate-400 hover:text-white transition-all"
            title="Enter Platform"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: NAMASTE BHARAT CULTURAL TECH INTRO                               */}
      {/* ========================================================================= */}
      {stage === 'namaste' && (
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl w-full animate-fadeIn">
          {/* Glowing Ashok Chakra / Saffron-White-Green Cyber Accents */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '24s' }} />
            <div className="absolute inset-2 rounded-full border border-blue-500/60 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600/30 via-white/10 to-emerald-600/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <ShieldCheck className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(14,127,224,0.8)]" />
              </div>
            </div>
          </div>

          {/* Subtitle tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles size={13} />
            <span>INDIAN LAW ENFORCEMENT & CCTV SURVEILLANCE SUITE</span>
          </div>

          {/* Dynamic Language Cycle */}
          <div className="h-28 flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-white to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] transition-all duration-300">
              {currentGreeting.script}
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-2">
              <span className="text-blue-400 font-semibold">{currentGreeting.lang}</span>
              <span>•</span>
              <span className="text-slate-500">{currentGreeting.region}</span>
            </div>
          </div>

          {/* Multi-language ticker pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mt-6">
            {GREETINGS.map((g, idx) => (
              <span 
                key={g.lang}
                className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all duration-300 ${
                  idx === greetingIndex 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-[0_0_12px_rgba(14,127,224,0.3)]' 
                    : 'text-slate-600 bg-slate-900/40 border border-slate-800/40'
                }`}
              >
                {g.script}
              </span>
            ))}
          </div>

          {/* Creator Attribution (Prominent Name) */}
          <div className="mt-12 pt-6 border-t border-[#1C2E42]/80 flex flex-col items-center">
            <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              ARCHITECTED & DEVELOPED BY
            </div>
            <div className="text-2xl font-bold tracking-wide text-white mt-1 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              VINIT SHAKYA
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gujarat State Police Hackathon Edition // SENTRAX 2.0</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: SENTRAX PLATFORM CONCEPT CINEMA & BACKGROUND VIDEO               */}
      {/* ========================================================================= */}
      {stage === 'concept' && (
        <div className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-10 animate-fadeIn">
          {/* Background Video Stream */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video 
              src={`${typeof window !== 'undefined' && window.location.pathname.startsWith('/sentrax') ? '/sentrax' : ''}/videos/traffic_city_junction.mp4`}
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
            />
            {/* Vignette Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/70 to-[#05080E]/80" />
            <div className="absolute inset-0 bg-radial-vignette" />
          </div>

          {/* Tactical Header Overlay */}
          <div className="relative z-10 flex items-center justify-between pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(14,127,224,0.4)]">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-wider text-white flex items-center gap-2">
                  <span>SENTRAX</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    LIVE SYSTEM ONLINE
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  AI CCTV Intelligence & Forensic Investigation Ecosystem
                </div>
              </div>
            </div>

            {/* Author Badge */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Creator</span>
              <strong className="text-sm font-semibold text-slate-200">Vinit Shakya</strong>
            </div>
          </div>

          {/* Tactical Center: 4 Concept Pillars Showcase */}
          <div className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono tracking-widest uppercase mb-2">
                <Radio size={13} className="animate-pulse text-emerald-400" />
                <span>PLATFORM ARCHITECTURE & CAPABILITIES</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                How SENTRAX Modernizes Law Enforcement
              </h2>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {CONCEPT_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isActive = activePillar === idx;
                return (
                  <div
                    key={pillar.title}
                    onClick={() => setActivePillar(idx)}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                      isActive 
                        ? 'bg-[#0D1826]/90 border-blue-500/80 shadow-[0_0_25px_rgba(14,127,224,0.25)] scale-[1.02]' 
                        : 'bg-[#080E17]/80 border-[#1C2E42] hover:border-slate-600'
                    }`}
                  >
                    {/* Top step & icon */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {pillar.step}
                      </span>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${pillar.color}20`, border: `1px solid ${pillar.color}40` }}
                      >
                        <Icon size={16} style={{ color: pillar.color }} />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {pillar.desc}
                    </p>

                    <div 
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded inline-block"
                      style={{ backgroundColor: `${pillar.color}15`, color: pillar.color, border: `1px solid ${pillar.color}30` }}
                    >
                      {pillar.stat}
                    </div>

                    {/* Active highlight bar */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{ backgroundColor: pillar.color, boxShadow: `0 0 10px ${pillar.color}` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Bottom Action Bar */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C2E42]/80">
            {/* Don't show again toggle */}
            <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer hover:text-slate-200">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-[#233A52] bg-[#0D1520] text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span>Don't show automatically on next visit</span>
            </label>

            {/* Glowing Big Enter Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setStage('namaste')}
                className="px-4 py-3 rounded-xl border border-[#233A52] bg-[#0A101A] hover:bg-[#121E2E] text-xs font-mono text-slate-300 transition-all"
              >
                Replay Namaste
              </button>

              <button
                onClick={handleEnterPlatform}
                className="flex-1 md:flex-initial px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(14,127,224,0.5)] hover:shadow-[0_0_40px_rgba(14,127,224,0.8)] transition-all flex items-center justify-center gap-2 group"
              >
                <ShieldCheck size={18} className="group-hover:scale-110 transition-transform text-white" />
                <span>ENTER SENTRAX COMMAND SOC</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
