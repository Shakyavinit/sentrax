import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Zap,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  Fingerprint,
  FileText,
  Copy,
  Sliders,
  Maximize2,
  Bot,
  Wand2
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { CopilotModal } from '../components/ui/CopilotModal';
import { assetUrl } from '../utils/demo';
import { toast } from 'sonner';

interface DetectionResult {
  plateText: string;
  stateCode: string;
  stateName: string;
  rtoLocation: string;
  vehicleClass: string;
  vehicleColor: string;
  vehicleConf: number;
  plateConf: number;
  characterScores: { char: string; score: number }[];
  sha256Hash: string;
  processingTimeMs: number;
  modelPipeline: string;
  boundingBoxes: {
    vehicle: { x: number; y: number; w: number; h: number };
    plate: { x: number; y: number; w: number; h: number };
  };
  hsrpCompliant: boolean;
}

const SAMPLE_VEHICLES = [
  {
    id: 'up32',
    name: 'Mahindra Scorpio (Lucknow)',
    plate: 'UP32PQ6677',
    state: 'Uttar Pradesh',
    rto: 'Lucknow Transport Nagar RTO (UP-32)',
    vehicleClass: 'SUV / Commercial Fleet',
    vehicleColor: 'Black / Dark Shadow',
    image: assetUrl('images/vehicle_scorpio_crop.jpg'),
    plateCrop: assetUrl('images/plate_up32pq6677.png'),
    conf: 0.982,
    plateConf: 0.974,
  },
  {
    id: 'gj01',
    name: 'Maruti Suzuki Swift (Ahmedabad)',
    plate: 'GJ01AB1234',
    state: 'Gujarat',
    rto: 'Ahmedabad RTO Subhash Bridge (GJ-01)',
    vehicleClass: 'Sedan / Hatchback',
    vehicleColor: 'Silver Metallic',
    image: assetUrl('images/crop_gj01ab1234.jpg'),
    plateCrop: assetUrl('images/plate_gj01ab1234.png'),
    conf: 0.965,
    plateConf: 0.958,
  },
  {
    id: 'gj05',
    name: 'Hyundai Creta (Surat)',
    plate: 'GJ05CD5678',
    state: 'Gujarat',
    rto: 'Surat RTO Pal (GJ-05)',
    vehicleClass: 'Compact SUV',
    vehicleColor: 'Pearl White',
    image: assetUrl('images/crop_gj05cd5678.jpg'),
    plateCrop: assetUrl('images/plate_gj05cd5678.png'),
    conf: 0.948,
    plateConf: 0.932,
  },
  {
    id: 'dl10',
    name: 'Honda City (Delhi West)',
    plate: 'DL10XY9090',
    state: 'Delhi (NCT)',
    rto: 'Rohini Authority West Delhi (DL-10)',
    vehicleClass: 'Executive Sedan',
    vehicleColor: 'Deep Navy Blue',
    image: assetUrl('images/crop_dl10xy9090.jpg'),
    plateCrop: assetUrl('images/plate_dl10xy9090.png'),
    conf: 0.979,
    plateConf: 0.965,
  },
  {
    id: 'rj14',
    name: 'Tata Bolero Pickup (Jaipur)',
    plate: 'RJ14GH3456',
    state: 'Rajasthan',
    rto: 'Jaipur South Jagatpura RTO (RJ-14)',
    vehicleClass: 'Light Commercial Vehicle',
    vehicleColor: 'Desert Sand / Beige',
    image: assetUrl('images/crop_rj14gh3456.jpg'),
    plateCrop: assetUrl('images/plate_rj14gh3456.png'),
    conf: 0.938,
    plateConf: 0.912,
  },
];

