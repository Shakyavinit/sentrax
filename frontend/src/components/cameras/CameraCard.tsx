import React from 'react';
import { Camera } from '../../types';
import { CameraFeed } from './CameraFeed';
import { Maximize2, Crosshair, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CameraCardProps {
  camera: Camera;
  onSelect?: (camera: Camera) => void;
  latestSighting?: any;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onSelect, latestSighting }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    onSelect?.(camera);
  };

  const isOffline = camera.status === 'offline';
  const isWarning = camera.status === 'warning';

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[#0D1520] border rounded-[6px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer group flex flex-col ${
        isOffline
          ? 'border-[#FF3B3B]/40 hover:border-[#FF3B3B] hover:shadow-[0_4px_20px_rgba(255,59,59,0.25)]'
          : isWarning
          ? 'border-[#FF8C00]/40 hover:border-[#FF8C00] hover:shadow-[0_4px_20px_rgba(255,140,0,0.25)]'
          : 'border-[#1C2E42] hover:border-[#0E7FE0] hover:shadow-[0_4px_20px_rgba(14,127,224,0.25)]'
      }`}
    >
      {/* Video Stream & Tracking Component */}
      <div className="relative">
        <CameraFeed
          hlsUrl={camera.hls_url}
          rtspUrl={camera.rtsp_url}
          status={camera.status}
          cameraName={`${camera.camera_id} — ${camera.name}`}
          latestSighting={latestSighting}
          onExpand={handleCardClick}
          enableControls={true}
        />
        {/* Subtle hover badge indicating click to enlarge */}
        <div className="absolute inset-0 bg-[#0E7FE0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
          <span className="bg-[#0D1520]/95 border border-[#0E7FE0] text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-[4px] shadow-2xl flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
            <Maximize2 className="w-3.5 h-3.5 text-[#0E7FE0]" />
            CLICK TO ENLARGE & INSPECT
          </span>
        </div>
      </div>

      {/* Card Footer Details */}
      <div className="p-3 flex items-center justify-between text-xs border-t border-[#1C2E42] bg-[#0A101A]">
        <div>
          <div className="font-medium text-[#E8EFF7] truncate max-w-[190px] sm:max-w-[220px]">
            {camera.location_name || camera.name}
          </div>
          <div className="text-[10px] font-mono text-[#8FA8C0] flex items-center gap-1 mt-0.5">
            <span className="text-[#0E7FE0] font-bold">{camera.protocol.toUpperCase()}</span>
            <span>·</span>
            <span>{camera.resolution || '1080p'}</span>
            <span>·</span>
            <span>{camera.fps || 30} FPS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="text-[10px] font-mono text-[#FF3B3B] bg-[#FF3B3B]/10 px-2 py-0.5 rounded border border-[#FF3B3B]/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
              SIGNAL LOSS
            </span>
          ) : isWarning ? (
            <span className="text-[10px] font-mono text-[#FF8C00] bg-[#FF8C00]/10 px-2 py-0.5 rounded border border-[#FF8C00]/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-pulse" />
              DEGRADED (48% LOSS)
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded border border-[#00C875]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
              {camera.recent_sightings_count || 187} scans/24h
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(camera);
            }}
            title="Expand Camera"
            className="p-1.5 rounded bg-[#121E2E] hover:bg-[#0E7FE0] text-[#8FA8C0] hover:text-white border border-[#233A52] hover:border-[#0E7FE0] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
