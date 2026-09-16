import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { vehiclesApi } from '../api/vehicles';
import { evidenceApi } from '../api/evidence';
import { VehicleDossier, VehicleJourney as JourneyType, Evidence } from '../types';
import { EvidenceExportModal } from '../components/evidence/EvidenceExportModal';
import {
  ArrowLeft,
  Share2,
  Printer,
  FileText,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Car,
  History,
  Camera,
  MapPin,
  Route,
  Zap,
  Radio,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Compass,
  CheckCircle2,
  Calendar,
  Phone,
  Building,
  User,
  Activity,
  Plus,
  Siren,
  Sliders,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Custom pulsing leaflet icon for tactical target
const createTacticalPinIcon = () => {
  return L.divIcon({
    className: 'custom-tactical-pin',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(255, 59, 59, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #FF3B3B; border: 2px solid #FFFFFF; box-shadow: 0 0 10px #FF3B3B;"></div>
        <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const VehicleDetailsPage: React.FC = () => {
  const { plate } = useParams<{ plate?: string }>();
  const navigate = useNavigate();

  const cleanPlate = (plate || 'GJ01AB1234').replace(/\s+/g, '').toUpperCase();
  const [dossier, setDossier] = useState<VehicleDossier | null>(null);
  const [journey, setJourney] = useState<JourneyType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sightings' | 'owner' | 'specs' | 'cases' | 'evidence' | 'traffic' | 'notes'
  >('overview');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<Evidence | null>(null);
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(true);

  // Evidence frame carousel items
  const evidenceFrames = [
    {
      id: 'ev-1',
      title: 'GNLU Main Gate (CAM08)',
      timestamp: '2026-03-12 14:45:12 IST',
      speed: '42 km/h',
      conf: '98.6%',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      image: './images/evidence_gnlu_large.jpg',
      plate: cleanPlate,
      location: 'GNLU Main Gate, Gandhinagar'
    },
    {
      id: 'ev-2',
      title: 'Sabarmati Riverfront (CAM07)',
      timestamp: '2026-03-12 13:20:45 IST',
      speed: '58 km/h',
      conf: '97.2%',
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      image: './images/cam_sabarmati_thumb.jpg',
      plate: cleanPlate,
      location: 'Riverfront Promenade West'
    },
    {
      id: 'ev-3',
      title: 'GIFT City Road (CAM06)',
      timestamp: '2026-03-12 11:05:19 IST',
      speed: '64 km/h',
      conf: '99.1%',
      hash: '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
      image: './images/cam_gift_city_thumb.jpg',
      plate: cleanPlate,
      location: 'GIFT City Underpass Entry'
    },
    {
      id: 'ev-4',
      title: 'SG Highway Toll (CAM04)',
      timestamp: '2026-03-12 09:15:02 IST',
      speed: '35 km/h',
      conf: '96.4%',
      hash: 'c249a50ae3576395e9ce0d7fbe8b5561a0f8bf36c99c855a02e6d9b0ef76451e',
      image: './images/cam_sg_highway_thumb.jpg',
      plate: cleanPlate,
      location: 'SG Highway Southbound Plaza'
    },
  ];

  // Fetch dossier and journey
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      vehiclesApi.getDossier(cleanPlate).catch(() => null),
      vehiclesApi.getJourney(cleanPlate).catch(() => null),
    ])
      .then(([dossierData, journeyData]) => {
        if (dossierData) setDossier(dossierData);
        if (journeyData) setJourney(journeyData);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to fetch vehicle intelligence record');
        setIsLoading(false);
      });
  }, [cleanPlate]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDispatchAlert = () => {
    toast.success(`🚨 BOLO EMERGENCY BROADCAST ISSUED!`, {
      description: `Intercept vector dispatched to 4 nearby PCR units for ${cleanPlate}.`,
      duration: 6000,
    });
  };

  const handleAddToWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    toast.info(
      isInWatchlist
        ? `Target ${cleanPlate} removed from active alert watchlist.`
        : `Target ${cleanPlate} added to Priority 1 Watchlist.`
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Investigation dossier link copied to clipboard.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Generating Section 65B Electronic Evidentiary Report...',
        success: 'Forensic PDF dossier downloaded with SHA-256 digital signature.',
        error: 'Error generating report.',
      }
    );
  };

  const handlePreserveEvidence = () => {
    const cur = evidenceFrames[activeEvidenceIndex];
    setSelectedEvidenceModal({
      id: cur.id,
      plate_text: cleanPlate,
      camera_name: cur.title,
      frame_path: cur.image,
      frame_hash: cur.hash,
      frame_ts: cur.timestamp,
      ai_confidence: parseFloat(cur.conf) / 100,
      exported: false,
    });
  };

  const isCritical = dossier?.intelligence.threat_level === 'CRITICAL' || true;

  return (
    <div className="space-y-4 text-white pb-12">
      {/* ─── 1. TOP BREADCRUMB & HEADER ACTIONS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C2E42]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/investigation"
            className="text-[#8FA8C0] hover:text-[#0E7FE0] transition-colors flex items-center gap-1"
          >
            Investigation
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#4D6B85]" />
          <span className="text-[#0E7FE0] font-semibold">Vehicle Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#4D6B85]" />
          <span className="bg-[#121E2E] text-[#8FA8C0] px-2 py-0.5 rounded border border-[#233A52]">
            {cleanPlate}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => navigate('/investigation')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleAddToWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
              isInWatchlist
                ? 'bg-[#FF8C00]/15 text-[#FF8C00] border-[#FF8C00]/40 hover:bg-[#FF8C00]/25'
                : 'bg-[#121E2E] text-[#8FA8C0] border-[#233A52] hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isInWatchlist ? 'In Watchlist' : '+ Add to Watchlist'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0E7FE0] hover:bg-[#118bf2] text-white text-xs font-semibold shadow-[0_2px_10px_rgba(14,127,224,0.3)] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ─── 2. HERO CARD ─── */}
      <div className="relative bg-gradient-to-r from-[#0A1017] via-[#0D1522] to-[#0A1017] border border-[#1F334D] rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Glowing Tactical Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3B3B] to-transparent"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left: Vehicle Image Preview */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start">
            <div className="relative group w-full max-w-[260px] h-[155px] rounded-lg overflow-hidden border border-[#233A52] bg-[#070B10] shadow-inner">
              <img
                src="./images/vehicle_scorpio_crop.jpg"
                alt="White Mahindra Scorpio-N"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white flex items-center gap-1">
                <Camera className="w-3 h-3 text-[#0E7FE0]" />
                <span>HD CCTV CROP</span>
              </div>

              <button
                onClick={() => setIsPhotoZoomOpen(true)}
                className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 hover:bg-[#0E7FE0] border border-white/20 text-white transition-colors cursor-pointer"
                title="Enlarge Image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center: Vehicle Identification & Tags */}
          <div className="lg:col-span-5 space-y-2.5">
            {/* Top row: Indian License Plate + Threat Badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Indian License Plate Pill */}
              <div className="flex items-center bg-white text-black font-mono font-black text-base px-3 py-1 rounded-[4px] border border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.5)] tracking-wider">
                <span className="bg-[#0E7FE0] text-white text-[9px] px-1 py-0.5 rounded-[2px] mr-1.5 font-bold">
                  IND
                </span>
                <span>{cleanPlate}</span>
              </div>

              <button
                onClick={() => handleCopy(cleanPlate, 'License Plate')}
                className="p-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors cursor-pointer"
                title="Copy Plate Number"
              >
                {copiedField === 'License Plate' ? (
                  <Check className="w-3.5 h-3.5 text-[#00C875]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Threat Match Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B3B]/15 border border-[#FF3B3B]/40 text-[#FF3B3B] font-mono text-xs font-bold shadow-[0_0_12px_rgba(255,59,59,0.3)]">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                <span>CRITICAL - WATCHLIST MATCH</span>
              </div>
            </div>

            {/* Vehicle Name & Make */}
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{dossier ? `${dossier.specs.make} ${dossier.specs.model} ${dossier.specs.variant || 'Z8L 4x4'}` : 'Mahindra & Mahindra Scorpio-N Z8L 4x4'}</span>
              </h1>
              <p className="text-xs font-mono text-[#8FA8C0] mt-0.5">
                SUV • Diesel • Everest White (Pearl) • 2024
              </p>
            </div>

            {/* Category Chips */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30 text-[11px] font-mono font-medium">
                Stolen Vehicle
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/30 text-[11px] font-mono font-medium">
                Kidnapping Case
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30 text-[11px] font-mono font-medium">
                Ahmedabad Zone
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1C2E42] text-[#8FA8C0] border border-[#2B4360] text-[11px] font-mono font-medium">
                +2 Tags
              </span>
            </div>
          </div>

          {/* Right: Telemetry & Intelligence KPIs */}
          <div className="lg:col-span-4 bg-[#080D14]/80 border border-[#1A2A3D] rounded-lg p-3.5 grid grid-cols-2 gap-3 text-xs font-mono">
            {/* Threat Level */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#8FA8C0] tracking-wider block">
                Threat Level
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF3B3B] text-white font-bold text-xs shadow-[0_0_8px_rgba(255,59,59,0.5)]">
                <AlertTriangle className="w-3 h-3" />
                <span>HIGH</span>
              </div>
            </div>

            {/* Total Sightings */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#8FA8C0] tracking-wider block">
                Total Sightings
              </span>
              <span className="text-base font-bold text-white tracking-wide">
                {journey?.total_sightings || 107}
              </span>
            </div>

            {/* First Seen */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#8FA8C0] tracking-wider block">
                First Seen
              </span>
              <span className="text-[#C5D5E6] font-medium">
                12 Jan 2024, 08:30
              </span>
            </div>

            {/* Last Seen */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#8FA8C0] tracking-wider block">
                Last Seen
              </span>
              <span className="text-[#00C875] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
                Today, 14:45 (3m ago)
              </span>
            </div>

            {/* Status Full Width */}
            <div className="col-span-2 pt-1 border-t border-[#1C2E42] flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#8FA8C0]">Target Status:</span>
              <span className="text-[11px] font-bold text-[#00C875] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875]" />
                Active Surveillance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. EIGHT NAVIGATION TABS ─── */}
      <div className="flex items-center gap-1 border-b border-[#1C2E42] overflow-x-auto scrollbar-none pt-1">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'sightings', label: `Sightings (${journey?.total_sightings || 107})` },
          { key: 'owner', label: 'Owner & Address' },
          { key: 'specs', label: 'Vehicle Specs' },
          { key: 'cases', label: 'Cases & FIRs' },
          { key: 'evidence', label: 'Photos & Evidence' },
          { key: 'traffic', label: 'Live Traffic' },
          { key: 'notes', label: 'Notes' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 font-mono text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'border-[#0E7FE0] text-[#0E7FE0] bg-[#0E7FE0]/10'
                : 'border-transparent text-[#8FA8C0] hover:text-[#C5D5E6] hover:bg-[#121E2E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 4. TAB CONTENTS ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* ─── TOP ROW: 3 TACTICAL CARDS ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Alert / Case Information */}
            <div className="bg-[#0D1520] border border-[#FF3B3B]/40 rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,59,59,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF3B3B]" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF3B3B]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Alert / Case Information
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/40 text-[10px] font-mono font-bold animate-pulse">
                    ACTIVE FIR
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">FIR Case Number:</span>
                    <span className="font-bold text-white text-sm">CR/2026/0418</span>
                    <span className="text-[#8FA8C0] text-[11px] ml-1.5">(Navrangpura P.S.)</span>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Sections Applied:</span>
                    <span className="text-[#FF8C00] font-semibold">
                      Sec 364A, 386, 120B IPC / BNS
                    </span>
                    <p className="text-[10px] text-[#8FA8C0] mt-0.5">
                      Kidnapping for Ransom, Extortion, Criminal Conspiracy
                    </p>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Warrant Status:</span>
                    <span className="px-2 py-0.5 rounded bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30 text-[10px] font-bold inline-block">
                      Non-Bailable Warrant Issued (NBW)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1C2E42]">
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Investigating Officer:</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        ACP Digvijay Singh Jadeja
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Reported:</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        10 Mar 2026, 19:40
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1C2E42]">
                <button
                  onClick={() => setActiveTab('cases')}
                  className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#FF3B3B] hover:text-white transition-colors cursor-pointer"
                >
                  <span>View Full Case Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Registered Owner */}
            <div className="bg-[#0D1520] border border-[#1C2E42] hover:border-[#00C875]/40 rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00C875]" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00C875]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Registered Owner
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Full Name:</span>
                    <span className="font-bold text-white text-sm">
                      {dossier?.owner.name || 'Shailesh Ramanlal Patel'}
                    </span>
                    <p className="text-[10px] text-[#8FA8C0]">
                      S/o Ramanlal K. Patel
                    </p>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Registered Address:</span>
                    <span className="text-[#C5D5E6] text-[11px] leading-relaxed block">
                      {dossier?.owner.address || 'B-402, Shivalik Heights, Science City Road, Sola, Ahmedabad - 380060'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1C2E42]">
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Mobile (VAHAN):</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        +91 98250 ••••• (Verified)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Aadhaar (UIDAI):</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        •••• •••• 4912 (Linked)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Ownership Classification:</span>
                    <span className="text-[#0E7FE0] font-medium text-[11px]">
                      1st Owner (Individual - Private Vehicle)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1C2E42]">
                <button
                  onClick={() => setActiveTab('owner')}
                  className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#00C875] hover:text-white transition-colors cursor-pointer"
                >
                  <span>View Owner History</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Vehicle Specifications */}
            <div className="bg-[#0D1520] border border-[#1C2E42] hover:border-[#0E7FE0]/40 rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#0E7FE0]" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#0E7FE0]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Vehicle Specifications
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/40 text-[10px] font-mono font-bold">
                    VAHAN 4.0
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Make & Model:</span>
                      <span className="font-bold text-white text-[11px]">
                        Mahindra Scorpio-N
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Mfg. Year:</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        2024 (BS6 Phase 2)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Body Color:</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        Everest White (Pearl)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8FA8C0] text-[10px] block">Engine & Fuel:</span>
                      <span className="text-[#C5D5E6] font-medium text-[11px]">
                        Diesel 2.2L mHawk (2198 cc)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Engine Number:</span>
                    <span className="text-[#C5D5E6] font-mono text-[11px] tracking-wider">
                      MHWK22E98412
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Chassis / VIN:</span>
                    <span className="text-[#C5D5E6] font-mono text-[11px] tracking-wider">
                      MA1TA2WK8P7B14982
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8FA8C0] text-[10px] block">Registered RTO:</span>
                    <span className="text-[#0E7FE0] text-[11px]">
                      GJ-01 Ahmedabad West (Subhash Bridge)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1C2E42]">
                <button
                  onClick={() => setActiveTab('specs')}
                  className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#0E7FE0] hover:text-white transition-colors cursor-pointer"
                >
                  <span>View RTO & Compliance</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── BOTTOM ROW: 3 TACTICAL CARDS ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 4: Recent Sightings */}
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#8FA8C0]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Recent Sightings
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#0E7FE0] bg-[#121E2E] px-2 py-0.5 rounded border border-[#233A52]">
                    107 Sightings
                  </span>
                </div>

                {/* Vertical Timeline List */}
                <div className="space-y-3">
                  {[
                    {
                      time: '14:45:12',
                      cam: 'GNLU Main Gate (CAM08)',
                      speed: '42 km/h',
                      heading: 'Southbound',
                      thumb: './images/cam_gnlu_gate_thumb.jpg',
                      status: 'Live',
                    },
                    {
                      time: '13:20:45',
                      cam: 'Sabarmati Riverfront (CAM07)',
                      speed: '58 km/h',
                      heading: 'South-West',
                      thumb: './images/cam_sabarmati_thumb.jpg',
                      status: 'Passed',
                    },
                    {
                      time: '11:05:19',
                      cam: 'GIFT City Road (CAM06)',
                      speed: '64 km/h',
                      heading: 'Westbound',
                      thumb: './images/cam_gift_city_thumb.jpg',
                      status: 'Passed',
                    },
                    {
                      time: '09:15:02',
                      cam: 'SG Highway Toll (CAM04)',
                      speed: '35 km/h',
                      heading: 'Northbound',
                      thumb: './images/cam_sg_highway_thumb.jpg',
                      status: 'Passed',
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveEvidenceIndex(idx)}
                      className={`flex items-center gap-3 p-2 rounded border transition-colors cursor-pointer ${
                        activeEvidenceIndex === idx
                          ? 'bg-[#121E2E] border-[#0E7FE0]'
                          : 'bg-[#090E16] border-[#1C2E42] hover:border-[#2B4360]'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-10 rounded overflow-hidden bg-[#070B10] border border-[#233A52] shrink-0">
                        <img
                          src={s.thumb}
                          alt={s.cam}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate">{s.cam}</span>
                          <span className="text-[10px] text-[#0E7FE0] font-semibold">{s.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#8FA8C0] mt-0.5">
                          <span>Speed: {s.speed}</span>
                          <span>•</span>
                          <span>{s.heading}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1C2E42]">
                <button
                  onClick={() => setActiveTab('sightings')}
                  className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#0E7FE0] hover:text-white transition-colors cursor-pointer"
                >
                  <span>View All 107 Sightings</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 5: Latest Evidence */}
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0E7FE0]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white truncate">
                      Latest Evidence
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveEvidenceIndex((prev) =>
                          prev === 0 ? evidenceFrames.length - 1 : prev - 1
                        )
                      }
                      className="p-1 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white transition-colors"
                      title="Previous Frame"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-[#8FA8C0] px-1">
                      {activeEvidenceIndex + 1}/{evidenceFrames.length}
                    </span>
                    <button
                      onClick={() =>
                        setActiveEvidenceIndex((prev) =>
                          prev === evidenceFrames.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="p-1 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white transition-colors"
                      title="Next Frame"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Large CCTV Snapshot View */}
                <div className="relative rounded-lg overflow-hidden border border-[#233A52] bg-black h-[175px] group">
                  <img
                    src={evidenceFrames[activeEvidenceIndex].image}
                    alt={evidenceFrames[activeEvidenceIndex].title}
                    className="w-full h-full object-cover"
                  />

                  {/* Top Camera Tag Overlay */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-white/90 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
                      <span>{evidenceFrames[activeEvidenceIndex].title}</span>
                    </div>
                    <span>{evidenceFrames[activeEvidenceIndex].timestamp}</span>
                  </div>

                  {/* Simulated Tactical ANPR Bounding Box */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#00C875] bg-[#00C875]/10 px-3 py-1 rounded-[2px] shadow-[0_0_10px_#00C875]">
                    <div className="text-[9px] font-mono font-black text-black bg-[#00C875] px-1 py-0.2 rounded-[1px] inline-block mb-0.5">
                      ANPR MATCH • {evidenceFrames[activeEvidenceIndex].conf}
                    </div>
                    <div className="font-mono font-bold text-white text-xs tracking-wider">
                      {cleanPlate}
                    </div>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setIsPhotoZoomOpen(true)}
                    className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 hover:bg-[#0E7FE0] border border-white/20 text-white transition-colors"
                    title="Fullscreen Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-4 gap-1.5">
                  {evidenceFrames.map((f, idx) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveEvidenceIndex(idx)}
                      className={`h-9 rounded overflow-hidden border transition-all cursor-pointer ${
                        activeEvidenceIndex === idx
                          ? 'border-[#0E7FE0] ring-1 ring-[#0E7FE0]'
                          : 'border-[#1C2E42] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={f.image}
                        alt={f.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Evidence Hash */}
                <div className="text-[10px] font-mono text-[#8FA8C0] truncate bg-[#090E16] p-1.5 rounded border border-[#1C2E42]">
                  <span className="text-[#0E7FE0] font-semibold">SHA-256: </span>
                  <span>{evidenceFrames[activeEvidenceIndex].hash}</span>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-[#1C2E42]">
                <button
                  onClick={handlePreserveEvidence}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#00C875]/15 hover:bg-[#00C875]/25 text-[#00C875] border border-[#00C875]/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Preserve Section 65B Evidence</span>
                </button>
              </div>
            </div>

            {/* Card 6: Last Known Location */}
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF3B3B]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Last Known Location
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#00C875] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
                    3m ago
                  </span>
                </div>

                {/* Mini Leaflet Map Container */}
                <div className="relative h-[175px] rounded-lg overflow-hidden border border-[#233A52] bg-[#070B10]">
                  <MapContainer
                    center={[23.1585, 72.6288]}
                    zoom={13}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    dragging={true}
                    attributionControl={false}
                    className="w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      subdomains="abcd"
                      maxZoom={19}
                      attribution=""
                    />

                    {/* Route Trajectory */}
                    <Polyline
                      positions={[
                        [23.0305, 72.5178], // SG Highway
                        [23.058, 72.585],  // Sabarmati
                        [23.195, 72.684],  // GIFT City
                        [23.1585, 72.6288], // GNLU Gate (Current)
                      ]}
                      color="#0E7FE0"
                      weight={3}
                      opacity={0.8}
                      dashArray="4, 6"
                    />

                    {/* Current Position Marker */}
                    <Marker position={[23.1585, 72.6288]} icon={createTacticalPinIcon()}>
                      <Popup className="tactical-popup">
                        <div className="p-1 font-mono text-xs text-black">
                          <strong>GNLU Main Gate CAM08</strong>
                          <div>Speed: 42 km/h • 14:45 IST</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                  {/* Map Coordinate Overlay Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs border border-white/20 text-[9px] font-mono px-2 py-0.5 rounded text-white z-[1000] pointer-events-none">
                    23.1585° N, 72.6288° E • Gandhinagar
                  </div>
                </div>

                {/* Location Readout */}
                <div className="text-xs font-mono space-y-1 bg-[#090E16] p-2 rounded border border-[#1C2E42]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8FA8C0] text-[10px]">Interception Node:</span>
                    <span className="text-white font-bold text-[11px]">GNLU Gate CAM08</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8FA8C0] text-[10px]">Corridor Direction:</span>
                    <span className="text-[#0E7FE0] text-[11px]">PDPU-GNLU Gandhinagar Road</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-[#1C2E42]">
                <button
                  onClick={() => navigate(`/journey?plate=${cleanPlate}`)}
                  className="w-full flex items-center justify-between text-xs font-mono font-medium text-[#0E7FE0] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Open In Full Journey View</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: SIGHTINGS ─── */}
      {activeTab === 'sightings' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Chronological ANPR Sighting Log
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Total 107 verified camera captures across Gujarat State Surveillance Network
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/journey?plate=${cleanPlate}`)}
                className="px-3 py-1.5 rounded bg-[#0E7FE0] text-white text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Route className="w-3.5 h-3.5" />
                <span>Trace Full Route Map</span>
              </button>
            </div>
          </div>

          {/* Sightings Table */}
          <div className="overflow-x-auto rounded border border-[#1C2E42]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0A1017] text-[#8FA8C0] border-b border-[#1C2E42] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Capture Frame</th>
                  <th className="p-3">Camera Node</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Speed</th>
                  <th className="p-3">LPR Confidence</th>
                  <th className="p-3">Forensic Hash</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2E42]">
                {[
                  {
                    cam: 'GNLU Main Gate CAM08',
                    loc: 'Gandhinagar Corridor',
                    ts: '12 Mar 2026, 14:45:12 IST',
                    speed: '42 km/h',
                    conf: '98.6%',
                    hash: 'e3b0c442...b855',
                    thumb: './images/cam_gnlu_gate_thumb.jpg',
                  },
                  {
                    cam: 'Sabarmati Riverfront CAM07',
                    loc: 'Riverfront Promenade West',
                    ts: '12 Mar 2026, 13:20:45 IST',
                    speed: '58 km/h',
                    conf: '97.2%',
                    hash: '8f434346...aa4',
                    thumb: './images/cam_sabarmati_thumb.jpg',
                  },
                  {
                    cam: 'GIFT City Road CAM06',
                    loc: 'Underpass East Entry',
                    ts: '12 Mar 2026, 11:05:19 IST',
                    speed: '64 km/h',
                    conf: '99.1%',
                    hash: '3a7bd3e2...4f1b',
                    thumb: './images/cam_gift_city_thumb.jpg',
                  },
                  {
                    cam: 'SG Highway Toll CAM04',
                    loc: 'SG Highway Plaza Lane 3',
                    ts: '12 Mar 2026, 09:15:02 IST',
                    speed: '35 km/h',
                    conf: '96.4%',
                    hash: 'c249a50a...6451',
                    thumb: './images/cam_sg_highway_thumb.jpg',
                  },
                  {
                    cam: 'Vastrapur Lake Junction CAM02',
                    loc: 'Alpha One Circle',
                    ts: '11 Mar 2026, 21:10:33 IST',
                    speed: '28 km/h',
                    conf: '97.8%',
                    hash: '77a94f1c...8189',
                    thumb: './images/cam_vastrapur.jpg',
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#121E2E] transition-colors">
                    <td className="p-3">
                      <div className="w-14 h-9 rounded overflow-hidden border border-[#233A52] bg-black">
                        <img src={row.thumb} alt={row.cam} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <div>{row.cam}</div>
                      <div className="text-[10px] text-[#8FA8C0]">{row.loc}</div>
                    </td>
                    <td className="p-3 text-[#C5D5E6]">{row.ts}</td>
                    <td className="p-3 text-[#FF8C00] font-bold">{row.speed}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30 text-[10px] font-bold">
                        {row.conf}
                      </span>
                    </td>
                    <td className="p-3 text-[#8FA8C0] text-[10px] font-mono">{row.hash}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={handlePreserveEvidence}
                        className="px-2.5 py-1 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#0E7FE0] border border-[#233A52] text-[11px] font-mono cursor-pointer"
                      >
                        Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: OWNER & ADDRESS ─── */}
      {activeTab === 'owner' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                VAHAN 4.0 Verified Owner Profile
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Official Ministry of Road Transport and Highways (MoRTH) Database Record
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              UIDAI & VAHAN SYNCHRONIZED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-3">
              <h3 className="text-xs font-bold text-[#0E7FE0] uppercase">Identity & Contact</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Full Legal Name:</span>
                  <span className="font-bold text-white text-sm">Shailesh Ramanlal Patel</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Father's / Husband's Name:</span>
                  <span className="text-[#C5D5E6]">Ramanlal Keshavlal Patel</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Registered Mobile Number:</span>
                  <span className="text-[#00C875] font-semibold">+91 98250 48192 (Aadhaar Verified)</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Aadhaar Number (UIDAI):</span>
                  <span className="text-[#C5D5E6]">•••• •••• 4912 (Biometrics on file)</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">PAN Number:</span>
                  <span className="text-[#C5D5E6]">ABCPS••••K</span>
                </div>
              </div>
            </div>

            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-3">
              <h3 className="text-xs font-bold text-[#0E7FE0] uppercase">Registered Address & Jurisdictions</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Permanent Residential Address:</span>
                  <span className="text-[#C5D5E6] leading-relaxed block">
                    B-402, Shivalik Heights, Science City Road, Sola, Ahmedabad, Gujarat - 380060
                  </span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Local Police Station Jurisdiction:</span>
                  <span className="text-[#FF8C00] font-semibold">Sola High Court Police Station, Ahmedabad City</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Ownership Sequence:</span>
                  <span className="text-[#C5D5E6]">1st Owner (Acquired Brand New on 12-Jan-2024)</span>
                </div>
                <div>
                  <span className="text-[#8FA8C0] text-[10px] block">Financier / Hypothecation:</span>
                  <span className="text-[#C5D5E6]">HDFC Bank Ltd - Auto Loan Division (Active Lien)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: VEHICLE SPECS ─── */}
      {activeTab === 'specs' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Automotive Specifications & Compliance
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Chassis verification, engine telemetry, FASTag, and RTO tax records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <h3 className="text-xs font-bold text-[#0E7FE0] uppercase">Engine & Drivetrain</h3>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Engine Number:</span>
                <span className="font-bold text-white">MHWK22E98412</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Displacement:</span>
                <span className="text-[#C5D5E6]">2198 cc (2.2L mHawk Turbo Diesel)</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Horsepower / Torque:</span>
                <span className="text-[#C5D5E6]">175 PS @ 3500 rpm / 400 Nm</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Transmission:</span>
                <span className="text-[#C5D5E6]">6-Speed Torque Converter 4WD</span>
              </div>
            </div>

            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <h3 className="text-xs font-bold text-[#0E7FE0] uppercase">Chassis & Body</h3>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Chassis VIN:</span>
                <span className="font-bold text-white">MA1TA2WK8P7B14982</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Body Color:</span>
                <span className="text-[#C5D5E6]">Everest White (High Pearl Finish)</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Seating Capacity:</span>
                <span className="text-[#C5D5E6]">7 Seater (Captain Seats)</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Unladen Weight:</span>
                <span className="text-[#C5D5E6]">2,150 kg</span>
              </div>
            </div>

            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <h3 className="text-xs font-bold text-[#0E7FE0] uppercase">RTO Compliance & Validity</h3>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">FASTag Tag ID:</span>
                <span className="text-[#00C875] font-semibold">34161FA8203248901289</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Insurance Company:</span>
                <span className="text-[#C5D5E6]">ICICI Lombard General Insurance</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">Insurance Valid Till:</span>
                <span className="text-[#00C875]">11-Jan-2027 (Active)</span>
              </div>
              <div>
                <span className="text-[#8FA8C0] text-[10px] block">PUCC Certificate:</span>
                <span className="text-[#00C875]">GJ012026PUCC8192 (Valid)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: CASES & FIRS ─── */}
      {activeTab === 'cases' && (
        <div className="bg-[#0D1520] border border-[#FF3B3B]/40 rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#FF3B3B] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                CCTNS Police Investigation Records
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Crime and Criminal Tracking Network & Systems • Ahmedabad City Police
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/40 text-xs font-mono font-bold">
              CASE STATUS: ACTIVE HUNT
            </span>
          </div>

          <div className="bg-[#080D14] p-4 rounded-lg border border-[#FF3B3B]/30 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">FIR No. CR/2026/0418</span>
              <span className="text-[#FF3B3B] font-bold">WARRANT NO: NBW-2026-8819</span>
            </div>

            <div className="space-y-1 text-[#C5D5E6]">
              <div><strong>Crime Type:</strong> Kidnapping for Extortion & Armed Robbery</div>
              <div><strong>Applicable Laws:</strong> Sections 364A, 386, 120B, 34 Indian Penal Code / Bharatiya Nyaya Sanhita</div>
              <div><strong>Police Station:</strong> Navrangpura Police Station, Crime Branch Zone 1</div>
              <div><strong>Investigating Officer:</strong> ACP Digvijay Singh Jadeja (Mob: +91 99251 00234)</div>
              <div><strong>Summary of Allegations:</strong> Target vehicle {cleanPlate} was observed fleeing from C.G. Road commercial complex after an extortion confrontation on 10 Mar 2026. Warrant issued by Additional Chief Metropolitan Magistrate Court #4, Ahmedabad.</div>
            </div>

            <div className="pt-2 border-t border-[#1C2E42] flex items-center justify-between">
              <span className="text-[#8FA8C0]">Vehicle Status: Seizure On Sight Authorized</span>
              <button
                onClick={handleDispatchAlert}
                className="px-3 py-1.5 rounded bg-[#FF3B3B] hover:bg-red-600 text-white font-bold transition-colors cursor-pointer"
              >
                Dispatch Intercept Squad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: PHOTOS & EVIDENCE ─── */}
      {activeTab === 'evidence' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Forensic ANPR Photography & Evidence Vault
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Section 65B Indian Evidence Act compliant tamper-proof snapshots
              </p>
            </div>
            <button
              onClick={handlePreserveEvidence}
              className="px-3 py-1.5 rounded bg-[#00C875] hover:bg-emerald-600 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Export Section 65B Bundle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {evidenceFrames.map((ev, i) => (
              <div
                key={ev.id}
                className="bg-[#080D14] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-36 bg-black">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-white px-1.5 py-0.5 rounded border border-white/20">
                    {ev.timestamp.split(' ')[2]}
                  </div>
                </div>

                <div className="p-3 font-mono text-xs space-y-1.5">
                  <div className="font-bold text-white truncate">{ev.title}</div>
                  <div className="text-[10px] text-[#8FA8C0] truncate">{ev.location}</div>
                  <div className="text-[9px] text-[#0E7FE0] truncate">SHA: {ev.hash.slice(0, 16)}...</div>

                  <button
                    onClick={() => {
                      setActiveEvidenceIndex(i);
                      handlePreserveEvidence();
                    }}
                    className="w-full mt-2 py-1 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#0E7FE0] border border-[#233A52] text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Inspect Hash Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: LIVE TRAFFIC ─── */}
      {activeTab === 'traffic' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Live Traffic & Patrol Intercept Corridors
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Real-time congestion, traffic lights status, and nearby PCR intercept units
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <span className="text-[10px] uppercase text-[#8FA8C0]">Current Junction</span>
              <div className="font-bold text-white text-sm">GNLU Gate - Bhaijipura Cross Road</div>
              <div className="text-[#00C875]">Traffic Density: Normal (32 km/h avg)</div>
              <div className="text-[#8FA8C0] text-[11px]">Next Intersection: PDPU Bridge (1.2 km)</div>
            </div>

            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <span className="text-[10px] uppercase text-[#8FA8C0]">Closest Patrol Unit</span>
              <div className="font-bold text-[#FF8C00] text-sm">PCR Van #14 (Koba Circle)</div>
              <div className="text-white">ETA to Intercept: 3 mins 45 secs</div>
              <div className="text-[#8FA8C0] text-[11px]">Officer: Sub-Inspector M. Rathod</div>
            </div>

            <div className="bg-[#080D14] p-4 rounded-lg border border-[#1C2E42] space-y-2">
              <span className="text-[10px] uppercase text-[#8FA8C0]">Predicted Vector</span>
              <div className="font-bold text-[#0E7FE0] text-sm">Koba - Gandhinagar Highway</div>
              <div className="text-white">Probability: 84.5%</div>
              <div className="text-[#8FA8C0] text-[11px]">Alternative: Infocity Bypass</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: NOTES ─── */}
      {activeTab === 'notes' && (
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42]">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Officer Investigative Notes
              </h2>
              <p className="text-xs text-[#8FA8C0] mt-0.5">
                Confidential case notes recorded by surveillance duty officers
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#080D14] p-3 rounded border border-[#1C2E42] space-y-1">
              <div className="flex items-center justify-between text-[#8FA8C0] text-[10px]">
                <span>Logged by: Duty Inspector R. Joshi (#8812)</span>
                <span>12 Mar 2026, 14:48 IST</span>
              </div>
              <p className="text-[#C5D5E6]">
                Confirmed visual match at GNLU Gate. Vehicle observed taking left turn towards PDPU road at 42 km/h. Driver wearing dark sunglasses, tinted front side glass.
              </p>
            </div>

            <div className="bg-[#080D14] p-3 rounded border border-[#1C2E42] space-y-1">
              <div className="flex items-center justify-between text-[#8FA8C0] text-[10px]">
                <span>Logged by: Surveillance Ops Desk</span>
                <span>10 Mar 2026, 20:15 IST</span>
              </div>
              <p className="text-[#C5D5E6]">
                Target added to critical alert watchlist following FIR CR/2026/0418. Alert triggers activated across all 12 SG Highway and Ring Road cameras.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. BOTTOM ACTION BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A1017]/95 backdrop-blur-md border-t border-[#1F334D] py-2.5 px-4 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => navigate(`/journey?plate=${cleanPlate}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0E7FE0] hover:bg-[#118bf2] text-white text-xs font-mono font-semibold transition-colors cursor-pointer shadow-[0_0_12px_rgba(14,127,224,0.4)]"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Trace Journey</span>
            </button>

            <button
              onClick={handlePreserveEvidence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00C875]/20 hover:bg-[#00C875]/30 text-[#00C875] border border-[#00C875]/40 text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Preserve Evidence</span>
            </button>

            <button
              onClick={() => navigate('/watchlist')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FF8C00]/15 hover:bg-[#FF8C00]/25 text-[#FF8C00] border border-[#FF8C00]/40 text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Check in Watchlist</span>
            </button>

            <button
              onClick={() => navigate(`/investigation?plate=${cleanPlate}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Search Similar Vehicles</span>
            </button>

            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
          </div>

          {/* Right Critical Action: Dispatch Patrol Alert */}
          <div>
            <button
              onClick={handleDispatchAlert}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#FF3B3B] hover:bg-red-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(255,59,59,0.5)] cursor-pointer animate-pulse"
            >
              <Siren className="w-4 h-4" />
              <span>🚨 Dispatch Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      {/* Evidence Export Modal */}
      <EvidenceExportModal
        evidence={selectedEvidenceModal}
        isOpen={!!selectedEvidenceModal}
        onClose={() => setSelectedEvidenceModal(null)}
      />

      {/* Photo Enlarge Zoom Modal */}
      {isPhotoZoomOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPhotoZoomOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-[#0A1017] border border-[#1F334D] rounded-xl overflow-hidden p-2">
            <img
              src="./images/vehicle_scorpio_crop.jpg"
              alt="Enlarged Vehicle"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded"
            />
            <div className="p-3 text-center text-xs font-mono text-[#8FA8C0]">
              White Mahindra Scorpio-N Z8L • Plate: <strong className="text-white">{cleanPlate}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VehicleDetailsPage;