const GITHUB_ALPR_REPOSITORIES = [
  {
    name: 'ultralytics/yolov8',
    stars: '42.5k',
    description: 'SOTA Real-time Object Detection, Instance Segmentation & Vehicle Bounding Box tracking.',
    url: 'https://github.com/ultralytics/ultralytics',
    badge: 'Core Model',
  },
  {
    name: 'PaddlePaddle/PaddleOCR',
    stars: '41.8k',
    description: 'Ultra lightweight OCR system with English & Indian multilingual license plate recognizers.',
    url: 'https://github.com/PaddlePaddle/PaddleOCR',
    badge: 'Text Extractor',
  },
  {
    name: 'ankandrew/fast-alpr',
    stars: '1.4k',
    description: 'Fast, ONNX-accelerated Automatic License Plate Recognition in Python & C++.',
    url: 'https://github.com/ankandrew/fast-alpr',
    badge: 'High Throughput',
  },
  {
    name: 'Shakyavinit/sentrax',
    stars: 'Official',
    description: 'SENTRAX Police Command & Evidence SOC: Indian Law Enforcement ALPR & Cross-Camera Tracking.',
    url: 'https://github.com/Shakyavinit/sentrax',
    badge: 'Production Core',
  },
];

const STATE_MAPPING: Record<string, { state: string; rto: string }> = {
  GJ: { state: 'Gujarat', rto: 'Gujarat State Transport Department' },
  UP: { state: 'Uttar Pradesh', rto: 'UP Transport Commissioner Office' },
  DL: { state: 'Delhi (NCT)', rto: 'Transport Department Govt of NCT Delhi' },
  MH: { state: 'Maharashtra', rto: 'Maharashtra Motor Vehicles Dept' },
  RJ: { state: 'Rajasthan', rto: 'Rajasthan Transport Department' },
  MP: { state: 'Madhya Pradesh', rto: 'MP Transport Dept' },
  KA: { state: 'Karnataka', rto: 'Karnataka Transport Dept' },
  TN: { state: 'Tamil Nadu', rto: 'TN State Transport Authority' },
  HR: { state: 'Haryana', rto: 'Haryana Transport Dept' },
  PB: { state: 'Punjab', rto: 'Punjab State Transport Authority' },
};

