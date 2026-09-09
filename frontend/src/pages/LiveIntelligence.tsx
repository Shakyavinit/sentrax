import React from 'react';
import { Radio, VideoOff, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';

export const LiveIntelligence: React.FC = () => {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Live Intelligence & Multi-Stream ANPR Matrix"
        category="OPERATIONS / REAL-TIME STREAMING"
        description="Surveillance-grid matrix showing real-time optical feeds with live bounding-box overlays, vehicle classification, and optical character recognition."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">INGESTION WORKER:</span>
            <StatusBadge status="operational" label="ACTIVE STREAM RUNNER" size="sm" />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="aspect-video rounded-lg border border-[#1F293D] bg-[#111827] flex flex-col justify-between p-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">
                  CHANNEL 0{slot}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  CAM-GJ-0{slot}
                </span>
              </div>
              <StatusBadge status="offline" label="STANDBY" size="sm" />
            </div>

            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <VideoOff className="w-8 h-8 mb-2 text-slate-600" />
              <span className="text-xs font-mono font-semibold text-slate-400">FEED STANDBY</span>
              <p className="text-[11px] mt-1 text-slate-500 max-w-xs">
                To bind an active feed to this channel, navigate to Video Feeds and launch an RTSP or HTTP stream worker.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#1F293D] pt-2 text-[10px] font-mono text-slate-500 z-10">
              <span>FPS: 0.0</span>
              <span>SAMPLING: 5.0 FPS</span>
              <span>BUFFER: 0 FRAMES</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
