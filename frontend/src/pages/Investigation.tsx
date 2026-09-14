import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { VehicleSightingCard } from '../components/vehicles/VehicleSightingCard';
import { JourneyMap } from '../components/vehicles/JourneyMap';
import { EvidenceExportModal } from '../components/evidence/EvidenceExportModal';
import { vehiclesApi } from '../api/vehicles';
import { evidenceApi } from '../api/evidence';
import { useCameras } from '../hooks/useCameras';
import { Sighting, VehicleJourney, Evidence } from '../types';
import { Search, Route, Compass, FileText, User } from 'lucide-react';
import { VehicleDossierModal } from '../components/vehicles/VehicleDossierModal';
import { toast } from 'sonner';

export const Investigation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [plateInput, setPlateInput] = useState(searchParams.get('plate') || 'GJ01AB1234');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [journey, setJourney] = useState<VehicleJourney | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [preservedEvidenceModal, setPreservedEvidenceModal] = useState<Evidence | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const searchIdRef = useRef(0);

  const { data: cameras = [] } = useCameras();

  const performSearch = async (plateToSearch: string) => {
    if (!plateToSearch.trim()) {
      setSightings([]);
      setJourney(null);
      setSelectedSighting(null);
      return;
    }
    const currentSearchId = ++searchIdRef.current;
    setIsLoading(true);
    try {
      const clean = plateToSearch.replace(/\s/g, '').toUpperCase();
      const [sightingsRes, journeyRes] = await Promise.all([
        vehiclesApi.search({
          plate: clean,
          vehicle_class: selectedVehicleClass !== 'all' ? selectedVehicleClass : undefined,
          limit: 100,
        }),
        vehiclesApi.getJourney(clean),
      ]);

      if (currentSearchId !== searchIdRef.current) return;

      if (!sightingsRes.items || sightingsRes.items.length === 0) {
        setSightings([]);
        setJourney(null);
        setSelectedSighting(null);
      } else {
        setSightings(sightingsRes.items);
        setJourney(journeyRes);
        setSelectedSighting(sightingsRes.items[0]);
      }
    } catch (e: any) {
      if (currentSearchId !== searchIdRef.current) return;
      setSightings([]);
      setJourney(null);
      setSelectedSighting(null);
      toast.error(e.message || 'Search failed');
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const urlPlate = searchParams.get('plate');
    if (urlPlate) {
      setPlateInput(urlPlate);
      performSearch(urlPlate);
    } else {
      performSearch('GJ01AB1234');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.get('plate') === plateInput) performSearch(plateInput);
    else setSearchParams({ plate: plateInput });
  };

  const handlePreserveEvidence = async (sighting: Sighting) => {
    try {
      const res = await evidenceApi.preserve(sighting.id, undefined, `CASE-INV-${sighting.plate_text}`);
      toast.success(`Evidence preserved for plate ${sighting.plate_text}. SHA-256 seal created.`);
      setPreservedEvidenceModal(res);
    } catch (err: any) {
      toast.error(err.message || 'Preservation failed');
    }
  };

  return (
    <div className="space-y-3 pb-4">
      {/* ─── TOP HEADER WITH INVESTIGATION EYEBROW (COMPACT) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C2E42]">
        <div>
          {/* USER REQUIREMENT: Vehicle Cross के ऊपर Investigation लिख दो */}
          <div className="text-[11px] font-mono font-bold text-[#0E7FE0] tracking-widest uppercase flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7FE0]" />
            <span>INVESTIGATION</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Vehicle Cross-Camera Trajectory Search</span>
          </h1>
          <p className="text-xs text-[#8FA8C0]">
            Forensic sighting correlation & automated movement reconstruction across 15 urban CCTV nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<User className="w-3.5 h-3.5 text-[#00C875]" />}
            onClick={() => setIsDossierOpen(true)}
          >
            Vahan Dossier
          </Button>
          {journey && (
            <Button
              variant="primary"
              size="sm"
              icon={<Route className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/journey?plate=${encodeURIComponent(journey.plate_text)}`)}
            >
              Journey Replay ▶
            </Button>
          )}
        </div>
      </div>

      {/* ─── UNIFIED COMPACT SEARCH & FILTER BAR (MOVED UP) ─── */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs shadow-md"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Plate Search Input */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              placeholder="Registration Plate, e.g. GJ01AB1234"
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded font-mono uppercase font-bold text-white text-xs focus:outline-none focus:border-[#0E7FE0]"
            />
          </div>

          {/* Vehicle Category Filter */}
          <select
            value={selectedVehicleClass}
            onChange={(e) => setSelectedVehicleClass(e.target.value)}
            className="px-2.5 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded text-white font-mono text-xs focus:outline-none"
          >
            <option value="all">All Classes</option>
            <option value="car">Car / Light Vehicle</option>
            <option value="truck">Commercial / Heavy</option>
            <option value="bus">Bus / Transit</option>
            <option value="motorcycle">Two-wheeler</option>
          </select>

          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Query Grid
          </Button>
        </div>

        {/* Quick Sample Plate Targets */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#8FA8C0] text-[10px] uppercase">TARGETS:</span>
          {['GJ01AB1234', 'UP32PQ6677', 'GJ05CD5678'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPlateInput(p);
                setSearchParams({ plate: p });
              }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                plateInput === p
                  ? 'bg-[#0E7FE0]/20 text-[#0E7FE0] border-[#0E7FE0]/50 font-bold'
                  : 'bg-[#121E2E] text-white/70 border-[#1C2E42] hover:text-white hover:border-white/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* ─── COMPACT JOURNEY STATS BANNER ─── */}
      {journey && journey.stops.length >= 2 && (
        <div className="px-3 py-2 bg-[#121E2E] border border-[#0E7FE0]/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#0E7FE0]" />
            <span className="font-semibold text-white">
              {journey.plate_text}: Detected across {journey.unique_cameras} CCTV nodes
            </span>
            <span className="text-[#8FA8C0] font-mono text-[11px]">
              · {journey.total_duration_mins} mins travel · Est. {journey.estimated_distance_km} km
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/vehicles/details/${encodeURIComponent(journey.plate_text)}`)}
              className="text-[#0E7FE0] hover:underline font-mono text-[11px] font-bold flex items-center gap-1"
            >
              <FileText size={12} />
              <span>Full Dossier</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── RESULTS WORKSPACE: SIGHTINGS TIMELINE + REAL CARTO MAP ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-230px)] min-h-[580px]">
        {/* Left Chronological Sightings Panel */}
        <div className="lg:col-span-4 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3 flex flex-col h-full overflow-hidden shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Chronological Sightings
              </span>
              <span className="text-[11px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-1.5 py-0.5 rounded font-bold">
                {sightings.length} Found
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0]">
              {plateInput}
            </span>
          </div>

          {/* SIGHTINGS LIST: generous bottom padding pb-8 so nothing is squished */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 pb-8">
            {isLoading ? (
              <div className="text-center py-20 text-xs text-[#8FA8C0]">
                Scanning surveillance database...
              </div>
            ) : sightings.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Search className="w-8 h-8 mx-auto text-[#4D6B85] mb-2" />
                <h4 className="text-sm font-semibold text-white">No sightings found</h4>
                <p className="text-xs text-[#8FA8C0] mt-1">
                  No camera detections for {plateInput}. Try a sample target above.
                </p>
              </div>
            ) : (
              sightings.map((s) => (
                <VehicleSightingCard
                  key={s.id}
                  sighting={s}
                  isSelected={selectedSighting?.id === s.id}
                  onSelect={(sighting) => setSelectedSighting(sighting)}
                  onPreserveEvidence={handlePreserveEvidence}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Map Panel */}
        <div className="lg:col-span-8 bg-[#0D1520] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col h-full shadow-lg">
          <div className="p-2.5 border-b border-[#1C2E42] flex items-center justify-between text-xs bg-[#0A101A]">
            <span className="font-mono text-[#8FA8C0]">
              SURVEILLANCE GEOSPATIAL RECONSTRUCTION
            </span>
            <span className="font-mono text-[#00C875] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
              <span>CARTODB DARK MATTER ACTIVE</span>
            </span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <JourneyMap
              stops={journey?.stops || []}
              pathCoordinates={journey?.path_coordinates || []}
              selectedStopIndex={
                selectedSighting
                  ? journey?.stops.findIndex((st) => st.sighting_id === selectedSighting.id)
                  : undefined
              }
              onStopSelect={(idx) => {
                const stop = journey?.stops[idx];
                if (stop) {
                  const matching = sightings.find((s) => s.id === stop.sighting_id);
                  if (matching) setSelectedSighting(matching);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Preserved Evidence Modal */}
      <EvidenceExportModal
        evidence={preservedEvidenceModal}
        isOpen={!!preservedEvidenceModal}
        onClose={() => setPreservedEvidenceModal(null)}
      />

      {/* VAHAN & CCTNS VEHICLE OWNER DOSSIER MODAL */}
      <VehicleDossierModal
        plate={plateInput}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
};
