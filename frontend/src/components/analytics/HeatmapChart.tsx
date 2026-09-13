import React from 'react';
import { CameraHeatmapData } from '../../types';

interface HeatmapChartProps {
  data: CameraHeatmapData[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const cameraIds = Array.from(new Set(data.map((d) => d.camera_id))).slice(0, 8);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-[#121E2E]';
    if (count < 8) return 'bg-[#0A4F8C]/60';
    if (count < 18) return 'bg-[#0E7FE0]';
    if (count < 28) return 'bg-[#1A9FFF]';
    return 'bg-[#00C875]';
  };

  const matrixMap = new Map<string, number>();
  data.forEach((d) => {
    matrixMap.set(`${d.camera_id}_${d.hour}`, d.count);
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] text-xs">
        {/* Hour Header */}
        <div className="flex items-center mb-1.5 pl-20">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center font-mono text-[9px] text-[#4D6B85]">
              {h % 3 === 0 ? `${h}h` : ''}
            </div>
          ))}
        </div>

        {/* Camera Rows */}
        <div className="space-y-1">
          {cameraIds.map((camId) => (
            <div key={camId} className="flex items-center gap-1.5">
              <div className="w-20 font-mono text-[10px] text-[#8FA8C0] truncate text-right pr-2">
                {camId}
              </div>
              <div className="flex-1 flex gap-1">
                {hours.map((h) => {
                  const count = matrixMap.get(`${camId}_${h}`) || 0;
                  return (
                    <div
                      key={h}
                      title={`${camId} at ${h}:00 - ${count} scans`}
                      className={`flex-1 h-5 rounded-[1px] cursor-pointer transition-all hover:ring-1 hover:ring-white ${getIntensityColor(
                        count
                      )}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
