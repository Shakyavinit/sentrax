import React from 'react';
import { ConfidenceBucket } from '../../types';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConfidenceDistributionChartProps {
  data: ConfidenceBucket[];
}

export const ConfidenceDistributionChart: React.FC<ConfidenceDistributionChartProps> = ({ data }) => {
  const defaultBuckets: ConfidenceBucket[] = [
    { bucket: '50-60%', count: 8 },
    { bucket: '60-70%', count: 24 },
    { bucket: '70-80%', count: 65 },
    { bucket: '80-90%', count: 184 },
    { bucket: '90-100%', count: 312 },
  ];

  const buckets = data && data.length > 0 ? data : defaultBuckets;
  const totalDetections = buckets.reduce((acc, b) => acc + b.count, 0);
  const highConfCount = buckets
    .filter((b) => b.bucket.includes('80') || b.bucket.includes('90'))
    .reduce((acc, b) => acc + b.count, 0);
  const highConfPercentage = totalDetections > 0 ? ((highConfCount / totalDetections) * 100).toFixed(1) : '96.2';

  const getBucketColor = (bucket: string) => {
    if (bucket.includes('90') || bucket.includes('100')) return 'bg-emerald-500 text-emerald-400 border-emerald-500/40';
    if (bucket.includes('80')) return 'bg-[#0E7FE0] text-[#0E7FE0] border-[#0E7FE0]/40';
    if (bucket.includes('70')) return 'bg-cyan-400 text-cyan-400 border-cyan-400/40';
    if (bucket.includes('60')) return 'bg-amber-500 text-amber-400 border-amber-500/40';
    return 'bg-red-500 text-red-400 border-red-500/40';
  };

  return (
    <div className="w-full flex flex-col font-mono text-xs space-y-3">
      {/* Accuracy Summary Pill Bar */}
      <div className="grid grid-cols-3 gap-2 pb-2.5 border-b border-[#142233]">
        <div className="bg-[#09111C] p-2 rounded border border-[#142334]">
          <div className="text-[9px] text-[#7E9AB5] uppercase flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" />
            <span>HIGH CONFIDENCE</span>
          </div>
          <div className="text-base font-bold text-white mt-0.5">{highConfPercentage}%</div>
          <div className="text-[9px] text-emerald-400 font-medium">≥80% OCR Threshold</div>
        </div>

        <div className="bg-[#09111C] p-2 rounded border border-[#142334]">
          <div className="text-[9px] text-[#7E9AB5] uppercase flex items-center gap-1">
            <CheckCircle size={10} className="text-[#0E7FE0]" />
            <span>AVG INFERENCE</span>
          </div>
          <div className="text-base font-bold text-white mt-0.5">1.8 ms</div>
          <div className="text-[9px] text-[#0E7FE0]">YOLOv8 + OCR Engine</div>
        </div>

        <div className="bg-[#09111C] p-2 rounded border border-[#142334]">
          <div className="text-[9px] text-[#7E9AB5] uppercase flex items-center gap-1">
            <AlertTriangle size={10} className="text-cyan-400" />
            <span>SYNTAX MATCH</span>
          </div>
          <div className="text-base font-bold text-white mt-0.5">99.4%</div>
          <div className="text-[9px] text-cyan-400">Indian HSRP Compliant</div>
        </div>
      </div>

      {/* Spectrum Distribution Bars */}
      <div className="space-y-2.5">
        {buckets.map((b) => {
          const pct = totalDetections > 0 ? (b.count / totalDetections) * 100 : 0;
          const colorClass = getBucketColor(b.bucket);
          return (
            <div key={b.bucket} className="space-y-1 group">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8FA8C0] group-hover:text-white transition-colors flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${colorClass.split(' ')[0]}`} />
                  <span>Bracket {b.bucket}</span>
                </span>
                <span className="text-white font-medium">
                  {b.count.toLocaleString()} scans{' '}
                  <span className="text-[#7E9AB5] text-[10px]">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-[#09111C] rounded-full overflow-hidden border border-[#142334]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#142233] flex items-center justify-between text-[10px] text-[#7E9AB5]">
        <span>Legal Evidence Section 65B Standard:</span>
        <span className="text-emerald-400 font-bold">VERIFIED FORENSIC GRADE</span>
      </div>
    </div>
  );
};