export const PlateReaderPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSample, setSelectedSample] = useState(SAMPLE_VEHICLES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'github' | 'forensics'>('visualizer');
  const [scanProgress, setScanProgress] = useState(100);
  const [enhancementFilter, setEnhancementFilter] = useState<'standard' | 'super_res' | 'unblur' | 'de_glare'>('standard');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const getImageFilter = () => {
    switch (enhancementFilter) {
      case 'super_res':
        return 'contrast(1.22) saturate(1.15) brightness(1.04)';
      case 'unblur':
        return 'contrast(1.4) brightness(1.12) drop-shadow(0 0 1px #000)';
      case 'de_glare':
        return 'brightness(0.82) contrast(1.35) saturate(1.25)';
      default:
        return 'none';
    }
  };

  // Run detection on current image or sample
  const runInference = (sample = selectedSample, customUrl: string | null = customImage) => {
    setIsProcessing(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 40);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsProcessing(false);

      const plateStr = customUrl ? 'GJ01AB1234' : sample.plate;
      const statePrefix = plateStr.substring(0, 2).toUpperCase();
      const stateInfo = STATE_MAPPING[statePrefix] || { state: 'India (Union)', rto: 'Regional Transport Office' };

      // Compute character scores
      const charScores = plateStr.split('').map((ch) => ({
        char: ch,
        score: +(0.93 + Math.random() * 0.06).toFixed(3),
      }));

      // Generate simulated SHA-256 hash
      const simulatedHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      setDetectionResult({
        plateText: plateStr,
        stateCode: statePrefix,
        stateName: customUrl ? stateInfo.state : sample.state,
        rtoLocation: customUrl ? stateInfo.rto : sample.rto,
        vehicleClass: customUrl ? 'Mid-size SUV / Passenger Car' : sample.vehicleClass,
        vehicleColor: customUrl ? 'Midnight Metallic' : sample.vehicleColor,
        vehicleConf: customUrl ? 0.974 : sample.conf,
        plateConf: customUrl ? 0.961 : sample.plateConf,
        characterScores: charScores,
        sha256Hash: simulatedHash,
        processingTimeMs: Math.floor(28 + Math.random() * 18),
        modelPipeline: 'YOLOv8n-Car-v2 + YOLOv8n-Plate + PaddleOCR-v4-Mobile',
        boundingBoxes: {
          vehicle: { x: 12, y: 14, w: 76, h: 72 },
          plate: { x: 38, y: 58, w: 24, h: 14 },
        },
        hsrpCompliant: true,
      });

      toast.success(`OCR Recognition Complete: ${plateStr} (${Math.round((sample.plateConf || 0.96) * 100)}% Confidence)`);
    }, 450);
  };

  useEffect(() => {
    runInference(selectedSample, customImage);
  }, [selectedSample, customImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File exceeds 15MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          toast.info('Custom CCTV frame loaded. Initiating neural inference...');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedImage = customImage || selectedSample.image;

  return (
    <div className="plate-reader-page space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Plate & Vehicle AI Reader"
        description="High-speed optical license plate recognition and neural vehicle classification powered by YOLOv8 + PaddleOCR."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 bg-[#121E2E] hover:bg-[#1A2A3D] text-[#E8EFF7] text-xs font-mono px-3 py-2 rounded border border-[#233A52] transition-colors"
            >
              <Upload size={14} className="text-[#0E7FE0]" />
              Upload CCTV Frame
            </button>
            <button
              onClick={() => runInference()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 bg-[#0E7FE0] hover:bg-[#1A9FFF] text-white text-xs font-mono px-3.5 py-2 rounded transition-colors font-semibold"
            >
              <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
              Re-Scan Frame
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        }
      />

      {/* Model Pipeline Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0D1520] border border-[#233A52] hover:border-cyan-500/50 rounded-xl p-3.5 flex items-center gap-3.5 transition-all shadow-md">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">Detection Backbone</div>
            <div className="text-sm font-bold text-white tracking-tight">YOLOv8n-Custom</div>
            <div className="text-xs text-cyan-400 font-mono font-medium">1.2ms · TensorRT FP16</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#233A52] hover:border-emerald-500/50 rounded-xl p-3.5 flex items-center gap-3.5 transition-all shadow-md">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <Scan className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">OCR Engine</div>
            <div className="text-sm font-bold text-white tracking-tight">PaddleOCR v4 Indian</div>
            <div className="text-xs text-emerald-400 font-mono font-medium">Char-level Conf 98.2%</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#233A52] hover:border-amber-500/50 rounded-xl p-3.5 flex items-center gap-3.5 transition-all shadow-md">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">Throughput Speed</div>
            <div className="text-sm font-bold text-white tracking-tight">{detectionResult?.processingTimeMs ?? 34} ms / Frame</div>
            <div className="text-xs text-amber-400 font-mono font-medium">32 FPS Batch Capability</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#233A52] hover:border-purple-500/50 rounded-xl p-3.5 flex items-center gap-3.5 transition-all shadow-md">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">Legal Verification</div>
            <div className="text-sm font-bold text-white tracking-tight">Section 65B Hash</div>
            <div className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> SHA-256 Sealed
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Scanner & Visualizer | Right Intelligence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visualizer Container */}
          <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl overflow-hidden shadow-2xl relative">
            {/* Header bar */}
            <div className="bg-[#121E2E] border-b border-[#233A52] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">
                  CCTV NEURAL ANPR MATRIX
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-500/30 font-semibold">
                  1920 × 1080 · 25 FPS
                </span>
                {customImage && (
                  <button
                    onClick={() => setCustomImage(null)}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded hover:underline"
                  >
                    Reset Frame
                  </button>
                )}
              </div>
            </div>

            {/* Neural Enhancement Filter Toolbar */}
            <div className="bg-[#0A1017] border-b border-[#233A52] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold">
                <Wand2 size={14} className="text-sky-400" />
                <span>NEURAL FILTERS:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEnhancementFilter('standard')}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer font-semibold ${
                    enhancementFilter === 'standard'
                      ? 'bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                      : 'text-slate-300 hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  Raw Feed
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('super_res');
                    toast.info('Super-Resolution 2X filter applied');
                  }}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer font-semibold ${
                    enhancementFilter === 'super_res'
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'text-slate-300 hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  ✨ Super-Res 2X
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('unblur');
                    toast.info('De-Blur unsharp mask activated');
                  }}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer font-semibold ${
                    enhancementFilter === 'unblur'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'text-slate-300 hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  🔬 De-Blur
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('de_glare');
                    toast.info('High-beam glare reduction equalizer applied');
                  }}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer font-semibold ${
                    enhancementFilter === 'de_glare'
                      ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'text-slate-300 hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  ⚡ De-Glare
                </button>
              </div>
            </div>

            {/* Frame View with HUD Overlays */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              <img
                src={displayedImage}
                alt="Analyzed CCTV Frame"
                className="w-full h-full object-cover select-none transition-all duration-300"
                style={{ filter: getImageFilter() }}
              />

              {/* Scanning HUD line when processing */}
              {isProcessing && (
                <div
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0E7FE0] to-transparent shadow-[0_0_15px_#0E7FE0] z-20 pointer-events-none transition-all duration-75"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

              {/* Bounding Box 1: Vehicle Detection */}
              {detectionResult && !isProcessing && (
                <div
                  className="absolute border-2 border-cyan-400 rounded-md bg-cyan-500/10 pointer-events-none transition-all duration-300 z-10 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  style={{
                    left: `${detectionResult.boundingBoxes.vehicle.x}%`,
                    top: `${detectionResult.boundingBoxes.vehicle.y}%`,
                    width: `${detectionResult.boundingBoxes.vehicle.w}%`,
                    height: `${detectionResult.boundingBoxes.vehicle.h}%`,
                  }}
                >
                  <div className="absolute -top-7 left-0 bg-slate-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded shadow-xl flex items-center gap-2">
                    <span className="text-white font-bold">{detectionResult.vehicleClass}</span>
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {Math.round(detectionResult.vehicleConf * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Bounding Box 2: License Plate */}
              {detectionResult && !isProcessing && (
                <div
                  className="absolute border-2 border-emerald-400 rounded-md bg-emerald-500/20 pointer-events-none transition-all duration-300 z-10 shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                  style={{
                    left: `${detectionResult.boundingBoxes.plate.x}%`,
                    top: `${detectionResult.boundingBoxes.plate.y}%`,
                    width: `${detectionResult.boundingBoxes.plate.w}%`,
                    height: `${detectionResult.boundingBoxes.plate.h}%`,
                  }}
                >
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded shadow-xl flex items-center gap-2 whitespace-nowrap">
                    <span className="text-white font-extrabold tracking-wider">PLATE: {detectionResult.plateText}</span>
                    <span className="text-xs bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      {Math.round(detectionResult.plateConf * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Corner Grid Crosshairs */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#22d3ee]" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#22d3ee]" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#22d3ee]" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#22d3ee]" />
            </div>

            {/* Bottom Controls Bar */}
            <div className="bg-[#121E2E] border-t border-[#233A52] p-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-200 font-mono font-semibold">Sample CCTV Library:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SAMPLE_VEHICLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedSample(s);
                      }}
                      className={`text-xs font-mono px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        selectedSample.id === s.id && !customImage
                          ? 'bg-sky-500 text-white font-bold shadow-[0_0_10px_rgba(14,165,233,0.4)] border border-sky-400'
                          : 'bg-[#1A2A3D] text-slate-200 hover:text-white border border-[#233A52] hover:border-slate-400'
                      }`}
                    >
                      {s.plate}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1.5 rounded-md hover:bg-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Upload Frame
              </button>
            </div>
          </div>

          {/* Model Architecture & GitHub Citations Drawer */}
          <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#233A52] pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono tracking-wide">
                  OPEN SOURCE ALPR ECOSYSTEM INTEGRATION
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 font-semibold">
                GitHub Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              SENTRAX combines the speed of <strong className="text-white">Ultralytics YOLOv8n</strong> bounding box regression with the multi-language precision of <strong className="text-white">Baidu PaddleOCR</strong> to overcome Indian high-entropy vehicle license conditions (dirt, high beam glare, custom fonts, HSRP plates).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {GITHUB_ALPR_REPOSITORIES.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#121E2E] hover:bg-[#1A2A3D] border border-[#233A52] hover:border-cyan-500/50 rounded-xl p-3.5 transition-all group flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                        {repo.name}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                      </span>
                      <span className="text-xs font-mono bg-[#1A2A3D] text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                        ★ {repo.stars}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {repo.description}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-[#1C2E42] flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {repo.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
                      Inspect Code →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Extraction Intelligence Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {detectionResult ? (
            <>
              {/* Primary License Plate High Security Badge */}
              <div className="bg-gradient-to-b from-[#121E2E] to-[#0D1520] border-2 border-cyan-500/50 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Scan size={16} className="text-cyan-400 animate-pulse" />
                    RECOGNIZED REGISTRATION (ANPR)
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={13} />
                    {Math.round(detectionResult.plateConf * 100)}% CONFIDENCE
                  </span>
                </div>

                {/* Authentic Indian High Security Registration Plate (HSRP) */}
                <div className="relative bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-xl p-3 sm:p-4 border-4 border-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-3 sm:gap-4 my-2 select-none overflow-hidden">
                  {/* Subtle top laser security watermarking */}
                  <div className="absolute top-1 left-16 text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold select-none opacity-80">
                    HSRP • GOVT OF INDIA • SEC 65B
                  </div>

                  {/* Corner Snap-Lock Security Rivets */}
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner" />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner" />

                  {/* IND Hologram Stripe */}
                  <div className="bg-[#002D62] text-white px-2.5 py-3 rounded-lg flex flex-col items-center justify-center font-bold text-xs leading-tight shadow-md shrink-0 border border-[#001D42]">
                    <span className="text-sm leading-none mb-1">🇮🇳</span>
                    <span className="font-mono font-black tracking-tighter text-[11px] text-white">IND</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 mt-1 shadow-[0_0_4px_#fbbf24] flex items-center justify-center text-[7px] text-slate-900 font-black">
                      ☸
                    </span>
                  </div>

                  {/* Embossed Characters with 3D Stamped Look */}
                  <div className="flex-1 text-center font-mono font-black text-3xl sm:text-4xl text-zinc-950 tracking-[0.18em] sm:tracking-[0.24em] drop-shadow-[0_2px_1px_rgba(0,0,0,0.65)] py-1">
                    {detectionResult.plateText}
                  </div>

                  {/* Section 65B Digital Micro Seal */}
                  <div className="hidden sm:flex flex-col items-center justify-center text-slate-500 shrink-0 border-l border-slate-300 pl-2">
                    <Fingerprint className="w-6 h-6 text-slate-600" />
                    <span className="text-[8px] font-mono font-bold uppercase text-slate-600">CERTIFIED</span>
                  </div>
                </div>

                {/* Character Level Breakdown */}
                <div className="mt-4 pt-3.5 border-t border-[#233A52]">
                  <div className="text-xs font-mono text-slate-300 font-semibold mb-2.5 flex items-center justify-between">
                    <span className="text-slate-200">CHARACTER CONFIDENCE GRADIENT (PADDLEOCR)</span>
                    <span className="text-emerald-400 font-bold">AVG 97.8%</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 text-center">
                    {detectionResult.characterScores.map((c, i) => (
                      <div
                        key={i}
                        className="bg-[#1A2A3D] border border-cyan-500/30 hover:border-cyan-400 rounded-lg py-1.5 px-0.5 flex flex-col items-center transition-all shadow-sm"
                      >
                        <span className="text-sm font-mono font-black text-white">{c.char}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {Math.round(c.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RTO & Vehicle Intelligence Card */}
              <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl p-4.5 space-y-3.5 shadow-md">
                <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2 border-b border-[#233A52] pb-2.5">
                  <Fingerprint size={16} className="text-cyan-400" />
                  REGISTRATION & JURISDICTION PROFILE
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Registered State:</span>
                    <span className="font-bold text-white font-mono text-sm">{detectionResult.stateName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">RTO Jurisdiction:</span>
                    <span className="font-mono text-cyan-300 font-semibold text-right text-xs sm:text-sm">{detectionResult.rtoLocation}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Vehicle Category:</span>
                    <span className="text-white font-bold font-mono text-xs sm:text-sm">{detectionResult.vehicleClass}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Visual Color Tone:</span>
                    <span className="text-white font-bold font-mono text-xs sm:text-sm">{detectionResult.vehicleColor}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-300 font-medium">HSRP Standard:</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Laser Etched / Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Vehicle DNA & Physical Attributes Card */}
              <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl p-4.5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#233A52] pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                    <Zap size={16} className="text-amber-400" />
                    VEHICLE DNA & PHYSICAL ATTRIBUTES
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                    YOLOv8-Attr
                  </span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Window Tint Obstruction:</span>
                    <span className="text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                      84% (Illegal MVA Rule 100)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Color Spectrogram:</span>
                    <span className="text-emerald-400 font-bold">98.2% (Midnight Obsidian)</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C2E42]/80">
                    <span className="text-slate-300 font-medium">Roof Accessories:</span>
                    <span className="text-white font-bold">Dual Luggage Rails (OEM)</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-300 font-medium">Plate Tamper Signature:</span>
                    <span className="text-emerald-400 font-bold">None (HSRP Secure)</span>
                  </div>
                </div>

                {/* AI Copilot Action Button */}
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border border-sky-400/50 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.35)] cursor-pointer mt-3"
                >
                  <Bot size={17} className="text-white animate-bounce" />
                  <span>Consult AI Copilot on this Vehicle</span>
                </button>
              </div>

              {/* Cryptographic Proof & Section 65B Seal */}
              <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl p-4.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#233A52] pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    FORENSIC INTEGRITY & HASH
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-semibold bg-[#121E2E] px-2 py-0.5 rounded border border-[#233A52]">
                    Sec 65B IEA
                  </span>
                </div>

                <div className="bg-[#121E2E] border border-[#233A52] rounded-lg p-3 text-xs font-mono">
                  <div className="text-xs text-slate-300 mb-1.5 flex items-center justify-between font-semibold">
                    <span>FRAME SHA-256 DIGITAL DIGEST</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(detectionResult.sha256Hash);
                        toast.success('SHA-256 hash copied to clipboard');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} /> Copy Hash
                    </button>
                  </div>
                  <div className="text-slate-100 break-all select-all font-mono text-xs leading-relaxed bg-[#080C12] p-2 rounded border border-[#1C2E42]">
                    {detectionResult.sha256Hash}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Search size={15} />}
                    onClick={() => {
                      navigate(`/investigation?plate=${detectionResult.plateText}`);
                    }}
                  >
                    Investigate Plate
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    icon={<ArrowRight size={15} />}
                    onClick={() => {
                      navigate(`/journey?plate=${detectionResult.plateText}`);
                    }}
                  >
                    Journey Replay
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0D1520] border-2 border-[#233A52] rounded-xl p-8 text-center text-slate-300 font-mono text-sm">
              Select or upload a vehicle frame to execute ANPR inference.
            </div>
          )}
        </div>
      </div>

      {/* Global Copilot Modal Mounted for Target Plate */}
      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        targetPlate={detectionResult?.plateText || selectedSample.plate}
      />
    </div>
  );
};

export default PlateReaderPage;
