import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { JourneyMap } from '../components/vehicles/JourneyMap';
import { LicensePlate } from '../components/ui/LicensePlate';
import { ConfidenceBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { vehiclesApi } from '../api/vehicles';
import { evidenceApi } from '../api/evidence';
import { apiClient } from '../api/client';
import { EvidenceExportModal } from '../components/evidence/EvidenceExportModal';
import { VehicleDossierModal } from '../components/vehicles/VehicleDossierModal';
import { VehicleJourney as JourneyType, Evidence } from '../types';
import { formatTimestamp } from '../utils/format';
import {
  Route,
  MapPin,
  Clock,
  FileText,
  Search,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  ShieldCheck,
  Compass,
  ArrowRight,
  Eye,
  Bot,
  ExternalLink,
  User,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const PRESET_PLATES = [
  { plate: 'UP32PQ6677', label: 'Watchlist Target (Active Warrant)', alert: true },
  { plate: 'GJ01AB1234', label: 'Ahmedabad Commuter', alert: false },
  { plate: 'GJ05CD5678', label: 'Surat Express Corridor', alert: false },
  { plate: 'DL10XY9090', label: 'Inter-State Transit', alert: false },
  { plate: 'RJ14GH3456', label: 'Commercial Ring Road', alert: false },
];

export const VehicleJourney: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const plateParam = (searchParams.get('plate') || 'UP32PQ6677').toUpperCase().replace(/\s+/g, '');

  const [searchInput, setSearchInput] = useState(plateParam);
  const [journey, setJourney] = useState<JourneyType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);
  const [evidenceModal, setEvidenceModal] = useState<Evidence | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Playback Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);

  // AI Copilot Dossier Drawer
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotAnalysis, setCopilotAnalysis] = useState<string | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Sync search input when param changes
  useEffect(() => {
    setSearchInput(plateParam);
    setIsPlaying(false);
    setSelectedStopIdx(0);
    setIsLoading(true);

    vehiclesApi
      .getJourney(plateParam)
      .then((data) => {
        setJourney(data);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to reconstruct journey');
        setIsLoading(false);
      });
  }, [plateParam]);

  // Automated Playback Interval
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && journey && journey.stops.length > 0) {
      const intervalMs = Math.max(900, 2400 / playbackSpeed);
      timer = setInterval(() => {
        setSelectedStopIdx((prev) => {
          const next = prev + 1;
          if (next >= journey.stops.length) {
            setIsPlaying(false);
            toast.info('Trajectory simulation completed.');
            return prev;
          }
          return next;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, journey, playbackSpeed]);

  // Auto-scroll timeline when selected stop changes
  useEffect(() => {
    if (stopRefs.current[selectedStopIdx]) {
      stopRefs.current[selectedStopIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedStopIdx]);

  const handleSelectPlate = (plate: string) => {
    setSearchParams({ plate });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase().replace(/\s+/g, '');
    if (clean) {
      setSearchParams({ plate: clean });
    }
  };

  const handleGenerateReport = async () => {
    if (!journey || journey.stops.length === 0) return;
    const targetStop = journey.stops[selectedStopIdx] || journey.stops[0];
    try {
      const res = await evidenceApi.preserve(
        targetStop.sighting_id,
        undefined,
        `CASE-JOURNEY-${journey.plate_text}`
      );
      setEvidenceModal(res);
      toast.success('Forensic journey evidence package generated.');
    } catch (e: any) {
      toast.error(e.message || 'Report generation failed');
    }
  };

  const handleRunCopilotAnalysis = async () => {
    if (!journey) return;
    setIsCopilotOpen(true);
    setIsCopilotLoading(true);
    try {
      const res = await apiClient<{ analysis: string; provider: string }>('/copilot/analyze', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Analyze the temporal trajectory, speed variations, and corridor movement pattern for vehicle ${journey.plate_text}. Highlight any anomalous travel gaps or rapid transits.`,
          plate_text: journey.plate_text,
          case_id: `JOURNEY-REC-${journey.plate_text}`,
        }),
      });
      setCopilotAnalysis(res.analysis);
    } catch (e: any) {
      toast.error(e.message || 'Copilot trajectory analysis failed');
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const selectedStop = journey?.stops[selectedStopIdx] || journey?.stops[0];
  const isWatchlistPlate = plateParam === 'UP32PQ6677' || plateParam === 'DL10XY9090';

  // Compute transit speed stats
  const avgSpeed =
    journey &&
    (journey.total_duration_mins ?? 0) > 0 &&
    (journey.estimated_distance_km ?? 0) > 0
      ? Math.round(
          journey.estimated_distance_km! /
            ((journey.total_duration_mins! || 1) / 60)
        )
      : 48;

  return (
    <div className="space-y-3.5 h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER BAR */}
      <div className="flex-shrink-0">
        <PageHeader
          title={`Vehicle Trajectory Reconstruction: ${plateParam}`}
          description="Chronological spatial tracking across Gujarat Sentinel CCTV nodes with speed and dwell telemetry."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={<User className="w-4 h-4 text-[#00C875]" />}
                onClick={() => setIsDossierOpen(true)}
              >
                Vehicle & Owner Dossier
              </Button>
              <Button
                variant="secondary"
                icon={<Bot className="w-4 h-4 text-[#0E7FE0]" />}
                onClick={handleRunCopilotAnalysis}
                disabled={!journey || journey.stops.length === 0}
              >
                AI Trajectory Dossier
              </Button>
              <Button
                variant="primary"
                icon={<FileText className="w-4 h-4" />}
                onClick={handleGenerateReport}
                disabled={!journey || journey.stops.length === 0}
              >
                Section 65B Evidence Report
              </Button>
            </div>
          }
        />
      </div>

      {/* QUICK PRESET SELECTOR & SEARCH BAR */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2.5 p-2 bg-[#0D1520] border border-[#1C2E42] rounded-[6px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#8FA8C0] uppercase mr-1">Quick Select:</span>
          {PRESET_PLATES.map((preset) => {
            const isActive = preset.plate === plateParam;
            return (
              <button
                key={preset.plate}
                onClick={() => handleSelectPlate(preset.plate)}
                className={`px-2.5 py-1 text-xs font-mono rounded-[4px] border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0E7FE0] text-white border-[#1A9FFF] shadow-[0_0_10px_rgba(14,127,224,0.35)] font-bold'
                    : 'bg-[#121E2E] text-[#8FA8C0] border-[#1C2E42] hover:text-white hover:border-[#2E4E70]'
                }`}
              >
                {preset.alert && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
                )}
                <span>{preset.plate}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Plate Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="ENTER PLATE (e.g. UP32PQ6677)"
              className="h-8 w-56 bg-[#080C12] border border-[#1C2E42] rounded-[4px] px-2.5 text-xs font-mono text-white placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0]"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-[#121E2E] hover:bg-[#0E7FE0] text-white border border-[#1C2E42] rounded-[4px] text-xs font-mono transition-colors flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {/* KPI METRIC STRIP */}
      {journey && (
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Target Plate */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between hover:border-[#0E7FE0] transition-colors group">
            <div className="flex items-center justify-between">
              <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">TARGET VEHICLE</span>
              <button
                onClick={() => setIsDossierOpen(true)}
                className="text-[9px] font-mono text-[#00C875] hover:text-white flex items-center gap-0.5 hover:underline font-bold"
              >
                <User className="w-2.5 h-2.5" />
                OWNER RC
              </button>
            </div>
            <div
              className="mt-1 cursor-pointer"
              onClick={() => setIsDossierOpen(true)}
              title="Click to inspect National Vahan & CCTNS owner dossier"
            >
              <LicensePlate plate={journey.plate_text} size="sm" />
            </div>
          </div>

          {/* Watchlist Threat */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between">
            <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">WATCHLIST STATUS</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold">
              {isWatchlistPlate ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B3B]" />
                  <span className="text-[#FF3B3B]">CRITICAL WARRANT</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C875]" />
                  <span className="text-[#00C875]">STANDARD RECORD</span>
                </>
              )}
            </div>
          </div>

          {/* Interceptions */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between">
            <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">INTERCEPTIONS</span>
            <span className="font-mono text-sm font-bold text-white mt-1">
              {journey.total_sightings} sightings
            </span>
          </div>

          {/* Unique Nodes */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between">
            <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">MONITORED JUNCTIONS</span>
            <span className="font-mono text-sm font-bold text-[#0E7FE0] mt-1">
              {journey.unique_cameras} CCTV nodes
            </span>
          </div>

          {/* Transit Distance */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between">
            <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">TOTAL DISTANCE</span>
            <span className="font-mono text-sm font-bold text-[#00C875] mt-1">
              ~{journey.estimated_distance_km} km
            </span>
          </div>

          {/* Estimated Transit Velocity */}
          <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[4px] flex flex-col justify-between">
            <span className="text-[#8FA8C0] font-mono text-[9px] uppercase">TRANSIT VELOCITY</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-sm font-bold text-[#1A9FFF]">
                {avgSpeed} km/h
              </span>
              <span className="text-[9px] font-mono text-[#8FA8C0]">
                {journey.total_duration_mins}m total
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT SCREEN: LEFT TIMELINE + RIGHT MAP (Strict 100% Height Containment) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* LEFT COLUMN: TIMELINE + SELECTED STOP INSPECTOR */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] flex flex-col h-full min-h-0 overflow-hidden shadow-lg">
          {/* Timeline Header */}
          <div className="p-3 border-b border-[#1C2E42] bg-[#0A101A] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
              <Route className="w-4 h-4 text-[#0E7FE0]" />
              <span>CHRONOLOGICAL MOVEMENT SEQUENCE</span>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0]">
              {journey?.stops.length || 0} STOPS
            </span>
          </div>

          {/* Scrollable Timeline List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 pr-2">
            {isLoading ? (
              <div className="text-center py-24 text-xs font-mono text-[#8FA8C0] flex flex-col items-center gap-3">
                <span className="w-6 h-6 border-2 border-[#0E7FE0] border-t-transparent rounded-full animate-spin" />
                <span>Reconstructing CCTV journey path from telemetry...</span>
              </div>
            ) : !journey || journey.stops.length === 0 ? (
              <div className="text-center py-24 text-xs font-mono text-[#8FA8C0]">
                No recorded sightings for this vehicle plate in the active window.
              </div>
            ) : (
              journey.stops.map((stop, idx) => {
                const isSelected = selectedStopIdx === idx;
                const isFirst = idx === 0;
                const isLast = idx === journey.stops.length - 1;

                return (
                  <div
                    key={stop.sighting_id || idx}
                    ref={(el) => (stopRefs.current[idx] = el)}
                    className="relative"
                  >
                    {/* Inter-stop transit connector */}
                    {idx > 0 && (
                      <div className="flex items-center gap-2 my-1.5 pl-3.5">
                        <div className="w-0.5 h-4 bg-[#233A52]" />
                        {stop.dwell_time_mins && stop.dwell_time_mins > 0 ? (
                          <span className="text-[9px] font-mono text-[#FF8C00] bg-[#121E2E] px-2 py-0.5 rounded border border-[#1C2E42] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            +{stop.dwell_time_mins} mins transit gap
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-[#4D6B85]">
                            Direct transit
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stop Card */}
                    <div
                      onClick={() => setSelectedStopIdx(idx)}
                      className={`p-3 rounded-[5px] border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0E7FE0] bg-[#1F3050]/40 shadow-[0_0_14px_rgba(14,127,224,0.25)]'
                          : 'border-[#1C2E42] bg-[#0A101A] hover:border-[#2E4E70]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                              isFirst
                                ? 'bg-[#00C875] text-[#080C12]'
                                : isLast
                                ? 'bg-[#FF3B3B] text-white'
                                : 'bg-[#0E7FE0] text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {stop.camera_identifier}
                          </span>
                          {isFirst && (
                            <span className="text-[9px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/40 px-1 rounded">
                              ORIGIN
                            </span>
                          )}
                          {isLast && (
                            <span className="text-[9px] font-mono text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 px-1 rounded">
                              LAST SEEN
                            </span>
                          )}
                        </div>
                        <ConfidenceBadge confidence={stop.plate_conf} />
                      </div>

                      <div className="text-xs text-[#E8EFF7] font-semibold mb-0.5">
                        {stop.camera_name}
                      </div>
                      <div className="text-[11px] text-[#8FA8C0] mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#4D6B85]" />
                        <span>{stop.location_name}</span>
                      </div>

                      {/* Real Plate Crop Preview if Available */}
                      {stop.plate_crop_path && (
                        <div className="mb-2 p-1 bg-[#080C12] rounded border border-[#1C2E42] flex items-center justify-between">
                          <img
                            src={stop.plate_crop_path}
                            alt="Plate crop"
                            className="h-7 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-mono text-[9px] text-[#8FA8C0]">
                            EVIDENCE CAPTURE
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8FA8C0] pt-1.5 border-t border-[#1C2E42]">
                        <span>RECORDED TS</span>
                        <span className="text-white">{formatTimestamp(stop.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Stop Quick Inspector Footer */}
          {selectedStop && (
            <div className="p-3 bg-[#0A101A] border-t border-[#1C2E42] flex-shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-[#8FA8C0]">CURRENT FOCUS:</span>
                <span className="text-[#0E7FE0] font-bold">
                  {selectedStop.camera_identifier} ({selectedStopIdx + 1}/{journey?.stops.length})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium truncate max-w-[200px]">
                  {selectedStop.location_name}
                </span>
                <button
                  onClick={handleGenerateReport}
                  className="px-2.5 py-1 bg-[#0E7FE0]/20 hover:bg-[#0E7FE0]/30 border border-[#0E7FE0] text-[#1A9FFF] text-[10px] font-mono rounded-[3px] transition-colors"
                >
                  Preserve Stop Evidence
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MAP CONTAINER (Strictly Contained!) */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] flex flex-col h-full min-h-0 overflow-hidden shadow-lg">
          {/* Map Header */}
          <div className="p-3 border-b border-[#1C2E42] bg-[#0A101A] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
              <Compass className="w-4 h-4 text-[#00C875]" />
              <span>GUJARAT SURVEILLANCE RADAR GRID</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-[#8FA8C0]">ACTIVE VEHICLE:</span>
              <span className="text-[#00C875] font-bold">{plateParam}</span>
            </div>
          </div>

          {/* Map Viewport Wrapper: min-h-0 and flex-1 guarantee NO map overflow! */}
          <div className="flex-1 min-h-0 w-full h-full relative overflow-hidden bg-[#080C12]">
            <JourneyMap
              stops={journey?.stops || []}
              pathCoordinates={journey?.path_coordinates || []}
              selectedStopIndex={selectedStopIdx}
              onStopSelect={(idx) => setSelectedStopIdx(idx)}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
            />
          </div>
        </div>
      </div>

      {/* AI COPILOT TRAJECTORY DOSSIER DRAWER */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1520] border border-[#233A52] rounded-[8px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1C2E42] bg-[#0A101A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#0E7FE0]/20 border border-[#0E7FE0] flex items-center justify-center text-[#0E7FE0]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    AI FORENSIC TRAJECTORY DOSSIER: {plateParam}
                  </h3>
                  <span className="text-[10px] font-mono text-[#00C875]">
                    POWERED BY GOOGLE GEMINI 3.6 FLASH
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="text-[#8FA8C0] hover:text-white text-lg font-mono px-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs text-[#E8EFF7]">
              {isCopilotLoading ? (
                <div className="text-center py-20 flex flex-col items-center gap-3 text-[#8FA8C0]">
                  <span className="w-8 h-8 border-2 border-[#0E7FE0] border-t-transparent rounded-full animate-spin" />
                  <span>Generating Section 65B trajectory assessment via Gemini AI...</span>
                </div>
              ) : copilotAnalysis ? (
                <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-wrap">
                  {copilotAnalysis}
                </div>
              ) : (
                <div className="text-center py-12 text-[#8FA8C0]">
                  No analysis generated yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#1C2E42] bg-[#0A101A] flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCopilotOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCopilotOpen(false);
                  handleGenerateReport();
                }}
              >
                Generate Legal Evidence Hash
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE EXPORT MODAL */}
      <EvidenceExportModal
        evidence={evidenceModal}
        isOpen={!!evidenceModal}
        onClose={() => setEvidenceModal(null)}
      />

      {/* VAHAN & CCTNS VEHICLE OWNER DOSSIER MODAL */}
      <VehicleDossierModal
        plate={plateParam}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
};
