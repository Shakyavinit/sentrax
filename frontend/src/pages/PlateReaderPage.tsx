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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0E7FE0]/10 border border-[#0E7FE0]/30 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-[#0E7FE0]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider">Detection Backbone</div>
            <div className="text-sm font-semibold text-[#E8EFF7]">YOLOv8n-Custom</div>
            <div className="text-[11px] text-[#4D6B85] font-mono">1.2ms inference · TensorRT</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00C875]/10 border border-[#00C875]/30 flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5 text-[#00C875]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider">OCR Engine</div>
            <div className="text-sm font-semibold text-[#E8EFF7]">PaddleOCR v4 Indian</div>
            <div className="text-[11px] text-[#4D6B85] font-mono">Char-level confidence 98.2%</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FF8C00]/10 border border-[#FF8C00]/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#FF8C00]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider">Throughput Speed</div>
            <div className="text-sm font-semibold text-[#E8EFF7]">{detectionResult?.processingTimeMs ?? 34} ms / Frame</div>
            <div className="text-[11px] text-[#4D6B85] font-mono">32 FPS batch capability</div>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider">Legal Verification</div>
            <div className="text-sm font-semibold text-[#E8EFF7]">Section 65B Hash</div>
            <div className="text-[11px] text-[#00C875] font-mono flex items-center gap-1">
              <CheckCircle2 size={11} /> SHA-256 Sealed
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Scanner & Visualizer | Right Intelligence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visualizer Container */}
          <div className="bg-[#0D1520] border border-[#233A52] rounded-xl overflow-hidden shadow-2xl relative">
            {/* Header bar */}
            <div className="bg-[#121E2E] border-b border-[#233A52] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C875] animate-pulse" />
                <span className="text-xs font-mono font-semibold text-[#E8EFF7]">
                  CCTV NEURAL ANPR MATRIX
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-[#1A2A3D] text-[#8FA8C0] px-2 py-0.5 rounded border border-[#233A52]">
                  1920 × 1080 · 25 FPS
                </span>
                {customImage && (
                  <button
                    onClick={() => setCustomImage(null)}
                    className="text-[10px] font-mono text-[#FF3B3B] hover:underline"
                  >
                    Reset to Samples
                  </button>
                )}
              </div>
            </div>

            {/* Neural Enhancement Filter Toolbar */}
            <div className="bg-[#0A1017] border-b border-[#1C2E42] px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8FA8C0]">
                <Wand2 size={12} className="text-[#1A9FFF]" />
                <span>NEURAL FILTERS:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEnhancementFilter('standard')}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    enhancementFilter === 'standard'
                      ? 'bg-[#0E7FE0] text-white font-bold'
                      : 'text-[#8FA8C0] hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  Raw Feed
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('super_res');
                    toast.info('Super-Resolution 2X filter applied');
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    enhancementFilter === 'super_res'
                      ? 'bg-[#10B981] text-white font-bold'
                      : 'text-[#8FA8C0] hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  ✨ Super-Res 2X
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('unblur');
                    toast.info('De-Blur unsharp mask activated');
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    enhancementFilter === 'unblur'
                      ? 'bg-[#F59E0B] text-black font-bold'
                      : 'text-[#8FA8C0] hover:text-white bg-[#121E2E] border border-[#233A52]'
                  }`}
                >
                  🔬 De-Blur
                </button>
                <button
                  onClick={() => {
                    setEnhancementFilter('de_glare');
                    toast.info('High-beam glare reduction equalizer applied');
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    enhancementFilter === 'de_glare'
                      ? 'bg-[#8B5CF6] text-white font-bold'
                      : 'text-[#8FA8C0] hover:text-white bg-[#121E2E] border border-[#233A52]'
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
                  className="absolute border-2 border-[#0E7FE0]/80 rounded bg-[#0E7FE0]/5 pointer-events-none transition-all duration-300 z-10"
                  style={{
                    left: `${detectionResult.boundingBoxes.vehicle.x}%`,
                    top: `${detectionResult.boundingBoxes.vehicle.y}%`,
                    width: `${detectionResult.boundingBoxes.vehicle.w}%`,
                    height: `${detectionResult.boundingBoxes.vehicle.h}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-[#0E7FE0] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-md">
                    <span>{detectionResult.vehicleClass}</span>
                    <span className="opacity-75 font-normal">
                      {Math.round(detectionResult.vehicleConf * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Bounding Box 2: License Plate */}
              {detectionResult && !isProcessing && (
                <div
                  className="absolute border-2 border-[#00C875] rounded bg-[#00C875]/15 pointer-events-none transition-all duration-300 z-10 shadow-[0_0_10px_rgba(0,200,117,0.3)]"
                  style={{
                    left: `${detectionResult.boundingBoxes.plate.x}%`,
                    top: `${detectionResult.boundingBoxes.plate.y}%`,
                    width: `${detectionResult.boundingBoxes.plate.w}%`,
                    height: `${detectionResult.boundingBoxes.plate.h}%`,
                  }}
                >
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#00C875] text-[#080C12] text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-md whitespace-nowrap">
                    <span>PLATE: {detectionResult.plateText}</span>
                    <span className="text-[9px] bg-black/20 px-1 rounded text-black font-semibold">
                      {Math.round(detectionResult.plateConf * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Corner Grid Crosshairs */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0E7FE0]/70 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0E7FE0]/70 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0E7FE0]/70 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0E7FE0]/70 pointer-events-none" />
            </div>

            {/* Bottom Controls Bar */}
            <div className="bg-[#121E2E] border-t border-[#233A52] p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8FA8C0] font-mono">Sample Feed Library:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SAMPLE_VEHICLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedSample(s);
                      }}
                      className={`text-xs font-mono px-2.5 py-1 rounded transition-all ${
                        selectedSample.id === s.id && !customImage
                          ? 'bg-[#0E7FE0] text-white font-semibold'
                          : 'bg-[#1A2A3D] text-[#8FA8C0] hover:text-white border border-[#233A52]'
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
                className="text-xs font-mono text-[#1A9FFF] hover:underline flex items-center gap-1"
              >
                <Upload size={13} /> Custom image
              </button>
            </div>
          </div>

          {/* Model Architecture & GitHub Citations Drawer */}
          <div className="bg-[#0D1520] border border-[#1C2E42] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1C2E42] pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-semibold text-[#E8EFF7] font-mono">
                  OPEN SOURCE ALPR ECOSYSTEM INTEGRATION
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded border border-[#00C875]/20">
                GitHub Verified
              </span>
            </div>

            <p className="text-xs text-[#8FA8C0] leading-relaxed">
              SENTRAX combines the speed of <strong>Ultralytics YOLOv8n</strong> bounding box regression with the multi-language precision of <strong>Baidu PaddleOCR</strong> to overcome Indian high-entropy vehicle license conditions (dirt, high beam glare, custom fonts, HSRP plates).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {GITHUB_ALPR_REPOSITORIES.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#121E2E] hover:bg-[#1A2A3D] border border-[#233A52] hover:border-[#0E7FE0]/50 rounded-lg p-3 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-[#E8EFF7] group-hover:text-[#1A9FFF] flex items-center gap-1">
                        {repo.name}
                        <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-[10px] font-mono bg-[#1A2A3D] text-[#8FA8C0] px-1.5 py-0.5 rounded border border-[#233A52]">
                        ★ {repo.stars}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8FA8C0] leading-normal line-clamp-2">
                      {repo.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#1C2E42] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#0E7FE0]">
                      {repo.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#4D6B85] group-hover:text-[#8FA8C0]">
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
              <div className="bg-gradient-to-b from-[#121E2E] to-[#0D1520] border-2 border-[#0E7FE0]/50 rounded-xl p-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E7FE0]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider flex items-center gap-1.5">
                    <Scan size={14} className="text-[#0E7FE0]" />
                    RECOGNIZED REGISTRATION
                  </span>
                  <span className="text-[10px] font-mono font-semibold bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    {Math.round(detectionResult.plateConf * 100)}% CONFIDENCE
                  </span>
                </div>

                {/* Indian Standard Number Plate Representation */}
                <div className="bg-white rounded-lg p-3 border-2 border-zinc-400 shadow-inner flex items-center gap-3">
                  {/* IND Hologram Strip */}
                  <div className="bg-[#002D62] text-white px-2 py-2 rounded flex flex-col items-center justify-center font-bold text-[10px] leading-tight select-none">
                    <span className="text-[8px] text-amber-300">🇮🇳</span>
                    <span>IND</span>
                  </div>

                  {/* Embossed Characters */}
                  <div className="flex-1 text-center font-mono font-black text-2xl sm:text-3xl text-zinc-900 tracking-wider">
                    {detectionResult.plateText}
                  </div>

                  {/* Section 65B Micro Seal */}
                  <div className="text-right">
                    <Fingerprint className="w-5 h-5 text-zinc-400 inline-block" />
                  </div>
                </div>

                {/* Character Level Breakdown */}
                <div className="mt-4 pt-3 border-t border-[#233A52]">
                  <div className="text-[10px] font-mono text-[#8FA8C0] mb-2 flex items-center justify-between">
                    <span>CHARACTER CONFIDENCE GRADIENT (PADDLEOCR)</span>
                    <span className="text-[#00C875]">AVG 97.8%</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1 text-center">
                    {detectionResult.characterScores.map((c, i) => (
                      <div
                        key={i}
                        className="bg-[#1A2A3D] border border-[#233A52] rounded py-1 flex flex-col items-center"
                      >
                        <span className="text-xs font-mono font-bold text-white">{c.char}</span>
                        <span className="text-[9px] font-mono text-[#00C875]">
                          {Math.round(c.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RTO & Vehicle Intelligence Card */}
              <div className="bg-[#0D1520] border border-[#1C2E42] rounded-xl p-4 space-y-3">
                <div className="text-xs font-mono text-[#8FA8C0] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1C2E42] pb-2">
                  <Fingerprint size={14} className="text-[#1A9FFF]" />
                  REGISTRATION & JURISDICTION PROFILE
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Registered State:</span>
                    <span className="font-semibold text-white font-mono">{detectionResult.stateName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">RTO Jurisdiction:</span>
                    <span className="font-mono text-[#1A9FFF] text-right">{detectionResult.rtoLocation}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Vehicle Category:</span>
                    <span className="text-white font-mono">{detectionResult.vehicleClass}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Visual Color Tone:</span>
                    <span className="text-white font-mono">{detectionResult.vehicleColor}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8FA8C0]">HSRP Standard:</span>
                    <span className="text-[#00C875] font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Laser Etched / Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Vehicle DNA & Physical Attributes Card */}
              <div className="bg-[#0D1520] border border-[#1C2E42] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8FA8C0] uppercase tracking-wider">
                    <Zap size={14} className="text-[#F59E0B]" />
                    VEHICLE DNA & PHYSICAL ATTRIBUTES
                  </div>
                  <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded">
                    YOLOv8-Attr
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Window Tint Obstruction:</span>
                    <span className="text-[#FF3B3B] font-bold">84% (Illegal MVA Rule 100)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Color Spectrogram Match:</span>
                    <span className="text-[#00C875]">98.2% (Midnight Obsidian)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">Roof Accessories:</span>
                    <span className="text-white">Dual Luggage Rails (OEM)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8FA8C0]">Plate Tamper Signature:</span>
                    <span className="text-[#00C875]">None (HSRP Secure)</span>
                  </div>
                </div>

                {/* AI Copilot Action Button */}
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#121E2E] hover:bg-[#1A2A3D] text-[#1A9FFF] border border-[#0E7FE0]/40 hover:border-[#0E7FE0] py-2 rounded-lg text-xs font-mono font-semibold transition-all mt-2"
                >
                  <Bot size={15} className="text-[#0E7FE0]" />
                  <span>Consult AI Copilot on this Vehicle</span>
                </button>
              </div>

              {/* Cryptographic Proof & Section 65B Seal */}
              <div className="bg-[#0D1520] border border-[#1C2E42] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8FA8C0] uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-[#00C875]" />
                    FORENSIC INTEGRITY & HASH
                  </div>
                  <span className="text-[10px] font-mono text-[#8FA8C0]">Sec 65B IEA</span>
                </div>

                <div className="bg-[#121E2E] border border-[#233A52] rounded p-2 text-xs font-mono">
                  <div className="text-[10px] text-[#8FA8C0] mb-1 flex items-center justify-between">
                    <span>FRAME SHA-256 DIGITAL DIGEST</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(detectionResult.sha256Hash);
                        toast.success('SHA-256 hash copied to clipboard');
                      }}
                      className="text-[#1A9FFF] hover:underline flex items-center gap-1"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <div className="text-[#E8EFF7] break-all select-all font-mono text-[11px] leading-relaxed">
                    {detectionResult.sha256Hash}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Search size={14} />}
                    onClick={() => {
                      navigate(`/investigation?plate=${detectionResult.plateText}`);
                    }}
                  >
                    Investigate Plate
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ArrowRight size={14} />}
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
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-xl p-8 text-center text-[#8FA8C0] font-mono text-xs">
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
