import React, { useState } from 'react';
import { CameraHeatmapData } from '../../types';

interface HeatmapChartProps {
  data: CameraHeatmapData[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    camName: string;
    camId: string;
    hour: number;
    count: number;
  } | null>(null);

  // Group by camera_id
  const cameraMap = new Map<string, { id: string; name: string }>();
  data.forEach((d) => {
    if (!cameraMap.has(d.camera_id)) {
      cameraMap.set(d.camera_id, { id: d.camera_id, name: d.camera_name });
    }
  });

  const cameras = Array.from(cameraMap.values()).slice(0, 8);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const matrixMap = new Map<string, number>();
  data.forEach((d) => {
    matrixMap.set(`${d.camera_id}_${d.hour}`, d.count);
  });

  const getIntensityStyle = (count: number) => {
    if (count === 0) {
      return {
        bg: 'bg-[#0A111A] hover:bg-[#121E2C]',
        border: 'border-[#142334]',
      };
    }
    if (count < 8) {
      return {
        bg: 'bg-[#0E2E4E] hover:bg-[#153D66]',
        border: 'border-[#154673]',
      };
    }
    if (count < 18) {
      return {
        bg: 'bg-[#0E7FE0] hover:bg-[#2192F5]',
        border: 'border-[#339BFA]',
      };
    }
    if (count < 28) {
      return {
        bg: 'bg-[#00C875] hover:bg-[#00E687]',
        border: 'border-[#14E58E]',
      };
    }
    return {
      bg: 'bg-[#FF9F1C] hover:bg-[#FFB042]',
      border: 'border-[#FFC06A]',
    };
  };

  return (
    <div className="w-full flex flex-col font-mono text-xs">
      {/* Top Status & Hover Telemetry readout */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#142233] text-[10px] min-h-[26px]">
        <div className="flex items-center gap-2 text-[#7E9AB5]">
          {hoveredCell ? (
            <span className="flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E7FE0] animate-ping" />
              <strong className="text-[#0E7FE0]">{hoveredCell.camName}</strong>
              <span className="text-[#4D6B85]">|</span>
              <span>
                Hour <strong className="text-white">{String(hoveredCell.hour).padStart(2, '0')}:00</strong>
              </span>
              <span className="text-[#4D6B85]">|</span>
              <span className="text-emerald-400 font-bold">{hoveredCell.count} Scans</span>
            </span>
          ) : (
            <span className="text-[#4D6B85]">HOVER ANY CELL FOR INSTANT NODE TELEMETRY</span>
          )}
        </div>
        <div className="text-[9px] text-[#7E9AB5] hidden sm:block">
          SURVEILLANCE GRID: <span className="text-[#00C875] font-bold">24-HR CYCLE</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[580px]">
          {/* Hour Labels */}
          <div className="flex items-center mb-1.5 pl-24 pr-1">
            {hours.map((h) => (
              <div
                key={h}
                className={`flex-1 text-center text-[9px] ${
                  h % 4 === 0 ? 'text-[#8FA8C0] font-bold' : 'text-[#364F6B]'
                }`}
              >
                {h % 4 === 0 ? `${String(h).padStart(2, '0')}h` : '·'}
              </div>
            ))}
          </div>

          {/* Camera Rows */}
          <div className="space-y-1.5">
            {cameras.map((cam) => (
              <div key={cam.id} className="flex items-center gap-1.5 group">
                <div
                  className="w-24 text-[10px] text-[#8FA8C0] truncate text-right pr-2 group-hover:text-white transition-colors"
                  title={`${cam.name} (${cam.id})`}
                >
                  {cam.name.replace(/^(CAM-\d+\s*[-:]?\s*)/i, '').slice(0, 13) || cam.id}
                </div>
                <div className="flex-1 flex gap-1">
                  {hours.map((h) => {
                    const count = matrixMap.get(`${cam.id}_${h}`) || 0;
                    const style = getIntensityStyle(count);
                    return (
                      <div
                        key={h}
                        onMouseEnter={() =>
                          setHoveredCell({
                            camName: cam.name,
                            camId: cam.id,
                            hour: h,
                            count,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`flex-1 h-5 rounded-[2px] cursor-pointer transition-all duration-150 border ${style.bg} ${style.border}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="pt-2.5 mt-2.5 border-t border-[#142233] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#7E9AB5]">
        <div className="flex items-center gap-3">
          <span className="text-[#4D6B85]">DENSITY:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[1px] bg-[#0A111A] border border-[#142334]" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[1px] bg-[#0E2E4E] border border-[#154673]" />
            <span>&lt;8</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[1px] bg-[#0E7FE0] border border-[#339BFA]" />
            <span>8–18</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[1px] bg-[#00C875] border border-[#14E58E]" />
            <span>18–28</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[1px] bg-[#FF9F1C] border border-[#FFC06A]" />
            <span>Peak &gt;28</span>
          </div>
        </div>

        <div className="text-[9px] text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded border border-[#00C875]/25">
          PEAK WINDOW: 17:00–19:30 IST
        </div>
      </div>
    </div>
  );
};
