import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Camera } from '../../types';

interface CctvOfflinePatternProps {
  camera: Camera;
  className?: string;
  showControls?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const CctvOfflinePattern: React.FC<CctvOfflinePatternProps> = ({
  camera,
  className = '',
  showControls = false,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-black ${className}`}>
      {/* ─── SMPTE 7-BAR BROADCAST COLOR PATTERN ─── */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-90">
        {/* Top 67%: 7 Primary Color Bars */}
        <div className="flex w-full h-[67%]">
          <div className="flex-1 bg-[#C0C0C0]" title="75% White" />
          <div className="flex-1 bg-[#C0C000]" title="Yellow" />
          <div className="flex-1 bg-[#00C0C0]" title="Cyan" />
          <div className="flex-1 bg-[#00C000]" title="Green" />
          <div className="flex-1 bg-[#C000C0]" title="Magenta" />
          <div className="flex-1 bg-[#C00000]" title="Red" />
          <div className="flex-1 bg-[#0000C0]" title="Blue" />
        </div>

        {/* Middle 8%: Castellation Bars */}
        <div className="flex w-full h-[8%]">
          <div className="flex-1 bg-[#0000C0]" />
          <div className="flex-1 bg-[#121212]" />
          <div className="flex-1 bg-[#C000C0]" />
          <div className="flex-1 bg-[#121212]" />
          <div className="flex-1 bg-[#00C0C0]" />
          <div className="flex-1 bg-[#121212]" />
          <div className="flex-1 bg-[#C0C0C0]" />
        </div>

        {/* Bottom 25%: Sub-carrier & Black Pluge Bars */}
        <div className="flex w-full h-[25%]">
          <div className="w-[18%] bg-[#082238]" title="-I" />
          <div className="w-[18%] bg-[#FFFFFF]" title="100% White" />
          <div className="w-[18%] bg-[#2E083B]" title="+Q" />
          <div className="w-[18%] bg-[#121212]" title="Black 0%" />
          <div className="w-[6%] bg-[#080808]" title="Pluge -4%" />
          <div className="w-[6%] bg-[#121212]" title="Pluge 0%" />
          <div className="w-[6%] bg-[#1E1E1E]" title="Pluge +4%" />
          <div className="flex-1 bg-[#121212]" title="Black" />
        </div>
      </div>

      {/* ─── CRT SCANLINE & STATIC INTERFERENCE EFFECT ─── */}
      <div className="cctv-scanline-overlay pointer-events-none absolute inset-0 z-10" />

      {/* ─── TACTICAL CCTV HUD OVERLAY (TOP) ─── */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>NO SIGNAL</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-black/80 border border-white/20 text-white/90 font-mono text-[10px]">
          {camera.camera_id}
        </div>
      </div>

      {/* ─── CENTER ERROR TACTICAL CALLOUT ─── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 text-center">
        <div className="px-3 py-2.5 max-w-[90%] rounded-md bg-[#0A0D14]/95 border-2 border-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider mb-1">
            <WifiOff size={14} className="animate-pulse text-red-400" />
            <span>FEED INTERRUPTED · CODE 504</span>
          </div>

          <div className="font-sans font-bold text-white text-xs truncate max-w-[220px] mx-auto">
            {camera.name}
          </div>

          <p className="font-mono text-[9px] text-[#A0B0C0] mt-1">
            {camera.metadata?.rtsp_error || 'ERR_RTSP_CONNECTION_TIMED_OUT'}
          </p>

          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-center gap-2 text-[9px] font-mono text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>PACKET LOSS: 100% · RE-ACQUIRING...</span>
          </div>

          {showControls && onRetry && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              disabled={isRetrying}
              className="mt-2.5 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold rounded flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw size={11} className={isRetrying ? 'animate-spin' : ''} />
              <span>{isRetrying ? 'Pinging Node...' : 'Ping Stream Node'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── BOTTOM METADATA BAR ─── */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between font-mono text-[9px] text-white/80 pointer-events-none">
        <span className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
          LOSS: 100%
        </span>
        <span className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-red-300">
          OFFLINE
        </span>
      </div>
    </div>
  );
};
