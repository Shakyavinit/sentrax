import React from 'react';
import { Activity, Radio, VideoOff } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const LiveIntelligence: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Live Intelligence &amp; Multi-Stream Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical feeds with live bounding-box overlays and plate detection telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Awaiting AI Video Ingestion Worker</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="aspect-video rounded-lg border border-slate-800 bg-[#080D1A] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-2">
              <VideoOff className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Channel {slot} — Standby
            </span>
            <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
              Connect camera feed or launch video ingestion worker to stream live annotated frames.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
